const { matchedData } = require('express-validator');
const artistService = require('../services/artist.service');

async function listArtists(req, res, next) {
    try {
        const result = await artistService.listArtists(matchedData(req));

        return res.status(200).json(result);
    } catch (error) {
        next(error);
    }
}

async function getArtistById(req, res, next) {
    try {
        const result = await artistService.getArtistById(matchedData(req).id);

        return res.status(200).json(result);
    } catch (error) {
        next(error);
    }
}

async function createArtist(req, res, next) {
    try {
        const result = await artistService.createArtist(matchedData(req));

        return res.status(201).json(result);
    } catch (error) {
        next(error);
    }
}

async function updateArtist(req, res, next) {
    try {
        const { id, ...body } = matchedData(req);
        const result = await artistService.updateArtist(id, body);

        return res.status(200).json(result);
    } catch (error) {
        next(error);
    }
}

async function deleteArtist(req, res, next) {
    try {
        const result = await artistService.deleteArtist(matchedData(req).id);

        return res.status(200).json(result);
    } catch (error) {
        next(error);
    }
}

module.exports = {
    listArtists,
    getArtistById,
    createArtist,
    updateArtist,
    deleteArtist
};
