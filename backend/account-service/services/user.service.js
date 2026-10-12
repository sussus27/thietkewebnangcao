const userRepository = require('../repositories/user.repository');

async function getCurrentUser(userId) {
    const user = await userRepository.findUserById(userId);

    if (!user) {
        const error = new Error('User not found');
        error.code = 'USER_NOT_FOUND';
        error.status = 404;

        throw error;
    }

    return user;
}

async function updateProfile(userId, { email, username }) {
    try {
        const user = await userRepository.updateUserProfile(
            userId,
            {
                email: email.trim().toLowerCase(),
                username: username.trim()
            }
        );

        if (!user) {
            const error = new Error('User not found');
            error.code = 'USER_NOT_FOUND';
            error.status = 404;

            throw error;
        }

        return user;
    } catch (error) {
        if (error.code === '23505') {
            const duplicateError = new Error('Email or username is already registered');
            duplicateError.code = 'USER_ALREADY_EXISTS';
            duplicateError.status = 409;

            throw duplicateError;
        }

        throw error;
    }
}

module.exports = {
    getCurrentUser,
    updateProfile
};