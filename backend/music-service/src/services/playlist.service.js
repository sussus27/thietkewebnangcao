const playlistRepository = require('../repositories/playlist.repository');
const songRepository = require('../repositories/song.repository');
const AppError = require('../utils/error.util');

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;

async function loadPlaylist(id) {
    const playlist = await playlistRepository.findPlaylistById(id);

    if (!playlist) {
        throw new AppError(404, 'PLAYLIST_NOT_FOUND', 'Playlist not found');
    }

    return playlist;
}

function assertVisible(playlist, userId) {
    if (playlist.owner_id !== null && playlist.owner_id !== userId) {
        throw new AppError(404, 'PLAYLIST_NOT_FOUND', 'Playlist not found');
    }
}

function assertOwner(playlist, userId) {
    if (playlist.owner_id === null) {
        throw new AppError(403, 'SYSTEM_PLAYLIST_READONLY', 'System playlist cannot be modified');
    }

    if (playlist.owner_id !== userId) {
        throw new AppError(403, 'NOT_PLAYLIST_OWNER', 'You do not own this playlist');
    }
}

function buildPlaylistDetail(playlist) {
    return songRepository
        .findSongsByPlaylistId(playlist.id)
        .then((songs) => ({ data: { ...playlist, songs } }));
}

async function listPlaylists(userId, query = {}) {
    const page = query.page ?? DEFAULT_PAGE;
    const limit = query.limit ?? DEFAULT_LIMIT;

    const { items, total } = await playlistRepository.findPlaylists({
        ownerId: userId,
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

async function getPlaylistById(userId, id) {
    const playlist = await loadPlaylist(id);
    assertVisible(playlist, userId);

    return buildPlaylistDetail(playlist);
}

async function createPlaylist(userId, body = {}) {
    const created = await playlistRepository.createPlaylist({
        ownerId: userId,
        name: body.name,
        description: body.description || null,
        coverUrl: body.coverUrl || null
    });

    const playlist = await playlistRepository.findPlaylistById(created.id);

    return { data: { ...playlist, songs: [] } };
}

async function updatePlaylist(userId, id, body = {}) {
    const playlist = await loadPlaylist(id);
    assertOwner(playlist, userId);

    await playlistRepository.updatePlaylist(playlist.id, {
        name: body.name ?? null,
        description: body.description || null,
        coverUrl: body.coverUrl || null
    });

    const updated = await playlistRepository.findPlaylistById(playlist.id);

    return buildPlaylistDetail(updated);
}

async function deletePlaylist(userId, id) {
    const playlist = await loadPlaylist(id);
    assertOwner(playlist, userId);

    await playlistRepository.deletePlaylist(playlist.id);

    return { data: { id: playlist.id, deleted: true } };
}

async function addSongToPlaylist(userId, id, songId) {
    const playlist = await loadPlaylist(id);
    assertOwner(playlist, userId);

    try {
        const added = await playlistRepository.addSong(playlist.id, songId);

        if (!added) {
            throw new AppError(409, 'SONG_ALREADY_IN_PLAYLIST', 'Song is already in this playlist');
        }
    } catch (error) {
        // 23503: khoa ngoai khong ton tai -> bai hat khong co trong songs.
        if (error.code === '23503') {
            throw new AppError(404, 'SONG_NOT_FOUND', 'Song not found');
        }

        throw error;
    }

    const updated = await playlistRepository.findPlaylistById(playlist.id);

    return buildPlaylistDetail(updated);
}

async function removeSongFromPlaylist(userId, id, songId) {
    const playlist = await loadPlaylist(id);
    assertOwner(playlist, userId);

    const removed = await playlistRepository.removeSong(playlist.id, songId);

    if (!removed) {
        throw new AppError(404, 'SONG_NOT_IN_PLAYLIST', 'Song is not in this playlist');
    }

    const updated = await playlistRepository.findPlaylistById(playlist.id);

    return buildPlaylistDetail(updated);
}

module.exports = {
    listPlaylists,
    getPlaylistById,
    createPlaylist,
    updatePlaylist,
    deletePlaylist,
    addSongToPlaylist,
    removeSongFromPlaylist
};
