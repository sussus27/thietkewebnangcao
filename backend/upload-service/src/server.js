require('dotenv').config();

const express = require('express');
const { connectRabbitMQ } = require('./config/rabbitmq.config');

const uploadRoutes = require('./routes/upload.route');

const errorHandler = require('./middleware/error.middleware');
const AppError = require('./utils/error.util');

const app = express();

app.use(express.json());

app.use('/api/upload', uploadRoutes);
app.use((req, res, next) => { next( new AppError(404, 'ROUTE_NOT_FOUND', 'Route not found') ); });
app.use(errorHandler);

const PORT = 4003;

connectRabbitMQ()
    .then((channel) => channel.assertExchange('music.events', 'topic', { durable: true }))
    .then(() => {
        app.listen(PORT, () => {
            console.log(`Upload Service running on port ${PORT}`);
        });
    })
    .catch((error) => {
        console.error('Fail to start Upload Service:', error);
        process.exit(1);
    });
