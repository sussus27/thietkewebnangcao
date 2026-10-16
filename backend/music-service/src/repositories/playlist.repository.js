const { pool } = require('../config/db.config');

const PLAYLIST_COLUMNS = `
    p.id,
    p.owner_id,
    p.name,
    p.description,
    p.cover_url,
    p.created_at,
    (
        SELECT COUNT(*)::int
        FROM playlist_songs ps
        WHERE ps.playlist_id = p.id
    ) AS song_count,
    COALESCE(
        (
            SELECT SUM(s.duration_seconds)::int
            FROM playlist_songs ps
            JOIN songs s ON s.id = ps.song_id
            WHERE ps.playlist_id = p.id
        ),
        0
    ) AS total_duration_seconds`;

async function findPlaylists({ ownerId, q, limit, offset }) {
    const conditions = ['(p.owner_id = $1 OR p.owner_id IS NULL)'];
    const values = [ownerId];

    if (q) {
        values.push(`%${q}%`);
        conditions.push(`(p.name ILIKE $${values.length} OR p.description ILIKE $${values.length})`);
    }

    const where = `WHERE ${conditions.join(' AND ')}`;
    const listValues = [...values, limit, offset];

    const [listResult, countResult] = await Promise.all([
        pool.query(
            `SELECT ${PLAYLIST_COLUMNS}
             FROM playlists p
             ${where}
             ORDER BY p.created_at DESC, p.id DESC
             LIMIT $${listValues.length - 1} OFFSET $${listValues.length}`,
            listValues
        ),
        pool.query(
            `SELECT COUNT(*)::int AS total
             FROM playlists p
             ${where}`,
            values
        )
    ]);

    return {
        items: listResult.rows,
        total: countResult.rows[0].total
    };
}

// Khong loc theo chu so huu o day; service kiem tra quyen sau khi doc.
async function findPlaylistById(id) {
    const result = await pool.query(
        `SELECT ${PLAYLIST_COLUMNS}
         FROM playlists p
         WHERE p.id = $1`,
        [id]
    );

    return result.rows[0] || null;
}

async function createPlaylist({ ownerId, name, description, coverUrl }) {
    const result = await pool.query(
        `INSERT INTO playlists (owner_id, name, description, cover_url)
         VALUES ($1, $2, $3, $4)
         RETURNING id`,
        [ownerId, name, description, coverUrl]
    );

    return result.rows[0];
}

// Chi cap nhat truong nao duoc truyen; khong the xoa trang description/cover_url.
async function updatePlaylist(id, { name, description, coverUrl }) {
    const result = await pool.query(
        `UPDATE playlists
         SET name = COALESCE($2, name),
             description = COALESCE($3, description),
             cover_url = COALESCE($4, cover_url)
         WHERE id = $1
         RETURNING id`,
        [id, name ?? null, description ?? null, coverUrl ?? null]
    );

    return result.rows[0] || null;
}

async function deletePlaylist(id) {
    const result = await pool.query(
        `DELETE FROM playlists
         WHERE id = $1
         RETURNING id`,
        [id]
    );

    return result.rows[0] || null;
}

// position moi = lon nhat hien tai + 1.
// Neu bai hat da co trong playlist thi ON CONFLICT khong tra ve dong nao.
async function addSong(playlistId, songId) {
    const result = await pool.query(
        `INSERT INTO playlist_songs (playlist_id, song_id, position)
         SELECT $1, $2, COALESCE(MAX(position), 0) + 1
         FROM playlist_songs
         WHERE playlist_id = $1
         ON CONFLICT (playlist_id, song_id) DO NOTHING
         RETURNING position`,
        [playlistId, songId]
    );

    return result.rows[0] || null;
}

async function removeSong(playlistId, songId) {
    const result = await pool.query(
        `DELETE FROM playlist_songs
         WHERE playlist_id = $1 AND song_id = $2
         RETURNING position`,
        [playlistId, songId]
    );

    return result.rows[0] || null;
}

module.exports = {
    findPlaylists,
    findPlaylistById,
    createPlaylist,
    updatePlaylist,
    deletePlaylist,
    addSong,
    removeSong
};
