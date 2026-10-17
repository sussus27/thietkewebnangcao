const { client, BUCKET } = require('../storage/minio.client');
const AppError = require('../utils/error.util');

const MUSIC_SERVICE_URL = process.env.MUSIC_SERVICE_URL;
const EXPIRY_SECONDS = Number(process.env.PRESIGN_EXPIRY_SECONDS || 3600);
const MUSIC_SERVICE_TIMEOUT_MS = Number(process.env.MUSIC_SERVICE_TIMEOUT_MS || 3000);

async function fetchAudioUrl(songId) {
    let response;

    try {
        response = await fetch(`${MUSIC_SERVICE_URL}/api/songs/${songId}`, {
            signal: AbortSignal.timeout(MUSIC_SERVICE_TIMEOUT_MS)
        });
    } catch {
        throw new AppError(502, 'MUSIC_SERVICE_UNAVAILABLE', 'Cannot reach music-service');
    }

    if (response.status === 404) {
        throw new AppError(404, 'SONG_NOT_FOUND', 'Song not found');
    }

    if (!response.ok) {
        throw new AppError(502, 'MUSIC_SERVICE_ERROR', 'music-service returned an unexpected status');
    }

    const payload = await response.json();
    const audioUrl = payload.data && payload.data.audio_url;

    if (!audioUrl) {
        throw new AppError(404, 'AUDIO_NOT_FOUND', 'Song has no audio file');
    }

    return audioUrl;
}

async function resolveStreamUrl(songId) {
    if (!Number.isInteger(songId) || songId <= 0) {
        throw new AppError(400, 'INVALID_SONG_ID', 'Song id must be a positive integer');
    }

    const audioUrl = await fetchAudioUrl(songId);

    return client.presignedGetObject(BUCKET, audioUrl, EXPIRY_SECONDS);
}

module.exports = {
    resolveStreamUrl
};
