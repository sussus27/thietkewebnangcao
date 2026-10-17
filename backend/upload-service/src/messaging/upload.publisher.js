const { getChannel } = require('../config/rabbitmq.config');
const AppError = require('../utils/error.util');

function publishUploadEvent(payload) {
    const channel = getChannel();

    if (!channel) 
        throw new AppError(503, 'BROKER_UNAVAILABLE', 'RabbitMQ channel is not ready');

    const published = channel.publish(
        'music.events',
        'file.uploaded',
        Buffer.from(JSON.stringify(payload)),
        {
            persistent: true,
            contentType: 'application/json'
        }
    );

    if (!published) 
        throw new AppError(503, 'BROKER_BACKPRESSURE', 'RabbitMQ buffer is full, retry later');
}

module.exports = {
    publishUploadEvent
};
