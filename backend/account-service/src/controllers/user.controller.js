const userService = require('../services/user.service');

async function getCurrentUser(req, res, next) {
    try {
        const user = await userService.getCurrentUser(req.user.id);

        return res.status(200).json(user);
    } catch (error) {
        next(error);
    }
}

async function updateProfile(req, res, next) {
    try {
        const user = await userService.updateProfile(
            req.user.id,
            req.body
        );

        return res.status(200).json(user);
    } catch (error) {
        next(error);
    }
}

module.exports = {
    getCurrentUser,
    updateProfile
};