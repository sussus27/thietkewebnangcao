const { query, param, body } = require('express-validator');

const listSongs = [
    query('q')
        .optional()
        .isString()
        .withMessage('q must be a string')
        .isLength({ max: 100 })
        .withMessage('q must be at most 100 characters'),

    query('artistId')
        .optional()
        .isInt({ min: 1 })
        .withMessage('artistId must be a positive integer')
        .toInt(),

    query('order')
        .optional()
        .isIn(['asc', 'desc'])
        .withMessage('order must be asc or desc'),

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

const songId = [
    param('id')
        .isInt({ min: 1 })
        .withMessage('Song id must be a positive integer')
        .toInt()
];

const createSong = [
    body('title')
        .trim()
        .notEmpty()
        .withMessage('title is required')
        .isLength({ max: 255 })
        .withMessage('title must be at most 255 characters'),

    body('audioUrl')
        .trim()
        .notEmpty()
        .withMessage('audioUrl is required')
        .isLength({ max: 2048 })
        .withMessage('audioUrl must be at most 2048 characters'),

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

const updateSong = [
    body('title')
        .optional()
        .trim()
        .notEmpty()
        .withMessage('title cannot be empty')
        .isLength({ max: 255 })
        .withMessage('title must be at most 255 characters'),

    body('audioUrl')
        .optional()
        .trim()
        .notEmpty()
        .withMessage('audioUrl cannot be empty')
        .isLength({ max: 2048 })
        .withMessage('audioUrl must be at most 2048 characters'),

    body('coverUrl')
        .optional({ values: 'falsy' })
        .trim()
        .isLength({ max: 2048 })
        .withMessage('coverUrl must be at most 2048 characters'),

    body('durationSeconds')
        .optional()
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
    listSongs,
    songId,
    createSong,
    updateSong
};
