const path = require('path');
const crypto = require('crypto');

const { client, BUCKET } = require('../storage/minio.client');
const { publishUploadEvent } = require('../messaging/upload.publisher');
const AppError = require('../utils/error.util');

const AUDIO_MIME_TYPES = [
    'audio/mpeg',
    'audio/mp3',
    'audio/wav',
    'audio/x-wav',
    'audio/mp4',
    'audio/x-m4a',
    'audio/aac',
    'audio/ogg',
    'audio/webm'
];

function assertFile(file) {
    if (!file) {
        throw new AppError(400, 'FILE_REQUIRED', 'file is required');
    }

    if (!AUDIO_MIME_TYPES.includes(file.mimetype)) {
        throw new AppError(400, 'INVALID_FILE_TYPE', `Unsupported audio type: ${file.mimetype}`);
    }
}

async function readDuration(file) {
    const { parseBuffer } = await import('music-metadata');
    const metadata = await parseBuffer(file.buffer, { mimeType: file.mimetype });
    const durationSeconds = Math.round(metadata.format.duration ?? 0);

    if (!Number.isInteger(durationSeconds) || durationSeconds <= 0) {
        throw new AppError(400, 'INVALID_AUDIO', 'Cannot read duration from this file');
    }

    return durationSeconds;
}

function buildObjectKey(file) {
    return `audio/${Date.now()}-${crypto.randomUUID()}${path.extname(file.originalname)}`;
}

function buildTitle(file, body) {
    return body.title || path.parse(file.originalname).name;
}

async function createUpload(file, body = {}) {
    assertFile(file);

    let durationSeconds;

    try {
        durationSeconds = await readDuration(file);
    } catch (error) {
        if (error instanceof AppError) throw error;

        throw new AppError(400, 'INVALID_AUDIO', 'Cannot read audio metadata from this file');
    }

    const objectKey = buildObjectKey(file);

    await client.putObject(BUCKET, objectKey, file.buffer, file.size, {
        'Content-Type': file.mimetype
    });

    try {
        await publishUploadEvent({
            objectKey,
            title: buildTitle(file, body),
            coverUrl: null,
            durationSeconds,
            artistIds: []
        });
    } catch (error) {
        await client.removeObject(BUCKET, objectKey).catch(() => {});

        throw error;
    }

    return {
        objectKey,
        durationSeconds
    };
}

module.exports = {
    createUpload
};
