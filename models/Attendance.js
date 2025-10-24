const mongoose = require('mongoose');

const AttendanceSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    subject: { type: String, required: true },
    date: { type: Date, required: true },
    status: { 
        type: String, 
        enum: ['Present', 'Absent'], 
        required: true 
    },
});

module.exports = mongoose.model('Attendance', AttendanceSchema);