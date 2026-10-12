const userService = require('../services/user.service');

async function getCurrentUser(req, res) {
    try {
        const user = await userService.getCurrentUser(req.user.id);

        return res.status(200).json(user);
    } catch (error) {
        return res.status(error.status || 500).json({
            error: error.code || 'INTERNAL_ERROR',
            message: error.status
                ? error.message
                : 'Internal server error'
        });
    }
}

async function updateProfile(req, res) {
    try {
        const user = await userService.updateProfile(
            req.user.id,
            req.body
        );

        return res.status(200).json(user);
    } catch (error) {
        return res.status(error.status || 500).json({
            error: error.code || 'INTERNAL_ERROR',
            message: error.status
                ? error.message
                : 'Internal server error'
        });
    }
}

module.exports = {
    getCurrentUser,
    updateProfile
};