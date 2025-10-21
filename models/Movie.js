const mongoose = require('mongoose');

const movieSchema = new mongoose.Schema({
    tmdbId: {
        type: Number,
        required: [true, 'TMDb ID obbligatorio'],
        unique: true
    },
    title: {
        type: String,
        required: [true, 'titolo obbligatorio'],
        trim: true,
        maxlength: [200, 'max 200 caratteri']
    },
    originalTitle: {
        type: String,
        trim: true
    },
    overview: {
        type: String,
        trim: true,
        maxlength: [2000, 'max 2000 caratteri']
    },
    posterPath: String,
    backdropPath: String,
    releaseDate: Date,
    runtime: Number,
    genres: [{
        id: Number,
        name: String
    }],
    voteAverage: Number,
    voteCount: Number,
    popularity: Number,
    originalLanguage: String,
    adult: {
        type: Boolean,
        default: false
    },
    
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'UserId obbligatorio']
    },
    status: {
        type: String,
        enum: ['to_watch', 'watched', 'watching'],
        default: 'to_watch'
    },
    userRating: {
        type: Number,
        min: 0,
        max: 10,
        validate: {
            validator: function(v) {
                return v === null || v === undefined || (v >= 0 && v <= 10);
            },
            message: 'La valutazione deve essere tra 0 e 10'
        }
    },
    userComment: {
        type: String,
        trim: true,
        maxlength: [1000, 'max 1000 caratteri']
    },
    watchedAt: Date,
    addedAt: {
        type: Date,
        default: Date.now
    },
    lists: [{
        type: String,
        trim: true
    }]
}, {
    timestamps: true
});

movieSchema.index({ userId: 1, addedAt: -1 });
movieSchema.index({ userId: 1, status: 1 });
movieSchema.index({ userId: 1, userRating: -1 });
movieSchema.index({ tmdbId: 1, userId: 1 });

movieSchema.statics.getMoviesByUser = function(userId, filter = {}) {
    return this.find({ userId, ...filter }).sort({ addedAt: -1 });
};

movieSchema.statics.getUserStats = function(userId) {
    return this.aggregate([
        { $match: { userId: new mongoose.Types.ObjectId(userId) } },
        {
            $group: {
                _id: null,
                totalMovies: { $sum: 1 },
                watchedMovies: {
                    $sum: { $cond: [{ $eq: ['$status', 'watched'] }, 1, 0] }
                },
                toWatchMovies: {
                    $sum: { $cond: [{ $eq: ['$status', 'to_watch'] }, 1, 0] }
                },
                averageRating: {
                    $avg: '$userRating'
                }
            }
        }
    ]);
};

movieSchema.virtual('owner', {
    ref: 'User',
    localField: 'userId',
    foreignField: '_id',
    justOne: true
});

movieSchema.set('toJSON', { virtuals: true });
movieSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Movie', movieSchema);