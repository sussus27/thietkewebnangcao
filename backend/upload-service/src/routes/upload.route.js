const express = require('express');
const multer = require('multer');

const uploadController = require('../controllers/upload.controller');
const { authenticateJWT, authorize } = require('../middleware/auth.middleware');
const validate = require('../middleware/validation.middleware');
const uploadValidation = require('../validations/upload.validator');

const router = express.Router();

const receiveAudio = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 20 * 1024 * 1024 }
}).single('file');

router.post('/', authenticateJWT, authorize('admin'), receiveAudio, validate(uploadValidation.createUpload), uploadController.createUpload);

module.exports = router;
