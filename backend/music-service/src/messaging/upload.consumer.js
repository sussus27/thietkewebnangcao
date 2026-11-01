const { getConnection } = require('../config/rabbitmq.config');
const songService = require('../services/song.service');

const EXCHANGE = 'music.events';
const ROUTING_KEY = 'file.uploaded';
const QUEUE = 'music.file-uploaded';
const DLX = 'music.events.dlx';
const DLQ = 'music.file-uploaded.dlq';
const MAX_ATTEMPTS = 3;
const RETRY_DELAY_MS = 1000;

function parsePayload(content) {
    const payload = JSON.parse(content.toString());

    if (typeof payload.objectKey !== 'string' || payload.objectKey.trim() === '') {
        throw new Error('objectKey is required');
    }

    if (typeof payload.title !== 'string' || payload.title.trim() === '') {
        throw new Error('title is required');
    }

    if (!Number.isInteger(payload.durationSeconds) || payload.durationSeconds <= 0) {
        throw new Error('durationSeconds must be a positive integer');
    }

    return payload;
}

function messageOptions(properties) {
    return {
        persistent: true,
        contentType: 'application/json',
        headers: { ...properties.headers }
    };
}

async function rejectWithRetry(channel, message, error) {
    const attempt = Number(message.properties.headers?.['x-attempts'] ?? 0) + 1;
    const reason = String(error.code || error.message);
    const options = messageOptions(message.properties);

    options.headers['x-attempts'] = attempt;
    options.headers['x-error'] = reason;

    if (attempt >= MAX_ATTEMPTS) {
        console.error(`file.uploaded rejected permanently (${reason}) after ${attempt} attempts`);

        channel.sendToQueue(DLQ, message.content, options);
        channel.ack(message);

        return;
    }

    console.error(`file.uploaded rejected (${reason}), retrying attempt ${attempt}/${MAX_ATTEMPTS}`);

    await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS));

    channel.sendToQueue(QUEUE, message.content, options);
    channel.ack(message);
}

async function handleMessage(channel, message) {
    try {
        const payload = parsePayload(message.content);

        await songService.createSong({
            title: payload.title,
            audioUrl: payload.objectKey,
            coverUrl: payload.coverUrl || null,
            durationSeconds: payload.durationSeconds,
            artistIds: payload.artistIds || []
        });

        channel.ack(message);
    } catch (error) {
        if (error.code === 'SONG_ALREADY_EXISTS') {
            channel.ack(message);
            return;
        }

        await rejectWithRetry(channel, message, error);
    }
}

async function initUploadConsumer() {
    const channel = await getConnection().createChannel();

    await channel.assertExchange(EXCHANGE, 'topic', { durable: true });
    await channel.assertExchange(DLX, 'direct', { durable: true });

    await channel.assertQueue(DLQ, { durable: true });
    await channel.bindQueue(DLQ, DLX, QUEUE);

    await channel.assertQueue(QUEUE, {
        durable: true,
        arguments: {
            'x-dead-letter-exchange': DLX,
            'x-dead-letter-routing-key': QUEUE
        }
    });

    await channel.bindQueue(QUEUE, EXCHANGE, ROUTING_KEY);
    await channel.prefetch(1);

    await channel.consume(QUEUE, async (message) => {
        if (message === null) return;

        await handleMessage(channel, message);
    }, { noAck: false });

    console.log(`Consuming ${QUEUE}`);

    return channel;
}

module.exports = {
    initUploadConsumer
};
