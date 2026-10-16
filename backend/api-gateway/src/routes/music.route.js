const express = require('express');

const router = express.Router();
const proxy = require('../proxy');

const {
    MUSIC_SERVICE_URL
} = require('../config/services.config');

router.use('/songs', proxy(MUSIC_SERVICE_URL));
router.use('/artists', proxy(MUSIC_SERVICE_URL));
router.use('/playlists', proxy(MUSIC_SERVICE_URL));

module.exports = router;
