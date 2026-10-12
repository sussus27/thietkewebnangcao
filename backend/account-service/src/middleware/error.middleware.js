const AppError = require('../utils/error.util');

function errorMiddleware(error, req, res, next) {
    if (res.headersSent) return next(error);

    if (error instanceof AppError) {
        return res.status(error.status).json({
            error: error.code,
            message: error.message,
            data: error.data
        });
    }

    if (error.type === 'entity.parse.failed') {
        return res.status(400).json({ error: 'INVALID_JSON', message: 'Malformed JSON body' });
    }

    console.error(error);
    return res.status(500).json({ error: 'INTERNAL_ERROR', message: 'Internal server error' });
}

module.exports = errorMiddleware;