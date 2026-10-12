function errorMiddleware(error, req, res, next) {
    if (error.status) {
        return res.status(error.status).json({
            error: error.code,
            message: error.message,
            data: error.data
        });
    }

    console.error(error);

    return res.status(500).json({
        error: 'INTERNAL_ERROR',
        message: 'Internal server error'
    });
}

module.exports = errorMiddleware;