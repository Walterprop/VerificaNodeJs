const express = require('express');
const Movie = require('../models/Movie');
const Series = require('../models/Series');
const { authenticateToken } = require('../middleware/auth');
const tmdbService = require('../services/tmdbService');

const router = express.Router();

router.post('/movies', authenticateToken, async (req, res) => {
    try {
        const { tmdbId } = req.body;
        
        if (!tmdbId) {
            return res.status(400).json({
                success: false,
                message: 'TMDb ID richiesto'
            });
        }

        const existing = await Movie.findOne({ tmdbId, userId: req.user._id });
        if (existing) {
            return res.status(409).json({
                success: false,
                message: 'Film già presente nella libreria'
            });
        }

        const movieDetails = await tmdbService.getMovieDetails(tmdbId);

        const movie = new Movie({
            tmdbId: movieDetails.id,
            title: movieDetails.title,
            originalTitle: movieDetails.original_title,
            overview: movieDetails.overview,
            posterPath: movieDetails.poster_path,
            backdropPath: movieDetails.backdrop_path,
            releaseDate: movieDetails.release_date ? new Date(movieDetails.release_date) : null,
            runtime: movieDetails.runtime,
            genres: movieDetails.genres,
            voteAverage: movieDetails.vote_average,
            voteCount: movieDetails.vote_count,
            popularity: movieDetails.popularity,
            originalLanguage: movieDetails.original_language,
            adult: movieDetails.adult,
            userId: req.user._id,
            ...req.body
        });

        await movie.save();

        res.status(201).json({
            success: true,
            message: 'Film aggiunto alla libreria',
            data: movie
        });

    } catch (error) {
        console.error('Errore aggiunta film:', error);
        res.status(500).json({
            success: false,
            message: 'Errore nell\'aggiunta del film'
        });
    }
});

router.post('/series', authenticateToken, async (req, res) => {
    try {
        const { tmdbId } = req.body;
        
        if (!tmdbId) {
            return res.status(400).json({
                success: false,
                message: 'TMDb ID richiesto'
            });
        }

        const existing = await Series.findOne({ tmdbId, userId: req.user._id });
        if (existing) {
            return res.status(409).json({
                success: false,
                message: 'Serie TV già presente nella libreria'
            });
        }

        const tvDetails = await tmdbService.getTVShowDetails(tmdbId);

        const series = new Series({
            tmdbId: tvDetails.id,
            name: tvDetails.name,
            originalName: tvDetails.original_name,
            overview: tvDetails.overview,
            posterPath: tvDetails.poster_path,
            backdropPath: tvDetails.backdrop_path,
            firstAirDate: tvDetails.first_air_date ? new Date(tvDetails.first_air_date) : null,
            lastAirDate: tvDetails.last_air_date ? new Date(tvDetails.last_air_date) : null,
            numberOfSeasons: tvDetails.number_of_seasons,
            numberOfEpisodes: tvDetails.number_of_episodes,
            episodeRunTime: tvDetails.episode_run_time,
            genres: tvDetails.genres,
            voteAverage: tvDetails.vote_average,
            voteCount: tvDetails.vote_count,
            popularity: tvDetails.popularity,
            originalLanguage: tvDetails.original_language,
            adult: tvDetails.adult,
            status: tvDetails.status,
            type: tvDetails.type,
            userId: req.user._id,
            ...req.body
        });

        await series.save();

        res.status(201).json({
            success: true,
            message: 'Serie TV aggiunta alla libreria',
            data: series
        });

    } catch (error) {
        console.error('Errore aggiunta serie TV:', error);
        res.status(500).json({
            success: false,
            message: 'Errore nell\'aggiunta della serie TV'
        });
    }
});

