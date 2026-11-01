class AppError extends Error {
    constructor(status, code, message, data = null) {
        super(message);

        this.name = 'AppError';
        this.status = status;
        this.code = code;
        this.data = data;

        Error.captureStackTrace(this, this.constructor);
    }
}

module.exports = AppError;
