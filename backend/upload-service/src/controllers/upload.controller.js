const { matchedData } = require('express-validator');
const { publishUploadEvent } = require('../messaging/upload.publisher');

async function createUpload(req, res, next) {
    try {
        const body = matchedData(req);

        publishUploadEvent({
            objectKey: body.objectKey,
            title: body.title,
            coverUrl: body.coverUrl || null,
            durationSeconds: body.durationSeconds,
            artistIds: body.artistIds || []
        });

        return res.status(202).json({
            data: {
                published: true,
                routingKey: 'file.uploaded'
            }
        });
    } catch (error) {
        next(error);
    }
}

module.exports = {
    createUpload
};
