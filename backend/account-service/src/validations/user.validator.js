const { query, param, body } = require('express-validator');

const listUsersValidator = [
    query('q')
        .optional()
        .isString()
        .withMessage('q must be a string')
        .isLength({ max: 100 })
        .withMessage('q must be at most 100 characters'),

    query('page')
        .optional()
        .isInt({ min: 1 })
        .withMessage('page must be a positive integer')
        .toInt(),

    query('limit')
        .optional()
        .isInt({ min: 1, max: 50 })
        .withMessage('limit must be between 1 and 50')
        .toInt()
];

const userIdValidator = [
    param('id')
        .isInt({ min: 1 })
        .withMessage('User id must be a positive integer')
        .toInt()
];

const updateRoleValidator = [
    body('role')
        .isIn(['listener', 'admin'])
        .withMessage('role must be one of: listener, admin')
];

module.exports = {
    listUsersValidator,
    userIdValidator,
    updateRoleValidator
};
