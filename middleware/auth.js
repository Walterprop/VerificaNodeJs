const jwt = require('jsonwebtoken');
const passport = require('passport');
const { Strategy: JwtStrategy, ExtractJwt } = require('passport-jwt');
const User = require('../models/User');

const jwtOptions = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.JWT_SECRET,
    issuer: 'showtracker-app',
    audience: 'showtracker-users'
};

passport.use(new JwtStrategy(jwtOptions, async (payload, done) => {
    try {
        const user = await User.findById(payload.userId).select('-password');
        
        if (user && user.isActive) {
            return done(null, user);
        } else {
            return done(null, false);
        }
    } catch (error) {
        return done(error, false);
    }
}));

const authenticateToken = (req, res, next) => {
    passport.authenticate('jwt', { session: false }, (err, user, info) => {
        if (err) {
            return res.status(500).json({
                success: false,
                message: 'Errore del server'
            });
        }

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Errore Token'
            });
        }

        req.user = user;
        next();
    })(req, res, next);
};

const optionalAuth = (req, res, next) => {
    passport.authenticate('jwt', { session: false }, (err, user, info) => {
        if (user && !err) {
            req.user = user;
        }
        next();
    })(req, res, next);
};

const requireAdmin = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            message: 'Autenticazione richiesta'
        });
    }

    if (!req.user.isAdmin) {
        return res.status(403).json({
            success: false,
            message: 'Privilegi amministratore richiesti'
        });
    }

    next();
};
const generateToken = (userId) => {
    return jwt.sign(
        { userId },
        process.env.JWT_SECRET,
        { 
            expiresIn: '7d',
            issuer: 'showtracker-app',
            audience: 'showtracker-users'
        }
    );
};

const generateRefreshToken = (userId) => {
    return jwt.sign(
        { userId, type: 'refresh' },
        process.env.JWT_SECRET,
        { 
            expiresIn: '30d',
            issuer: 'showtracker-app',
            audience: 'showtracker-users'
        }
    );
};

module.exports = {
    authenticateToken,
    optionalAuth,
    requireAdmin,
    generateToken,
    generateRefreshToken,
    passport
};