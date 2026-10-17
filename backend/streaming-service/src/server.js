require('dotenv').config();

const express = require('express');

const streamRoutes = require('./routes/stream.route');

const errorHandler = require('./middleware/error.middleware');
const AppError = require('./utils/error.util');

const app = express();

app.get('/health', (req, res) => res.status(200).json({ status: 'ok' }));

app.use('/api/stream', streamRoutes);
app.use((req, res, next) => { next( new AppError(404, 'ROUTE_NOT_FOUND', 'Route not found') ); });
app.use(errorHandler);

const PORT = 4002;

app.listen(PORT, () => {
    console.log(`Streaming Service running on port ${PORT}`);
});
