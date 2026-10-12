const userRepository = require('../repositories/user.repository');

async function getCurrentUser(userId) {
    const user = await userRepository.findUserById(userId);

    if (!user) {
        const error = new AppError(404, 'USER_NOT_FOUND', 'User not found');
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
            const error = new AppError(
                404,
                'USER_NOT_FOUND',
                'User not found'
            );
            throw error;
        }

        return user;
    } catch (error) {
        if (error.code === '23505') {
            const duplicateError = new AppError(409, 'USER_ALREADY_EXISTS', 'Email or username is already registered');
            throw duplicateError;
        }

        throw error;
    }
}

module.exports = {
    getCurrentUser,
    updateProfile
};