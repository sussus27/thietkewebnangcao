const { matchedData } = require('express-validator');
const songService = require('../services/song.service');

async function listSongs(req, res, next) {
    try {
        const result = await songService.listSongs(matchedData(req));

        return res.status(200).json(result);
    } catch (error) {
        next(error);
    }
}

async function getSongById(req, res, next) {
    try {
        const result = await songService.getSongById(matchedData(req).id);

        return res.status(200).json(result);
    } catch (error) {
        next(error);
    }
}

async function createSong(req, res, next) {
    try {
        const result = await songService.createSong(matchedData(req));

        return res.status(201).json(result);
    } catch (error) {
        next(error);
    }
}

async function updateSong(req, res, next) {
    try {
        const { id, ...body } = matchedData(req, { includeOptionals: true });
        const result = await songService.updateSong(id, body);

        return res.status(200).json(result);
    } catch (error) {
        next(error);
    }
}

async function deleteSong(req, res, next) {
    try {
        const result = await songService.deleteSong(matchedData(req).id);

        return res.status(200).json(result);
    } catch (error) {
        next(error);
    }
}

module.exports = {
    listSongs,
    getSongById,
    createSong,
    updateSong,
    deleteSong
};
