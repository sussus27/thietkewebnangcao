const express = require('express');

const router = express.Router();

const userController = require('../controllers/user.controller');

const updateProfileValidator = require('../validations/update.validator');
const userValidation = require('../validations/user.validator');

const validate = require('../middleware/validation.middleware');
const { authenticateJWT, authorize } = require('../middleware/auth.middleware');

router.get('/me', authenticateJWT, userController.getCurrentUser);
router.put('/me', authenticateJWT, validate(updateProfileValidator), userController.updateProfile);

router.get('/', authenticateJWT, authorize('admin'), validate(userValidation.listUsers), userController.listUsers);
router.patch('/:id/role', authenticateJWT, authorize('admin'), validate(userValidation.userId, userValidation.updateRole), userController.updateUserRole);
router.delete('/:id', authenticateJWT, authorize('admin'), validate(userValidation.userId), userController.deleteUser);

// lam them doi mat khau
// router.put(
//     '/me/password',
//     authenticateJWT,
//     userController.changePassword
// );

module.exports = router;
