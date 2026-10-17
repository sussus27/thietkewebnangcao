const { matchedData } = require('express-validator');
const playlistService = require('../services/playlist.service');

async function listPlaylists(req, res, next) {
    try {
        const result = await playlistService.listPlaylists(req.user.id, matchedData(req));

        return res.status(200).json(result);
    } catch (error) {
        next(error);
    }
}

async function getPlaylistById(req, res, next) {
    try {
        const result = await playlistService.getPlaylistById(req.user.id, matchedData(req).id);

        return res.status(200).json(result);
    } catch (error) {
        next(error);
    }
}

async function createPlaylist(req, res, next) {
    try {
        const result = await playlistService.createPlaylist(req.user.id, matchedData(req));

        return res.status(201).json(result);
    } catch (error) {
        next(error);
    }
}

async function updatePlaylist(req, res, next) {
    try {
        const { id, ...body } = matchedData(req, { includeOptionals: true });
        const result = await playlistService.updatePlaylist(req.user.id, id, body);

        return res.status(200).json(result);
    } catch (error) {
        next(error);
    }
}

async function deletePlaylist(req, res, next) {
    try {
        const result = await playlistService.deletePlaylist(req.user.id, matchedData(req).id);

        return res.status(200).json(result);
    } catch (error) {
        next(error);
    }
}

async function addSong(req, res, next) {
    try {
        const { id, songId } = matchedData(req);
        const result = await playlistService.addSongToPlaylist(req.user.id, id, songId);

        return res.status(200).json(result);
    } catch (error) {
        next(error);
    }
}

async function removeSong(req, res, next) {
    try {
        const { id, songId } = matchedData(req);
        const result = await playlistService.removeSongFromPlaylist(req.user.id, id, songId);

        return res.status(200).json(result);
    } catch (error) {
        next(error);
    }
}

module.exports = {
    listPlaylists,
    getPlaylistById,
    createPlaylist,
    updatePlaylist,
    deletePlaylist,
    addSong,
    removeSong
};
