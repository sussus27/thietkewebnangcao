const express = require('express');

const router = express.Router();

const userController = require('../controllers/user.controller');

const updateProfileValidator = require('../validations/update.validator');
const {
    listUsersValidator,
    userIdValidator,
    updateRoleValidator
} = require('../validations/user.validator');

const validationMiddleware = require('../middleware/validation.middleware');
const { authenticateJWT, authorize } = require('../middleware/auth.middleware');

router.get('/me', authenticateJWT, userController.getCurrentUser);
router.put('/me', authenticateJWT, updateProfileValidator, validationMiddleware, userController.updateProfile);

router.get('/', authenticateJWT, authorize('admin'), listUsersValidator, validationMiddleware, userController.listUsers);
router.patch('/:id/role', authenticateJWT, authorize('admin'), userIdValidator, updateRoleValidator, validationMiddleware, userController.updateUserRole);
router.delete('/:id', authenticateJWT, authorize('admin'), userIdValidator, validationMiddleware, userController.deleteUser);

// lam them doi mat khau
// router.put(
//     '/me/password',
//     authenticateJWT,
//     userController.changePassword
// );

module.exports = router;
