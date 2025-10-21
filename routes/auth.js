const express = require('express');
const User = require('../models/User');
const { generateToken } = require('../middleware/auth');

const router = express.Router();

router.post('/register', async (req, res) => {
    try {
        const { username, email, password, firstName, lastName } = req.body;

        if (!username || !email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Username, email e password sono obbligatori'
            });
        }

        const existingUser = await User.findOne({
            $or: [{ username }, { email }]
        });

        if (existingUser) {
            const field = existingUser.username === username ? 'Username' : 'Email';
            return res.status(409).json({
                success: false,
                message: `${field} già in uso`
            });
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

    } catch (error) {
        console.error('Errore registrazione:', error);
        res.status(500).json({
            success: false,
            message: 'Errore del server'
        });
    }
});

router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({
                success: false,
                message: 'Username e password sono obbligatori'
            });
        }

        const user = await User.findOne({
            $or: [
                { username: username },
                { email: username }
            ]
        });

        if (!user || !(await user.comparePassword(password))) {
            return res.status(401).json({
                success: false,
                message: 'Credenziali non valide'
            });
        }

        if (!user.isActive) {
            return res.status(401).json({
                success: false,
                message: 'Account disattivato'
            });
        }

        const token = generateToken(user._id);

        res.json({
            success: true,
            message: 'Login effettuato',
            token,
            user: user.toPublicJSON()
        });

    } catch (error) {
        console.error('Errore login:', error);
        res.status(500).json({
            success: false,
            message: 'Errore del server'
        });
    }
});

module.exports = router;