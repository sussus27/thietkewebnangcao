const bcrypt = require('bcrypt');

const userRepository = require('../repositories/user.repository');
const { generateToken } = require('../config/jwt.config');

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
        // PostgreSQL UNIQUE constraint violation
        if (error.code === '23505') {
            const duplicateError = new Error(
                'Email or username is already registered'
            );

            duplicateError.code = 'USER_ALREADY_EXISTS';
            duplicateError.status = 409;

            throw duplicateError;
        }

        throw error;
    }
}

async function login({ email, password }) {
    const user = await userRepository.findUserByEmail(email.trim().toLowerCase());

    if (!user) {
        const error = new Error('Invalid email or password');

        error.code = 'INVALID_CREDENTIALS';
        error.status = 401;

        throw error;
    }

    const isPasswordValid =
        await bcrypt.compare(password, user.password_hash);

    if (!isPasswordValid) {
        const error = new Error('Invalid email or password');

        error.code = 'INVALID_CREDENTIALS';
        error.status = 401;

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