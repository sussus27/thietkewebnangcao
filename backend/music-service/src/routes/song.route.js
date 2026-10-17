const express = require('express');

const songController = require('../controllers/song.controller');
const { authenticateJWT, authorize } = require('../middleware/auth.middleware');
const validate = require('../middleware/validation.middleware');
const songValidation = require('../validations/song.validator');

const router = express.Router();

router.get('/', validate(songValidation.listSongs), songController.listSongs);
router.get('/:id', validate(songValidation.songId), songController.getSongById);

router.post('/', authenticateJWT, authorize('admin'), validate(songValidation.createSong), songController.createSong);
router.patch('/:id', authenticateJWT, authorize('admin'), validate(songValidation.songId, songValidation.updateSong), songController.updateSong);
router.delete('/:id', authenticateJWT, authorize('admin'), validate(songValidation.songId), songController.deleteSong);

module.exports = router;
