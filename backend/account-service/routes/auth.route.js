const express = require('express');
const { validationResult } = require('express-validator');

const authController = require('../controllers/auth.controller');

const loginValidator = require('../validations/login.validator');
const signupValidator = require('../validations/signup.validator');

const router = express.Router();

function handleValidationErrors(req, res, next) {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({
            errors: errors.array()
        });
    }

    next();
}

router.post(
    '/register',
    signupValidator,
    handleValidationErrors,
    authController.register
);

router.post(
    '/login',
    loginValidator,
    handleValidationErrors,
    authController.login
);

module.exports = router;