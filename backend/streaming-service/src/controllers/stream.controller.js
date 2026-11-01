const streamService = require('../services/stream.service');

async function streamSong(req, res, next) {
    try {
        const songId = Number.parseInt(req.params.songId, 10);
        const streamUrl = await streamService.resolveStreamUrl(songId);

        res.set('Cache-Control', 'no-store');

        return res.redirect(302, streamUrl);
    } catch (error) {
        next(error);
    }
}

module.exports = {
    streamSong
};
