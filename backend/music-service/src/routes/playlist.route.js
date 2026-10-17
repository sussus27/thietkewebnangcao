const express = require('express');

const playlistController = require('../controllers/playlist.controller');
const { authenticateJWT } = require('../middleware/auth.middleware');
const validate = require('../middleware/validation.middleware');
const playlistValidation = require('../validations/playlist.validator');

const router = express.Router();

router.use(authenticateJWT);

router.get('/', validate(playlistValidation.listPlaylists), playlistController.listPlaylists);
router.post('/', validate(playlistValidation.createPlaylist), playlistController.createPlaylist);
router.get('/:id', validate(playlistValidation.playlistId), playlistController.getPlaylistById);
router.patch('/:id', validate(playlistValidation.playlistId, playlistValidation.updatePlaylist), playlistController.updatePlaylist);
router.delete('/:id', validate(playlistValidation.playlistId), playlistController.deletePlaylist);
router.post('/:id/songs', validate(playlistValidation.playlistId, playlistValidation.addSong), playlistController.addSong);
router.delete('/:id/songs/:songId', validate(playlistValidation.playlistSongParams), playlistController.removeSong);

module.exports = router;
