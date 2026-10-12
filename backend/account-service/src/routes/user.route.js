const express = require('express');

const router = express.Router();

const userController = require('../controllers/user.controller');
const authMiddleware = require('../middleware/auth.middleware');

router.get(
    '/me',
    authMiddleware,
    userController.getCurrentUser
);
router.put(
    '/me',
    authMiddleware,
    userController.updateProfile
);

// lam them doi mat khau
// router.put(
//     '/me/password',
//     authMiddleware,
//     userController.changePassword
// );

module.exports = router;