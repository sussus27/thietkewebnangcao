const express = require('express');

const router = express.Router();
const proxy = require('../proxy');

const { UPLOAD_SERVICE_URL } = require('../config/services.config');

router.use('/upload', proxy(UPLOAD_SERVICE_URL));

module.exports = router;