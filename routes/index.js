const express = require('express');
const authRoutes = require('./auth');
const tmdbRoutes = require('./tmdb');
const libraryRoutes = require('./library');

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/', tmdbRoutes);
router.use('/library', libraryRoutes);

module.exports = router;