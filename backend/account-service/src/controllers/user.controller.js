const { matchedData } = require('express-validator');
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

async function listUsers(req, res, next) {
    try {
        const result = await userService.listUsers(matchedData(req));

        return res.status(200).json(result);
    } catch (error) {
        next(error);
    }
}

async function updateUserRole(req, res, next) {
    try {
        const { id, role } = matchedData(req);
        const result = await userService.updateUserRole(req.user.id, id, role);

        return res.status(200).json(result);
    } catch (error) {
        next(error);
    }
}

async function deleteUser(req, res, next) {
    try {
        const result = await userService.deleteUser(req.user.id, matchedData(req).id);

        return res.status(200).json(result);
    } catch (error) {
        next(error);
    }
}

module.exports = {
    getCurrentUser,
    updateProfile,
    listUsers,
    updateUserRole,
    deleteUser
};
