const express = require('express');

const router = express.Router();
const proxy = require('../proxy');

const {
    ACCOUNT_SERVICE_URL
} = require('../config/services.config');

router.use(
    '/auth',
    proxy(ACCOUNT_SERVICE_URL)
);

router.use(
    '/users',
    proxy(ACCOUNT_SERVICE_URL)
);

module.exports = router;