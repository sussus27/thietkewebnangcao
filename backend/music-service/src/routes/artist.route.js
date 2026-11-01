const express = require('express');

const artistController = require('../controllers/artist.controller');
const { authenticateJWT, authorize } = require('../middleware/auth.middleware');
const validate = require('../middleware/validation.middleware');
const artistValidation = require('../validations/artist.validator');

const router = express.Router();

router.get('/', validate(artistValidation.listArtists), artistController.listArtists);
router.get('/:id', validate(artistValidation.artistId), artistController.getArtistById);

router.post('/', authenticateJWT, authorize('admin'), validate(artistValidation.createArtist), artistController.createArtist);
router.patch('/:id', authenticateJWT, authorize('admin'), validate(artistValidation.artistId, artistValidation.updateArtist), artistController.updateArtist);
router.delete('/:id', authenticateJWT, authorize('admin'), validate(artistValidation.artistId), artistController.deleteArtist);

module.exports = router;
