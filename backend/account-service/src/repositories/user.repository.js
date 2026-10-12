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

module.exports = {
    createUser,
    findUserByEmail,
    findUserById,
    updateUserProfile
};