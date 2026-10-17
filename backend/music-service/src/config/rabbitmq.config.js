const amqp = require('amqplib');

const RABBITMQ_URL = process.env.RABBITMQ_URL;

let connection = null;
let channel = null;

async function connectRabbitMQ() {
    connection = await amqp.connect(RABBITMQ_URL);
    channel = await connection.createChannel();

    connection.on('error', (error) => {
        console.error('RabbitMQ connection error:', error);
    });

    connection.on('close', () => {
        console.error('RabbitMQ connection closed');
    });

    console.log('RabbitMQ Connected');

    return channel;
}

function getConnection() {
    return connection;
}

function getChannel() {
    return channel;
}

module.exports = {
    connectRabbitMQ,
    getConnection,
    getChannel
};
