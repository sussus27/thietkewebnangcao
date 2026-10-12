const express = require('express');

const authController = require('../controllers/auth.controller');

const loginValidator = require('../validations/login.validator');
const signupValidator = require('../validations/signup.validator');

const validationMiddleware = require('../middleware/validation.middleware');

const router = express.Router();

router.post('/register', signupValidator, validationMiddleware, authController.register);
router.post('/login', loginValidator, validationMiddleware, authController.login);

module.exports = router;