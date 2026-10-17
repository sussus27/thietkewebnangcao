const { pool } = require('../config/db.config');

const SONG_COLUMNS = `
    s.id,
    s.title,
    s.audio_url,
    s.cover_url,
    s.duration_seconds,
    s.created_at`;

// Tra ve mang ten nghe si, hoac [] neu bai hat chua gan nghe si nao.
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

    // ascending la boolean, nen gia tri noi vao SQL chi co the la 'ASC' hoac 'DESC'.
    const direction = ascending ? 'ASC' : 'DESC';

    // s.id lam khoa phu: nhieu bai hat co the trung created_at, thieu no thi
    // thu tu khong xac dinh va phan trang se trung hoac sot ban ghi.
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

// Thu tu bai hat trong playlist do cot position quyet dinh.
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

// Gan nghe si cho bai hat. Nghe si da co thi bo qua.
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

// Bai hat va danh sach nghe si phai ghi trong cung mot transaction,
// neu khong se co bai hat nam trong database ma khong co nghe si nao.
async function createSong({ title, audioUrl, coverUrl, durationSeconds, artistIds }) {
    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        const result = await client.query(
            `INSERT INTO songs (title, audio_url, cover_url, duration_seconds)
             VALUES ($1, $2, $3, $4)
             RETURNING id`,
            [title, audioUrl, coverUrl, durationSeconds]
        );

        await attachArtists(client, result.rows[0].id, artistIds);
        await client.query('COMMIT');

        return result.rows[0].id;
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
}

// artistIds === null nghia la khong dung toi danh sach nghe si.
// artistIds === [] nghia la bo het nghe si cua bai hat.
async function updateSong(id, { title, audioUrl, coverUrl, durationSeconds, artistIds }) {
    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        const result = await client.query(
            `UPDATE songs
             SET title = COALESCE($2, title),
                 audio_url = COALESCE($3, audio_url),
                 cover_url = COALESCE($4, cover_url),
                 duration_seconds = COALESCE($5, duration_seconds)
             WHERE id = $1
             RETURNING id`,
            [id, title ?? null, audioUrl ?? null, coverUrl ?? null, durationSeconds ?? null]
        );

        if (result.rows.length === 0) {
            await client.query('ROLLBACK');

            return null;
        }

        if (artistIds !== null) {
            await client.query('DELETE FROM song_artists WHERE song_id = $1', [id]);
            await attachArtists(client, id, artistIds);
        }

        await client.query('COMMIT');

        return result.rows[0].id;
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
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