router.get('/movies', authenticateToken, async (req, res) => {
    try {
        const { status, page = 1, limit = 20 } = req.query;
        const filter = {};
        
        if (status) filter.status = status;

        const movies = await Movie.getMoviesByUser(req.user._id, filter)
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const total = await Movie.countDocuments({ userId: req.user._id, ...filter });

        res.json({
            success: true,
            data: {
                movies,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    pages: Math.ceil(total / limit)
                }
            }
        });

    } catch (error) {
        console.error('Errore recupero film:', error);
        res.status(500).json({
            success: false,
            message: 'Errore nel recupero dei film'
        });
    }
});

router.get('/series', authenticateToken, async (req, res) => {
    try {
        const { watchStatus, page = 1, limit = 20 } = req.query;
        const filter = {};
        
        if (watchStatus) filter.watchStatus = watchStatus;

        const series = await Series.getSeriesByUser(req.user._id, filter)
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const total = await Series.countDocuments({ userId: req.user._id, ...filter });

        res.json({
            success: true,
            data: {
                series,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    pages: Math.ceil(total / limit)
                }
            }
        });

    } catch (error) {
        console.error('Errore recupero serie TV:', error);
        res.status(500).json({
            success: false,
            message: 'Errore nel recupero delle serie TV'
        });
    }
});

router.put('/movies/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        const movie = await Movie.findOneAndUpdate(
            { _id: id, userId: req.user._id },
            updates,
            { new: true, runValidators: true }
        );

        if (!movie) {
            return res.status(404).json({
                success: false,
                message: 'Film non trovato'
            });
        }

        res.json({
            success: true,
            message: 'Film aggiornato',
            data: movie
        });

    } catch (error) {
        console.error('Errore aggiornamento film:', error);
        res.status(500).json({
            success: false,
            message: 'Errore nell\'aggiornamento del film'
        });
    }
});

router.put('/series/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        const series = await Series.findOneAndUpdate(
            { _id: id, userId: req.user._id },
            updates,
            { new: true, runValidators: true }
        );

        if (!series) {
            return res.status(404).json({
                success: false,
                message: 'Serie TV non trovata'
            });
        }

        res.json({
            success: true,
            message: 'Serie TV aggiornata',
            data: series
        });

    } catch (error) {
        console.error('Errore aggiornamento serie TV:', error);
        res.status(500).json({
            success: false,
            message: 'Errore nell\'aggiornamento della serie TV'
        });
    }
});

router.delete('/movies/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;

        const movie = await Movie.findOneAndDelete({ _id: id, userId: req.user._id });

        if (!movie) {
            return res.status(404).json({
                success: false,
                message: 'Film non trovato'
            });
        }

        res.json({
            success: true,
            message: 'Film rimosso dalla libreria'
        });

    } catch (error) {
        console.error('Errore rimozione film:', error);
        res.status(500).json({
            success: false,
            message: 'Errore nella rimozione del film'
        });
    }
});

router.delete('/series/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;

        const series = await Series.findOneAndDelete({ _id: id, userId: req.user._id });

        if (!series) {
            return res.status(404).json({
                success: false,
                message: 'Serie TV non trovata'
            });
        }

        res.json({
            success: true,
            message: 'Serie TV rimossa dalla libreria'
        });

    } catch (error) {
        console.error('Errore rimozione serie TV:', error);
        res.status(500).json({
            success: false,
            message: 'Errore nella rimozione della serie TV'
        });
    }
});

router.get('/stats', authenticateToken, async (req, res) => {
    try {
        const movieStats = await Movie.getUserStats(req.user._id);
        const seriesStats = await Series.getUserStats(req.user._id);

        res.json({
            success: true,
            data: {
                movies: movieStats[0] || {
                    totalMovies: 0,
                    watchedMovies: 0,
                    toWatchMovies: 0,
                    averageRating: null
                },
                series: seriesStats[0] || {
                    totalSeries: 0,
                    watchingSeries: 0,
                    completedSeries: 0,
                    toWatchSeries: 0,
                    averageRating: null
                }
            }
        });

    } catch (error) {
        console.error('Errore statistiche:', error);
        res.status(500).json({
            success: false,
            message: 'Errore nel recupero delle statistiche'
        });
    }
});

module.exports = router;