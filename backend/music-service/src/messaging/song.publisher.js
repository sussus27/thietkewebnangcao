const { getChannel } = require('../config/rabbitmq.config');
const AppError = require('../utils/error.util');

async function publishSongDeleted(objectKey) {
    const channel = getChannel();

    if (!channel)
        throw new AppError(503, 'BROKER_UNAVAILABLE', 'RabbitMQ channel is not ready');

    await new Promise((resolve, reject) => {
        channel.publish(
            'music.events',
            'song.deleted',
            Buffer.from(JSON.stringify({ objectKey })),
            { persistent: true, contentType: 'application/json' },
            (error) => (error ? reject(error) : resolve())
        );
    });
}

module.exports = {
    publishSongDeleted
};
