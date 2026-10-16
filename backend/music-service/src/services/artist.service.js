const artistRepository = require('../repositories/artist.repository');
const songRepository = require('../repositories/song.repository');
const AppError = require('../utils/error.util');

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;

async function listArtists(query = {}) {
    const page = query.page ?? DEFAULT_PAGE;
    const limit = query.limit ?? DEFAULT_LIMIT;

    const { items, total } = await artistRepository.findArtists({
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

async function getArtistById(id) {
    const artist = await artistRepository.findArtistById(id);

    if (!artist) {
        throw new AppError(404, 'ARTIST_NOT_FOUND', 'Artist not found');
    }

    const songs = await songRepository.findSongsByArtistId(id);

    return {
        data: {
            ...artist,
            songs
        }
    };
}

async function createArtist(body = {}) {
    const created = await artistRepository.createArtist({ name: body.name });

    return getArtistById(created.id);
}

async function updateArtist(id, body = {}) {
    const updated = await artistRepository.updateArtist(id, {
        name: body.name ?? null
    });

    if (updated === null) {
        throw new AppError(404, 'ARTIST_NOT_FOUND', 'Artist not found');
    }

    return getArtistById(updated.id);
}

async function deleteArtist(id) {
    const deleted = await artistRepository.deleteArtist(id);

    if (!deleted) {
        throw new AppError(404, 'ARTIST_NOT_FOUND', 'Artist not found');
    }

    return { data: { id: deleted.id, deleted: true } };
}

module.exports = {
    listArtists,
    getArtistById,
    createArtist,
    updateArtist,
    deleteArtist
};
