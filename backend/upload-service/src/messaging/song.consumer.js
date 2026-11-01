const { getConnection } = require('../config/rabbitmq.config');
const { client, BUCKET } = require('../storage/minio.client');

const EXCHANGE = 'music.events';
const ROUTING_KEY = 'song.deleted';
const QUEUE = 'upload.storage';
const DLX = 'music.events.dlx';
const DLQ = 'upload.storage.dlq';
const MAX_ATTEMPTS = 3;
const RETRY_DELAY_MS = 1000;

function parsePayload(content) {
    const payload = JSON.parse(content.toString());

    if (typeof payload.objectKey !== 'string' || payload.objectKey.trim() === '') {
        throw new Error('objectKey is required');
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
        console.error(`song.deleted rejected permanently (${reason}) after ${attempt} attempts`);

        channel.sendToQueue(DLQ, message.content, options);
        channel.ack(message);

        return;
    }

    console.error(`song.deleted rejected (${reason}), retrying attempt ${attempt}/${MAX_ATTEMPTS}`);

    await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS));

    channel.sendToQueue(QUEUE, message.content, options);
    channel.ack(message);
}

async function handleMessage(channel, message) {
    try {
        const payload = parsePayload(message.content);

        await client.removeObject(BUCKET, payload.objectKey);

        channel.ack(message);
    } catch (error) {
        await rejectWithRetry(channel, message, error);
    }
}

async function initSongDeletedConsumer() {
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
    initSongDeletedConsumer
};
