const { query, param, body } = require('express-validator');

const listArtistsValidator = [
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

const artistIdValidator = [
    param('id')
        .isInt({ min: 1 })
        .withMessage('Artist id must be a positive integer')
        .toInt()
];

const createArtistValidator = [
    body('name')
        .trim()
        .notEmpty()
        .withMessage('name is required')
        .isLength({ max: 150 })
        .withMessage('name must be at most 150 characters')
];

const updateArtistValidator = [
    body('name')
        .optional()
        .trim()
        .notEmpty()
        .withMessage('name cannot be empty')
        .isLength({ max: 150 })
        .withMessage('name must be at most 150 characters')
];

module.exports = {
    listArtistsValidator,
    artistIdValidator,
    createArtistValidator,
    updateArtistValidator
};
