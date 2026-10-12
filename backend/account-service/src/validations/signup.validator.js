const { body } = require('express-validator');

const signupValidator = [
    body('email')
        .trim()
        .notEmpty()
        .withMessage('Email is required')
        .isEmail()
        .withMessage('Please enter a valid email'),

    body('username')
        .trim()
        .notEmpty()
        .withMessage('Username is required')
        .isLength({ min: 3, max: 100 })
        .withMessage('Username must be between 3 and 100 characters'),

    body('password')
        .isString()
        .withMessage('Password must be a string')
        .notEmpty()
        .withMessage('Password is required')
        .isLength({ min: 8, max: 72 })
        .withMessage('Password must be between 8 and 72 characters')
];

module.exports = signupValidator;