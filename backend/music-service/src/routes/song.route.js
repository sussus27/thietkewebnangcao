const express = require('express');

const songController = require('../controllers/song.controller');
const { authenticateJWT, authorize } = require('../middleware/auth.middleware');
const validationMiddleware = require('../middleware/validation.middleware');

const {
    listSongsValidator,
    songIdValidator,
    createSongValidator,
    updateSongValidator
} = require('../validations/song.validator');

const router = express.Router();

router.get('/', listSongsValidator, validationMiddleware, songController.listSongs);
router.get('/:id', songIdValidator, validationMiddleware, songController.getSongById);

router.post('/', authenticateJWT, authorize('admin'), createSongValidator, validationMiddleware, songController.createSong);
router.patch('/:id', authenticateJWT, authorize('admin'), songIdValidator, updateSongValidator, validationMiddleware, songController.updateSong);
router.delete('/:id', authenticateJWT, authorize('admin'), songIdValidator, validationMiddleware, songController.deleteSong);

module.exports = router;
