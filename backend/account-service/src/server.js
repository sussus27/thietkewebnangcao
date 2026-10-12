require('dotenv').config();

const express = require('express');
const { connectDB } = require('./config/db.config');

const authRoutes = require('./routes/auth.route');
const userRoutes = require('./routes/user.route');

const errorMiddleware = require('./middleware/error.middleware');
const AppError = require('./utils/error.util');

const app = express();

app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use((req, res, next) => { next( new AppError(404, 'ROUTE_NOT_FOUND', 'Route not found') ); });
app.use(errorMiddleware);

const PORT = 4001;

connectDB()
    .then(() => {
        app.listen(PORT, () => {
            console.log(`Account Service running on port ${PORT}`);
        });
    })
    .catch((error) => {
        console.error('Fail to start Account Service:', error);
        process.exit(1);
    });