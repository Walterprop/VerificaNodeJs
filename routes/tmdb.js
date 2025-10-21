const express = require('express');
const { optionalAuth } = require('../middleware/auth');
const tmdbService = require('../services/tmdbService');
const asyncHandler = require('../middleware/asyncHandler');
const BadRequestError = require('../errors/BadRequestError');

const router = express.Router();

router.get('/search', optionalAuth, asyncHandler(async (req, res) => {
    const { q, type = 'multi', page = 1 } = req.query;

    if (!q) {
        throw new BadRequestError('Query di ricerca richiesta');
    }

    let results;
    switch (type) {
        case 'movie':
            results = await tmdbService.searchMovies(q, page);
            break;
        case 'tv':
            results = await tmdbService.searchTVShows(q, page);
            break;
        default:
            results = await tmdbService.searchMulti(q, page);
    }

    res.json({
        success: true,
        data: results
    });
}));

router.get('/popular/movies', optionalAuth, asyncHandler(async (req, res) => {
    const { page = 1 } = req.query;
    const results = await tmdbService.getPopularMovies(page);

    res.json({
        success: true,
        data: results
    });
}));

router.get('/popular/tv', optionalAuth, asyncHandler(async (req, res) => {
    const { page = 1 } = req.query;
    const results = await tmdbService.getPopularTVShows(page);

    res.json({
        success: true,
        data: results
    });
}));

router.get('/trending/:type?', optionalAuth, asyncHandler(async (req, res) => {
    const { type = 'all' } = req.params;
    const { time_window = 'day' } = req.query;
    
    const results = await tmdbService.getTrending(type, time_window);

    res.json({
        success: true,
        data: results
    });
}));

router.get('/movie/:id', optionalAuth, asyncHandler(async (req, res) => {
    const { id } = req.params;
    const movieDetails = await tmdbService.getMovieDetails(id);

    res.json({
        success: true,
        data: movieDetails
    });
}));

router.get('/tv/:id', optionalAuth, asyncHandler(async (req, res) => {
    const { id } = req.params;
    const tvDetails = await tmdbService.getTVShowDetails(id);

    res.json({
        success: true,
        data: tvDetails
    });
}));

module.exports = router;