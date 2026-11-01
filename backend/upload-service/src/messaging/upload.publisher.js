const { getChannel } = require('../config/rabbitmq.config');
const AppError = require('../utils/error.util');

async function publishUploadEvent(payload) {
    const channel = getChannel();

    if (!channel)
        throw new AppError(503, 'BROKER_UNAVAILABLE', 'RabbitMQ channel is not ready');

    await new Promise((resolve, reject) => {
        channel.publish(
            'music.events',
            'file.uploaded',
            Buffer.from(JSON.stringify(payload)),
            { persistent: true, contentType: 'application/json' },
            (error) => (error ? reject(error) : resolve())
        );
    });
}

module.exports = {
    publishUploadEvent
};
