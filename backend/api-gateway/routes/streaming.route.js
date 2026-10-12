const express = require('express');

const router = express.Router();
const proxy = require('../proxy');

const {
    STREAMING_SERVICE_URL
} = require('../config/services.config');

router.use(
    '/stream',
    proxy(STREAMING_SERVICE_URL)
);

module.exports = router;