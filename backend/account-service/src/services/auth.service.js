const bcrypt = require('bcrypt');

const userRepository = require('../repositories/user.repository');
const { generateToken } = require('../utils/jwt.util');

const AppError = require('../utils/error.util');

async function register({ email, password, username }) {
    try {
        const passwordHash = await bcrypt.hash(password, 9);
        const user = await userRepository.createUser({
            email: email.trim().toLowerCase(),
            username: username.trim(),
            passwordHash
        });
        const token = generateToken(user);

        return {
            success: true,
            token,
            username: user.username
        };
    } catch (error) {
        if (error.code === '23505') {
            const duplicateError = new AppError(409, 'USER_ALREADY_EXISTS', 'Email or username is already registered');
            throw duplicateError;
        }

        throw error;
    }
}

async function login({ email, password }) {
    const user = await userRepository.findUserByEmail(email.trim().toLowerCase());

    if (!user) {
        const error = new AppError(401, 'INVALID_CREDENTIALS', 'Invalid email or password');
        throw error;
    }

    const isPasswordValid =
        await bcrypt.compare(password, user.password_hash);

    if (!isPasswordValid) {
        const error = new AppError(401, 'INVALID_CREDENTIALS', 'Invalid email or password');
        throw error;
    }

    const token = generateToken(user);

    return {
        success: true,
        token,
        username: user.username
    };
}

module.exports = {
    register,
    login
};