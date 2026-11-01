const AppError = require('../utils/error.util');

function errorHandler(error, req, res, next) {
    if (res.headersSent) return next(error);

    if (error instanceof AppError) {
        return res.status(error.status).json({
            error: error.code,
            message: error.message,
            data: error.data
        });
    }

    console.error(error);
    return res.status(500).json({ error: 'INTERNAL_ERROR', message: 'Internal server error' });
}

module.exports = errorHandler;
