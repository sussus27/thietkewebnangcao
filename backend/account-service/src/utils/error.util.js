class AppError extends Error {
    constructor(status, code, message) {
        super(message);
 
        this.name = 'AppError';
        this.status = status;
        this.code = code;
 
        Error.captureStackTrace(this, this.constructor);
    }
}

module.exports = AppError;