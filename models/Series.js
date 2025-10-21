const mongoose = require('mongoose');

const seriesSchema = new mongoose.Schema({
    tmdbId: {
        type: Number,
        required: [true, 'TMDb ID obbligatorio'],
        unique: true
    },
    name: {
        type: String,
        required: [true, 'nome obbligatorio'],
        trim: true,
        maxlength: [200, 'nome max 200 caratteri']
    },
    originalName: {
        type: String,
        trim: true
    },
    overview: {
        type: String,
        trim: true,
        maxlength: [2000, 'trama 2000 caratteri']
    },
    posterPath: String,
    backdropPath: String,
    firstAirDate: Date,
    lastAirDate: Date,
    numberOfSeasons: Number,
    numberOfEpisodes: Number,
    episodeRunTime: [Number],
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
    status: String,
    type: String, 
    
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'UserId obbligatorio']
    },
    watchStatus: {
        type: String,
        enum: ['to_watch', 'watching', 'completed', 'dropped'],
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
        maxlength: [1000, 'commento max 1000 caratteri']
    },
    currentSeason: {
        type: Number,
        default: 1,
        min: 1
    },
    currentEpisode: {
        type: Number,
        default: 1,
        min: 1
    },
    startedAt: Date,
    completedAt: Date,
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

seriesSchema.index({ userId: 1, addedAt: -1 });
seriesSchema.index({ userId: 1, watchStatus: 1 });
seriesSchema.index({ userId: 1, userRating: -1 });
seriesSchema.index({ tmdbId: 1, userId: 1 });

seriesSchema.statics.getSeriesByUser = function(userId, filter = {}) {
    return this.find({ userId, ...filter }).sort({ addedAt: -1 });
};

seriesSchema.statics.getUserStats = function(userId) {
    return this.aggregate([
        { $match: { userId: new mongoose.Types.ObjectId(userId) } },
        {
            $group: {
                _id: null,
                totalSeries: { $sum: 1 },
                watchingSeries: {
                    $sum: { $cond: [{ $eq: ['$watchStatus', 'watching'] }, 1, 0] }
                },
                completedSeries: {
                    $sum: { $cond: [{ $eq: ['$watchStatus', 'completed'] }, 1, 0] }
                },
                toWatchSeries: {
                    $sum: { $cond: [{ $eq: ['$watchStatus', 'to_watch'] }, 1, 0] }
                },
                averageRating: {
                    $avg: '$userRating'
                }
            }
        }
    ]);
};

seriesSchema.virtual('owner', {
    ref: 'User',
    localField: 'userId',
    foreignField: '_id',
    justOne: true
});

seriesSchema.virtual('progress').get(function() {
    if (this.numberOfEpisodes && this.currentSeason && this.currentEpisode) {
        const estimatedCurrentEpisode = ((this.currentSeason - 1) * (this.numberOfEpisodes / this.numberOfSeasons)) + this.currentEpisode;
        return Math.min(100, Math.round((estimatedCurrentEpisode / this.numberOfEpisodes) * 100));
    }
    return 0;
});

seriesSchema.set('toJSON', { virtuals: true });
seriesSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Series', seriesSchema);