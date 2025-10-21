require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const mongoose = require('mongoose');
const { passport } = require('./middleware/auth');
const apiRoutes = require('./routes');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(passport.initialize());

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ShowTracker')
    .then(() => console.log('MongoDB connesso'))
    .catch(err => {
        console.error('Errore MongoDB:', err);
        process.exit(1);
    });

app.use(cors({
    origin: process.env.NODE_ENV === 'production' 
        ? ['https://yourdomain.com'] 
        : ['http://localhost:3000', 'http://127.0.0.1:3000'],
    credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

app.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'register.html'));
});

app.get('/app', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'app.html'));
});

app.use('/api', apiRoutes);

app.use((err, req, res, next) => {
    console.error('Errore server:', err);
    res.status(500).json({
        success: false,
        message: 'Errore interno del server'
    });
});

app.listen(PORT, () => {
    console.log(`🎬 ShowTracker avviato su http://localhost:${PORT}`);
    console.log(`📱 Apri il browser e vai su http://localhost:${PORT} per iniziare`);
    console.log(`🗄️  Database: ${process.env.MONGODB_URI || 'mongodb://localhost:27017/ShowTracker'}`);
    console.log(`🔐 JWT Secret configurato: ${process.env.JWT_SECRET ? 'Sì' : 'No'}`);
    console.log(`🎥 TMDb API configurata: ${process.env.TMDB_API_KEY ? 'Sì' : 'No'}`);
});

module.exports = app;