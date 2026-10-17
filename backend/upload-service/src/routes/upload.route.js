const express = require('express');

const uploadController = require('../controllers/upload.controller');
const { authenticateJWT, authorize } = require('../middleware/auth.middleware');
const validate = require('../middleware/validation.middleware');
const uploadValidation = require('../validations/upload.validator');

const router = express.Router();

router.post('/', authenticateJWT, authorize('admin'), validate(uploadValidation.createUpload), uploadController.createUpload);

module.exports = router;
