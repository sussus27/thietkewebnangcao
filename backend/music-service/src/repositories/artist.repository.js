const { pool } = require('../config/db.config');

const ARTIST_COLUMNS = `
    a.id,
    a.name,
    a.created_at,
    (
        SELECT COUNT(*)::int
        FROM song_artists sa
        WHERE sa.artist_id = a.id
    ) AS song_count`;

async function findArtists({ q, limit, offset }) {
    const conditions = [];
    const values = [];

    if (q) {
        values.push(`%${q}%`);
        conditions.push(`a.name ILIKE $${values.length}`);
    }

    const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    const listValues = [...values, limit, offset];

    const [listResult, countResult] = await Promise.all([
        pool.query(
            `SELECT ${ARTIST_COLUMNS}
             FROM artists a
             ${where}
             ORDER BY a.name ASC, a.id ASC
             LIMIT $${listValues.length - 1} OFFSET $${listValues.length}`,
            listValues
        ),
        pool.query(
            `SELECT COUNT(*)::int AS total
             FROM artists a
             ${where}`,
            values
        )
    ]);

    return {
        items: listResult.rows,
        total: countResult.rows[0].total
    };
}

async function findArtistById(id) {
    const result = await pool.query(
        `SELECT ${ARTIST_COLUMNS}
         FROM artists a
         WHERE a.id = $1`,
        [id]
    );

    return result.rows[0] || null;
}

async function createArtist({ name }) {
    const result = await pool.query(
        `INSERT INTO artists (name)
         VALUES ($1)
         RETURNING id`,
        [name]
    );

    return result.rows[0];
}

async function updateArtist(id, { name }) {
    const result = await pool.query(
        `UPDATE artists
         SET name = COALESCE($2, name)
         WHERE id = $1
         RETURNING id`,
        [id, name ?? null]
    );

    return result.rows[0] || null;
}

async function deleteArtist(id) {
    const result = await pool.query(
        `DELETE FROM artists
         WHERE id = $1
         RETURNING id`,
        [id]
    );

    return result.rows[0] || null;
}

module.exports = {
    findArtists,
    findArtistById,
    createArtist,
    updateArtist,
    deleteArtist
};
