const { client, BUCKET } = require('../storage/minio.client');
const AppError = require('../utils/error.util');

const MUSIC_SERVICE_URL = process.env.MUSIC_SERVICE_URL;
const EXPIRY_SECONDS = Number(process.env.PRESIGN_EXPIRY_SECONDS || 3600);

async function fetchSong(songId) {
    let response;

    try {
        response = await fetch(`${MUSIC_SERVICE_URL}/api/songs/${songId}`);
    } catch {
        throw new AppError(502, 'MUSIC_SERVICE_UNAVAILABLE', 'Cannot reach music-service');
    }

    if (response.status === 404)
        throw new AppError(404, 'SONG_NOT_FOUND', 'Song not found');

    if (!response.ok)
        throw new AppError(502, 'MUSIC_SERVICE_ERROR', 'music-service returned an unexpected status');

    return response.json();
}

async function streamSong(req, res, next) {
    try {
        const songId = Number.parseInt(req.params.songId, 10);

        if (!Number.isInteger(songId) || songId <= 0)
            throw new AppError(400, 'INVALID_SONG_ID', 'Song id must be a positive integer');

        const payload = await fetchSong(songId);
        const objectKey = payload.data && payload.data.audio_url;

        if (!objectKey)
            throw new AppError(404, 'AUDIO_NOT_FOUND', 'Song has no audio file');

        const streamUrl = await client.presignedGetObject(BUCKET, objectKey, EXPIRY_SECONDS);

        res.set('Cache-Control', 'no-store');

        return res.redirect(302, streamUrl);
    } catch (error) {
        next(error);
    }
}

module.exports = {
    streamSong
};
