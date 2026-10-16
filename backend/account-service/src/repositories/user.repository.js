const { pool } = require('../config/db.config');

async function createUser({ email, username, passwordHash }) {
    const result = await pool.query(
        `INSERT INTO users (
            email,
            username,
            password_hash,
            role
        )
        VALUES ($1, $2, $3, $4)
        RETURNING id, email, username, role, created_at`,
        [email, username, passwordHash, 'listener']
    );

    return result.rows[0];
}

async function findUserByEmail(email) {
    const result = await pool.query(
        `SELECT id, email, username, password_hash, role, created_at
         FROM users
         WHERE email = $1`,
        [email]
    );

    return result.rows[0] || null;
}

async function findUserById(id) {
    const result = await pool.query(
        `SELECT id, email, username, role, created_at
         FROM users
         WHERE id = $1`,
        [id]
    );

    return result.rows[0] || null;
}

async function updateUserProfile(id, { email, username }) {
    const result = await pool.query(
        `UPDATE users
         SET email = COALESCE($2, email),
             username = COALESCE($3, username)
         WHERE id = $1
         RETURNING id, email, username, role, created_at`,
        [id, email ?? null, username ?? null]
    );

    return result.rows[0] || null;
}

async function findUsers({ q, limit, offset }) {
    const conditions = [];
    const values = [];

    if (q) {
        values.push(`%${q}%`);
        conditions.push(`(email ILIKE $${values.length} OR username ILIKE $${values.length})`);
    }

    const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    const listValues = [...values, limit, offset];

    const [listResult, countResult] = await Promise.all([
        pool.query(
            `SELECT id, email, username, role, created_at
             FROM users
             ${where}
             ORDER BY created_at DESC, id DESC
             LIMIT $${listValues.length - 1} OFFSET $${listValues.length}`,
            listValues
        ),
        pool.query(
            `SELECT COUNT(*)::int AS total
             FROM users
             ${where}`,
            values
        )
    ]);

    return {
        items: listResult.rows,
        total: countResult.rows[0].total
    };
}

async function updateUserRole(id, role) {
    const result = await pool.query(
        `UPDATE users
         SET role = $2
         WHERE id = $1
         RETURNING id, email, username, role, created_at`,
        [id, role]
    );

    return result.rows[0] || null;
}

async function deleteUser(id) {
    const result = await pool.query(
        `DELETE FROM users
         WHERE id = $1
         RETURNING id`,
        [id]
    );

    return result.rows[0] || null;
}

module.exports = {
    createUser,
    findUserByEmail,
    findUserById,
    updateUserProfile,
    findUsers,
    updateUserRole,
    deleteUser
};
