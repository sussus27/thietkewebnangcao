const express = require('express');

const artistController = require('../controllers/artist.controller');
const { authenticateJWT, authorize } = require('../middleware/auth.middleware');
const validationMiddleware = require('../middleware/validation.middleware');

const {
    listArtistsValidator,
    artistIdValidator,
    createArtistValidator,
    updateArtistValidator
} = require('../validations/artist.validator');

const router = express.Router();

router.get('/', listArtistsValidator, validationMiddleware, artistController.listArtists);
router.get('/:id', artistIdValidator, validationMiddleware, artistController.getArtistById);

router.post('/', authenticateJWT, authorize('admin'), createArtistValidator, validationMiddleware, artistController.createArtist);
router.patch('/:id', authenticateJWT, authorize('admin'), artistIdValidator, updateArtistValidator, validationMiddleware, artistController.updateArtist);
router.delete('/:id', authenticateJWT, authorize('admin'), artistIdValidator, validationMiddleware, artistController.deleteArtist);

module.exports = router;
