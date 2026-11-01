const express = require('express');

const streamController = require('../controllers/stream.controller');

const router = express.Router();

router.get('/:songId', streamController.streamSong);

module.exports = router;
