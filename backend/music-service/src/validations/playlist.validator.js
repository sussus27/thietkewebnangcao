const { query, param, body } = require('express-validator');

const listPlaylists = [
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

const playlistId = [
    param('id')
        .isInt({ min: 1 })
        .withMessage('Playlist id must be a positive integer')
        .toInt()
];

const playlistSongParams = [
    param('id')
        .isInt({ min: 1 })
        .withMessage('Playlist id must be a positive integer')
        .toInt(),

    param('songId')
        .isInt({ min: 1 })
        .withMessage('Song id must be a positive integer')
        .toInt()
];

const createPlaylist = [
    body('name')
        .trim()
        .notEmpty()
        .withMessage('name is required')
        .isLength({ max: 150 })
        .withMessage('name must be at most 150 characters'),

    body('description')
        .optional()
        .isString()
        .withMessage('description must be a string')
        .trim()
        .isLength({ max: 1000 })
        .withMessage('description must be at most 1000 characters'),

    body('coverUrl')
        .optional()
        .isString()
        .withMessage('coverUrl must be a string')
        .trim()
        .isLength({ max: 2048 })
        .withMessage('coverUrl must be at most 2048 characters')
];

const updatePlaylist = [
    body('name')
        .optional()
        .trim()
        .notEmpty()
        .withMessage('name cannot be empty')
        .isLength({ max: 150 })
        .withMessage('name must be at most 150 characters'),

    body('description')
        .optional()
        .isString()
        .withMessage('description must be a string')
        .trim()
        .isLength({ max: 1000 })
        .withMessage('description must be at most 1000 characters'),

    body('coverUrl')
        .optional()
        .isString()
        .withMessage('coverUrl must be a string')
        .trim()
        .isLength({ max: 2048 })
        .withMessage('coverUrl must be at most 2048 characters')
];

const addSong = [
    body('songId')
        .isInt({ min: 1 })
        .withMessage('songId must be a positive integer')
        .toInt()
];

module.exports = {
    listPlaylists,
    playlistId,
    playlistSongParams,
    createPlaylist,
    updatePlaylist,
    addSong
};
