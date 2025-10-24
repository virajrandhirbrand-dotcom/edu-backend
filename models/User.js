const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: {
        type: String,
        enum: ['student', 'ug', 'pg', 'admin'],
        default: 'student'
    },
    firstName: { type: String, default: '' },
    lastName: { type: String, default: '' },
    profilePicture: { type: String, default: '' },
    class: { type: String, default: '' }, // For students: 1, 2, 3, 4, 5, 6, 7, 8, 9, 10
    isActive: { type: Boolean, default: true },
    lastLogin: { type: Date, default: Date.now },
    createdAt: { type: Date, default: Date.now }
});

UserSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

module.exports = mongoose.model('User', UserSchema);