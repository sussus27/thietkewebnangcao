const express = require('express');

const router = express.Router();
const proxy = require('../proxy');

const {
    VIEW_SERVICE_URL
} = require('../config/services.config');

router.use(
    '/songs',
    proxy(VIEW_SERVICE_URL)
);

router.use(
    '/playlists',
    proxy(VIEW_SERVICE_URL)
);

module.exports = router;