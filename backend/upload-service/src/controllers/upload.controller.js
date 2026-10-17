const { matchedData } = require('express-validator');
const uploadService = require('../services/upload.service');

async function createUpload(req, res, next) {
    try {
        const result = await uploadService.createUpload(req.file, matchedData(req));

        return res.status(202).json({
            data: {
                published: true,
                routingKey: 'file.uploaded',
                objectKey: result.objectKey,
                durationSeconds: result.durationSeconds
            }
        });
    } catch (error) {
        next(error);
    }
}

module.exports = {
    createUpload
};
