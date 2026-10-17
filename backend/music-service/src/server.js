require('dotenv').config();

const express = require('express');
const { connectDB } = require('./config/db.config');

const songRoutes = require('./routes/song.route');
const artistRoutes = require('./routes/artist.route');
const playlistRoutes = require('./routes/playlist.route');

const errorHandler = require('./middleware/error.middleware');
const AppError = require('./utils/error.util');

const app = express();

app.use(express.json());

app.use('/api/songs', songRoutes);
app.use('/api/artists', artistRoutes);
app.use('/api/playlists', playlistRoutes);
app.use((req, res, next) => { next( new AppError(404, 'ROUTE_NOT_FOUND', 'Route not found') ); });
app.use(errorHandler);

const PORT = 4004;

connectDB()
    .then(() => {
        app.listen(PORT, () => {
            console.log(`Music Service running on port ${PORT}`);
        });
    })
    .catch((error) => {
        console.error('Fail to start Music Service:', error);
        process.exit(1);
    });
