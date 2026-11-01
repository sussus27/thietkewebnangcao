const { pool } = require('../config/db.config');

const SONG_COLUMNS = `
    s.id,
    s.title,
    s.audio_url,
    s.cover_url,
    s.duration_seconds,
    s.created_at`;

const ARTISTS_COLUMN = `
    COALESCE(
        (
            SELECT JSON_AGG(a.name ORDER BY a.name)
            FROM song_artists sa
            JOIN artists a ON a.id = sa.artist_id
            WHERE sa.song_id = s.id
        ),
        '[]'::json
    ) AS artists`;

function buildFilters({ q, artistId }) {
    const conditions = [];
    const values = [];

    if (q) {
        values.push(`%${q}%`);
        conditions.push(`(
            s.title ILIKE $${values.length}
            OR EXISTS (
                SELECT 1
                FROM song_artists sa
                JOIN artists a ON a.id = sa.artist_id
                WHERE sa.song_id = s.id
                  AND a.name ILIKE $${values.length}
            )
        )`);
    }

    if (artistId) {
        values.push(artistId);
        conditions.push(`EXISTS (
            SELECT 1
            FROM song_artists sa
            WHERE sa.song_id = s.id
              AND sa.artist_id = $${values.length}
        )`);
    }

    return {
        where: conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '',
        values
    };
}

async function findSongs({ q, artistId, ascending, limit, offset }) {
    const { where, values } = buildFilters({ q, artistId });
    const listValues = [...values, limit, offset];
    const direction = ascending ? 'ASC' : 'DESC';
    const orderBy = `s.created_at ${direction}, s.id ${direction}`;

    const [listResult, countResult] = await Promise.all([
        pool.query(
            `SELECT ${SONG_COLUMNS}, ${ARTISTS_COLUMN}
             FROM songs s
             ${where}
             ORDER BY ${orderBy}
             LIMIT $${listValues.length - 1} OFFSET $${listValues.length}`,
            listValues
        ),
        pool.query(
            `SELECT COUNT(*)::int AS total
             FROM songs s
             ${where}`,
            values
        )
    ]);

    return {
        items: listResult.rows,
        total: countResult.rows[0].total
    };
}

async function findSongById(id) {
    const result = await pool.query(
        `SELECT ${SONG_COLUMNS}, ${ARTISTS_COLUMN}
         FROM songs s
         WHERE s.id = $1`,
        [id]
    );

    return result.rows[0] || null;
}

async function findSongsByArtistId(artistId) {
    const result = await pool.query(
        `SELECT ${SONG_COLUMNS}, ${ARTISTS_COLUMN}
         FROM songs s
         JOIN song_artists filter_sa ON filter_sa.song_id = s.id
         WHERE filter_sa.artist_id = $1
         ORDER BY s.title ASC, s.id ASC`,
        [artistId]
    );

    return result.rows;
}

async function findSongsByPlaylistId(playlistId) {
    const result = await pool.query(
        `SELECT ${SONG_COLUMNS}, ${ARTISTS_COLUMN}, ps.position
         FROM playlist_songs ps
         JOIN songs s ON s.id = ps.song_id
         WHERE ps.playlist_id = $1
         ORDER BY ps.position ASC`,
        [playlistId]
    );

    return result.rows;
}

async function attachArtists(client, songId, artistIds) {
    if (artistIds.length === 0) return;

    await client.query(
        `INSERT INTO song_artists (song_id, artist_id)
         SELECT $1, picked.artist_id
         FROM UNNEST($2::int[]) AS picked(artist_id)
         ON CONFLICT DO NOTHING`,
        [songId, artistIds]
    );
}

function buildUpdate({ title, audioUrl, coverUrl, durationSeconds }) {
    const assignments = [];
    const values = [];

    if (title !== undefined) {
        values.push(title);
        assignments.push(`title = $${values.length}`);
    }

    if (audioUrl !== undefined) {
        values.push(audioUrl);
        assignments.push(`audio_url = $${values.length}`);
    }

    if (coverUrl !== undefined) {
        values.push(coverUrl);
        assignments.push(`cover_url = $${values.length}`);
    }

    if (durationSeconds !== undefined) {
        values.push(durationSeconds);
        assignments.push(`duration_seconds = $${values.length}`);
    }

    return { assignments, values };
}

async function createSong(client, { title, audioUrl, coverUrl, durationSeconds, artistIds }) {
    const result = await client.query(
        `INSERT INTO songs (title, audio_url, cover_url, duration_seconds)
         VALUES ($1, $2, $3, $4)
         RETURNING id`,
        [title, audioUrl, coverUrl, durationSeconds]
    );

    await attachArtists(client, result.rows[0].id, artistIds);

    return result.rows[0].id;
}

async function updateSong(client, id, { title, audioUrl, coverUrl, durationSeconds, artistIds }) {
    const { assignments, values } = buildUpdate({ title, audioUrl, coverUrl, durationSeconds });

    let updated;

    if (assignments.length > 0) {
        const result = await client.query(
            `UPDATE songs
             SET ${assignments.join(', ')}
             WHERE id = $${values.length + 1}
             RETURNING id`,
            [...values, id]
        );

        updated = result.rows[0] || null;
    } else {
        const result = await client.query('SELECT id FROM songs WHERE id = $1', [id]);
        updated = result.rows[0] || null;
    }

    if (!updated) return null;

    if (artistIds !== undefined) {
        await client.query('DELETE FROM song_artists WHERE song_id = $1', [id]);
        await attachArtists(client, id, artistIds);
    }

    return updated.id;
}

async function deleteSong(id) {
    const result = await pool.query(
        `DELETE FROM songs
         WHERE id = $1
         RETURNING id, audio_url`,
        [id]
    );

    return result.rows[0] || null;
}

module.exports = {
    findSongs,
    findSongById,
    findSongsByArtistId,
    findSongsByPlaylistId,
    createSong,
    updateSong,
    deleteSong
};
