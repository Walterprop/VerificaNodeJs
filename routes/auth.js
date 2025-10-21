const express = require('express');
const User = require('../models/User');
const { generateToken } = require('../middleware/auth');
const asyncHandler = require('../middleware/asyncHandler');
const BadRequestError = require('../errors/BadRequestError');
const AppError = require('../errors/AppError');

const router = express.Router();

router.post('/register', asyncHandler(async (req, res) => {
    const { username, email, password, firstName, lastName } = req.body;

    if (!username || !email || !password) {
        throw new BadRequestError('Username, email e password sono obbligatori');
    }

    const existingUser = await User.findOne({
        $or: [{ username }, { email }]
    });

    if (existingUser) {
        const field = existingUser.username === username ? 'Username' : 'Email';
        throw new AppError(`${field} già in uso`, 409);
    }

    const user = new User({
        username,
        email,
        password,
        firstName,
        lastName
    });

    await user.save();
    const token = generateToken(user._id);

    res.status(201).json({
        success: true,
        message: 'Registrazione completata',
        token,
        user: user.toPublicJSON()
    });
}));

router.post('/login', asyncHandler(async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        throw new BadRequestError('Username e password sono obbligatori');
    }

    const user = await User.findOne({
        $or: [
            { username: username },
            { email: username }
        ]
    });

    if (!user || !(await user.comparePassword(password))) {
        throw new AppError('Credenziali non valide', 401);
    }

    if (!user.isActive) {
        throw new AppError('Account disattivato', 401);
    }

    const token = generateToken(user._id);

    res.json({
        success: true,
        message: 'Login effettuato',
        token,
        user: user.toPublicJSON()
    });
}));

module.exports = router;