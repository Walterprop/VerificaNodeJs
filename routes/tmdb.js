const express = require('express');
const { optionalAuth } = require('../middleware/auth');
const tmdbService = require('../services/tmdbService');

const router = express.Router();

router.get('/search', optionalAuth, async (req, res) => {
    try {
        const { q, type = 'multi', page = 1 } = req.query;

        if (!q) {
            return res.status(400).json({
                success: false,
                message: 'Query di ricerca richiesta'
            });
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

    } catch (error) {
        console.error('Errore ricerca:', error);
        res.status(500).json({
            success: false,
            message: 'Errore nella ricerca'
        });
    }
});

router.get('/popular/movies', optionalAuth, async (req, res) => {
    try {
        const { page = 1 } = req.query;
        const results = await tmdbService.getPopularMovies(page);

        res.json({
            success: true,
            data: results
        });
    } catch (error) {
        console.error('Errore film popolari:', error);
        res.status(500).json({
            success: false,
            message: 'Errore nel recupero film popolari'
        });
    }
});

router.get('/popular/tv', optionalAuth, async (req, res) => {
    try {
        const { page = 1 } = req.query;
        const results = await tmdbService.getPopularTVShows(page);

        res.json({
            success: true,
            data: results
        });
    } catch (error) {
        console.error('Errore serie TV popolari:', error);
        res.status(500).json({
            success: false,
            message: 'Errore nel recupero serie TV popolari'
        });
    }
});

router.get('/trending/:type?', optionalAuth, async (req, res) => {
    try {
        const { type = 'all' } = req.params;
        const { time_window = 'day' } = req.query;
        
        const results = await tmdbService.getTrending(type, time_window);

        res.json({
            success: true,
            data: results
        });
    } catch (error) {
        console.error('Errore trending:', error);
        res.status(500).json({
            success: false,
            message: 'Errore nel recupero contenuti trending'
        });
    }
});

router.get('/movie/:id', optionalAuth, async (req, res) => {
    try {
        const { id } = req.params;
        const movieDetails = await tmdbService.getMovieDetails(id);

        res.json({
            success: true,
            data: movieDetails
        });
    } catch (error) {
        console.error('Errore dettagli film:', error);
        res.status(500).json({
            success: false,
            message: 'Errore nel recupero dettagli film'
        });
    }
});

router.get('/tv/:id', optionalAuth, async (req, res) => {
    try {
        const { id } = req.params;
        const tvDetails = await tmdbService.getTVShowDetails(id);

        res.json({
            success: true,
            data: tvDetails
        });
    } catch (error) {
        console.error('Errore dettagli serie TV:', error);
        res.status(500).json({
            success: false,
            message: 'Errore nel recupero dettagli serie TV'
        });
    }
});

module.exports = router;