const authService = require('../services/auth.service');

async function register(req, res) {
    try {
        const result = await authService.register(req.body);

        return res.status(201).json(result);
    } catch (error) {
        return res.status(error.status || 500).json({
            error: error.code || 'INTERNAL_ERROR',
            message: error.status
                ? error.message
                : 'Internal server error'
        });
    }
}

async function login(req, res) {
    try {
        const result = await authService.login(req.body);

        return res.status(200).json(result);
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
    register,
    login
};