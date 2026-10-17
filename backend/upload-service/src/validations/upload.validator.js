const { body } = require('express-validator');

const createUpload = [
    body('objectKey')
        .trim()
        .notEmpty()
        .withMessage('objectKey is required')
        .isLength({ max: 1024 })
        .withMessage('objectKey must be at most 1024 characters'),

    body('title')
        .trim()
        .notEmpty()
        .withMessage('title is required')
        .isLength({ max: 255 })
        .withMessage('title must be at most 255 characters'),

    body('coverUrl')
        .optional({ values: 'falsy' })
        .trim()
        .isLength({ max: 2048 })
        .withMessage('coverUrl must be at most 2048 characters'),

    body('durationSeconds')
        .isInt({ min: 1 })
        .withMessage('durationSeconds must be a positive integer')
        .toInt(),

    body('artistIds')
        .optional()
        .isArray()
        .withMessage('artistIds must be an array'),

    body('artistIds.*')
        .optional()
        .isInt({ min: 1 })
        .withMessage('artistIds must contain positive integers')
        .toInt()
];

module.exports = {
    createUpload
};
