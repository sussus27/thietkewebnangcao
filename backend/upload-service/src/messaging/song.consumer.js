const { getConnection } = require('../config/rabbitmq.config');
const { client, BUCKET } = require('../storage/minio.client');

const EXCHANGE = 'music.events';
const ROUTING_KEY = 'song.deleted';
const QUEUE = 'upload.storage';
const DLX = 'music.events.dlx';
const DLQ = 'upload.storage.dlq';

function parsePayload(content) {
    const payload = JSON.parse(content.toString());

    if (typeof payload.objectKey !== 'string' || payload.objectKey.trim() === '')
        throw new Error('objectKey is required');

    return payload;
}

async function handleMessage(channel, message) {
    try {
        const payload = parsePayload(message.content);

        await client.removeObject(BUCKET, payload.objectKey);

        channel.ack(message);
    } catch (error) {
        console.error(`song.deleted rejected (${error.code || error.message})`);
        channel.nack(message, false, false);
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
