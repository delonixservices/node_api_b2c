const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const userSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    last_name: {
        type: String,
        required: true
    },
    mobile: {
        type: String,
        required: function() {
            return !this.isGoogleUser; // Only required for non-Google users
        }
    },
    email: {
        type: String,
        required: true,
        unique: true, // Make email unique
        index: true   // Add index for better query performance
    },
    password: {
        type: String,
        required: function() {
            return !this.isGoogleUser; // Only required for non-Google users
        }
    },
    verified: {
        type: Boolean,
        required: true,
        default: false
    },
    isGoogleUser: {
        type: Boolean,
        default: false
    },
    googleId: {
        type: String,
        sparse: true, // Allows null values but ensures uniqueness for non-null values
        unique: true
    },
    otp: {
        type: String
    },
    password_reset_token: {
        type: String
    },
    password_reset_expiry: {
        type: Date
    }
}, {
    timestamps: {
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    }
});

// Add a compound index for email to ensure uniqueness
userSchema.index({ email: 1 }, { unique: true });

module.exports = mongoose.model('User', userSchema, 'users');