const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, 'Username obbligatorio'],
        unique: true,
        trim: true,
        minlength: [3, 'Username deve essere di almeno 3 caratteri'],
        maxlength: [50, 'Username non può superare i 50 caratteri']
    },
    email: {
        type: String,
        required: [true, 'Email obbligatoria'],
        unique: true,
        trim: true,
        lowercase: true,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Formato email non valido']
    },
    password: {
        type: String,
        required: [true, 'Password obbligatoria'],
        minlength: [6, 'Password deve essere di almeno 6 caratteri']
    },
    firstName: {
        type: String,
        trim: true,
        maxlength: [50, 'Nome max 50 caratteri']
    },
    lastName: {
        type: String,
        trim: true,
        maxlength: [50, 'Cognome max 50 caratteri']
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    
    try {
        const salt = await bcrypt.genSalt(12);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

userSchema.methods.comparePassword = async function(candidatePassword) {
    try {
        return await bcrypt.compare(candidatePassword, this.password);
    } catch (error) {
        throw new Error('Errore password');
    }
};

userSchema.methods.toPublicJSON = function() {
    const user = this.toObject();
    delete user.password;
    return user;
};

userSchema.index({ createdAt: -1 });

module.exports = mongoose.model('User', userSchema);