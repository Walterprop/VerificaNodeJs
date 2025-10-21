const express = require('express');
const Movie = require('../models/Movie');
const Series = require('../models/Series');
const { authenticateToken } = require('../middleware/auth');
const tmdbService = require('../services/tmdbService');
const asyncHandler = require('../middleware/asyncHandler');
const BadRequestError = require('../errors/BadRequestError');
const NotFoundError = require('../errors/NotFoundError');
const AppError = require('../errors/AppError');

const router = express.Router();

router.post('/movies', authenticateToken, asyncHandler(async (req, res) => {
    const { tmdbId } = req.body;
    
    if (!tmdbId) {
        throw new BadRequestError('TMDb ID richiesto');
    }

    const existing = await Movie.findOne({ tmdbId, userId: req.user._id });
    if (existing) {
        throw new AppError('Film già presente nella libreria', 409);
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
}));

router.post('/series', authenticateToken, asyncHandler(async (req, res) => {
    const { tmdbId } = req.body;
    
    if (!tmdbId) {
        throw new BadRequestError('TMDb ID richiesto');
    }

    const existing = await Series.findOne({ tmdbId, userId: req.user._id });
    if (existing) {
        throw new AppError('Serie TV già presente nella libreria', 409);
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
}));

router.get('/movies', authenticateToken, asyncHandler(async (req, res) => {
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
}));

router.get('/series', authenticateToken, asyncHandler(async (req, res) => {
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
}));

router.put('/movies/:id', authenticateToken, asyncHandler(async (req, res) => {
    const { id } = req.params;
    const updates = req.body;

    const movie = await Movie.findOneAndUpdate(
        { _id: id, userId: req.user._id },
        updates,
        { new: true, runValidators: true }
    );

    if (!movie) {
        throw new NotFoundError('Film non trovato');
    }

    res.json({
        success: true,
        message: 'Film aggiornato',
        data: movie
    });
}));

router.put('/series/:id', authenticateToken, asyncHandler(async (req, res) => {
    const { id } = req.params;
    const updates = req.body;

    const series = await Series.findOneAndUpdate(
        { _id: id, userId: req.user._id },
        updates,
        { new: true, runValidators: true }
    );

    if (!series) {
        throw new NotFoundError('Serie TV non trovata');
    }

    res.json({
        success: true,
        message: 'Serie TV aggiornata',
        data: series
    });
}));

router.delete('/movies/:id', authenticateToken, asyncHandler(async (req, res) => {
    const { id } = req.params;

    const movie = await Movie.findOneAndDelete({ _id: id, userId: req.user._id });

    if (!movie) {
        throw new NotFoundError('Film non trovato');
    }

    res.json({
        success: true,
        message: 'Film rimosso dalla libreria'
    });
}));

router.delete('/series/:id', authenticateToken, asyncHandler(async (req, res) => {
    const { id } = req.params;

    const series = await Series.findOneAndDelete({ _id: id, userId: req.user._id });

    if (!series) {
        throw new NotFoundError('Serie TV non trovata');
    }

    res.json({
        success: true,
        message: 'Serie TV rimossa dalla libreria'
    });
}));

router.get('/stats', authenticateToken, asyncHandler(async (req, res) => {
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
}));

module.exports = router;