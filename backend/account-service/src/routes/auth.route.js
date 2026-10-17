const express = require('express');

const authController = require('../controllers/auth.controller');

const loginValidator = require('../validations/login.validator');
const signupValidator = require('../validations/signup.validator');

const validate = require('../middleware/validation.middleware');

const router = express.Router();

router.post('/register', validate(signupValidator), authController.register);
router.post('/login', validate(loginValidator), authController.login);

module.exports = router;