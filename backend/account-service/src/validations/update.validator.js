const { body } = require('express-validator');

const updateProfileValidator = [
    body('email')
        .optional()
        .trim()
        .isEmail()
        .withMessage('Please enter a valid email'),

    body('username')
        .optional()
        .trim()
        .isLength({ min: 3, max: 100 })
        .withMessage('Username must be between 3 and 100 characters')
];

module.exports = updateProfileValidator;