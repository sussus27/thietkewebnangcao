const path = require('path');
const crypto = require('crypto');
const { matchedData } = require('express-validator');

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

async function readDuration(file) {
    const { parseBuffer } = await import('music-metadata');
    const metadata = await parseBuffer(file.buffer, { mimeType: file.mimetype });

    return Math.round(metadata.format.duration ?? 0);
}

async function createUpload(req, res, next) {
    try {
        const file = req.file;

        if (!file)
            throw new AppError(400, 'FILE_REQUIRED', 'file is required');

        if (!AUDIO_MIME_TYPES.includes(file.mimetype))
            throw new AppError(400, 'INVALID_FILE_TYPE', `Unsupported audio type: ${file.mimetype}`);

        let durationSeconds;

        try {
            durationSeconds = await readDuration(file);
        } catch {
            throw new AppError(400, 'INVALID_AUDIO', 'Cannot read audio metadata from this file');
        }

        if (!Number.isInteger(durationSeconds) || durationSeconds <= 0)
            throw new AppError(400, 'INVALID_AUDIO', 'Cannot read duration from this file');

        const objectKey = `audio/${Date.now()}-${crypto.randomUUID()}${path.extname(file.originalname)}`;

        await client.putObject(BUCKET, objectKey, file.buffer, file.size, {
            'Content-Type': file.mimetype
        });

        const body = matchedData(req);

        await publishUploadEvent({
            objectKey,
            title: body.title || path.parse(file.originalname).name,
            coverUrl: null,
            durationSeconds,
            artistIds: []
        });

        return res.status(202).json({
            data: {
                published: true,
                routingKey: 'file.uploaded',
                objectKey,
                durationSeconds
            }
        });
    } catch (error) {
        next(error);
    }
}

module.exports = {
    createUpload
};
