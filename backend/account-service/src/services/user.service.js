const userRepository = require('../repositories/user.repository');

const AppError = require('../utils/error.util');

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;

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
                email: email?.trim().toLowerCase(),
                username: username?.trim()
            }
        );

        if (!user) {
            const error = new AppError(404, 'USER_NOT_FOUND', 'User not found');
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

async function listUsers(query = {}) {
    const page = query.page ?? DEFAULT_PAGE;
    const limit = query.limit ?? DEFAULT_LIMIT;

    const { items, total } = await userRepository.findUsers({
        q: query.q || null,
        limit,
        offset: (page - 1) * limit
    });

    return {
        data: items,
        pagination: {
            page,
            limit,
            total,
            totalPages: total > 0 ? Math.ceil(total / limit) : 0
        }
    };
}

function assertNotSelf(actingUserId, targetId, action) {
    if (actingUserId === targetId) {
        throw new AppError(403, 'CANNOT_MODIFY_SELF', `You cannot ${action} your own account`);
    }
}

async function updateUserRole(actingUserId, targetId, role) {
    assertNotSelf(actingUserId, targetId, 'change the role of');

    const user = await userRepository.updateUserRole(targetId, role);

    if (!user) {
        throw new AppError(404, 'USER_NOT_FOUND', 'User not found');
    }

    return { data: user };
}

async function deleteUser(actingUserId, targetId) {
    assertNotSelf(actingUserId, targetId, 'delete');

    const deleted = await userRepository.deleteUser(targetId);

    if (!deleted) {
        throw new AppError(404, 'USER_NOT_FOUND', 'User not found');
    }

    return { data: { id: deleted.id, deleted: true } };
}

module.exports = {
    getCurrentUser,
    updateProfile,
    listUsers,
    updateUserRole,
    deleteUser
};
