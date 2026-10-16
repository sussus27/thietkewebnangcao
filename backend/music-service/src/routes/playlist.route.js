const express = require('express');

const playlistController = require('../controllers/playlist.controller');
const { authenticateJWT } = require('../middleware/auth.middleware');
const validationMiddleware = require('../middleware/validation.middleware');

const {
    listPlaylistsValidator,
    playlistIdValidator,
    playlistSongParamsValidator,
    createPlaylistValidator,
    updatePlaylistValidator,
    addSongValidator
} = require('../validations/playlist.validator');

const router = express.Router();

router.use(authenticateJWT);

router.get('/', listPlaylistsValidator, validationMiddleware, playlistController.listPlaylists);
router.post('/', createPlaylistValidator, validationMiddleware, playlistController.createPlaylist);
router.get('/:id', playlistIdValidator, validationMiddleware, playlistController.getPlaylistById);
router.patch('/:id', playlistIdValidator, updatePlaylistValidator, validationMiddleware, playlistController.updatePlaylist);
router.delete('/:id', playlistIdValidator, validationMiddleware, playlistController.deletePlaylist);
router.post('/:id/songs', playlistIdValidator, addSongValidator, validationMiddleware, playlistController.addSong);
router.delete('/:id/songs/:songId', playlistSongParamsValidator, validationMiddleware, playlistController.removeSong);

module.exports = router;
