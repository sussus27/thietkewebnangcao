const songRepository = require('../repositories/song.repository');
const { withTransaction } = require('../config/db.config');
const { publishSongDeleted } = require('../messaging/song.publisher');
const AppError = require('../utils/error.util');

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;

async function listSongs(query = {}) {
    const page = query.page ?? DEFAULT_PAGE;
    const limit = query.limit ?? DEFAULT_LIMIT;

    const { items, total } = await songRepository.findSongs({
        q: query.q || null,
        artistId: query.artistId ?? null,
        ascending: query.order === 'asc',
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

async function getSongById(id) {
    const song = await songRepository.findSongById(id);

    if (!song) {
        throw new AppError(404, 'SONG_NOT_FOUND', 'Song not found');
    }

    return { data: song };
}

async function createSong(body = {}) {
    let createdId;

    try {
        createdId = await withTransaction((client) =>
            songRepository.createSong(client, {
                title: body.title,
                audioUrl: body.audioUrl,
                coverUrl: body.coverUrl ?? null,
                durationSeconds: body.durationSeconds,
                artistIds: body.artistIds ?? []
            })
        );
    } catch (error) {
        if (error.code === '23503') {
            throw new AppError(404, 'ARTIST_NOT_FOUND', 'One or more artists do not exist');
        }

        if (error.code === '23505') {
            throw new AppError(409, 'SONG_ALREADY_EXISTS', 'A song with this audio file already exists');
        }

        throw error;
    }

    return getSongById(createdId);
}

async function updateSong(id, body = {}) {
    let updatedId;

    try {
        updatedId = await withTransaction((client) =>
            songRepository.updateSong(client, id, {
                title: body.title,
                audioUrl: body.audioUrl,
                coverUrl: body.coverUrl === undefined ? undefined : body.coverUrl || null,
                durationSeconds: body.durationSeconds,
                artistIds: body.artistIds
            })
        );
    } catch (error) {
        if (error.code === '23503') {
            throw new AppError(404, 'ARTIST_NOT_FOUND', 'One or more artists do not exist');
        }

        if (error.code === '23505') {
            throw new AppError(409, 'SONG_ALREADY_EXISTS', 'A song with this audio file already exists');
        }

        throw error;
    }

    if (updatedId === null) {
        throw new AppError(404, 'SONG_NOT_FOUND', 'Song not found');
    }

    return getSongById(updatedId);
}

async function deleteSong(id) {
    const deleted = await songRepository.deleteSong(id);

    if (!deleted) {
        throw new AppError(404, 'SONG_NOT_FOUND', 'Song not found');
    }

    try {
        await publishSongDeleted(deleted.audio_url);
    } catch (error) {
        console.error(`Cannot publish song.deleted for song ${deleted.id}:`, error.message);
    }

    return { data: { id: deleted.id, deleted: true } };
}

module.exports = {
    listSongs,
    getSongById,
    createSong,
    updateSong,
    deleteSong
};
