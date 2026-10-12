const { validationResult } = require('express-validator');
const AppError = require('../utils/error.util');

function validationMiddleware(req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return next(new AppError( 400, 'INVALID_REQUEST', 'Validation failed', errors.array()));
    next();
}

module.exports = validationMiddleware;