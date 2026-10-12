require('dotenv').config();

const express = require('express');
const { connectDB } = require('./config/db.config');

const authRoutes = require('./routes/auth.route');
const userRoutes = require('./routes/user.route');

const app = express();

app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);

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