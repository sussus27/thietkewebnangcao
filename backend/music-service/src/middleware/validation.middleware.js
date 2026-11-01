const { validationResult } = require('express-validator');
const AppError = require('../utils/error.util');

function validate(...validatorGroups) {
    return [
        ...validatorGroups.flat(),
        (req, res, next) => {
            const errors = validationResult(req);
            if (errors.isEmpty()) return next();

            const details = errors
                .array({ onlyFirstError: true })
                .map(({ path, msg }) => ({ field: path, message: msg }));

            return next(new AppError(400, 'INVALID_REQUEST', 'Validation failed', details));
        }
    ];
}

module.exports = validate;
