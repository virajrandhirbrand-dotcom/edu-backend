const mongoose = require('mongoose');

const SubjectSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    grade: { type: String, required: true }, // e.g., 'A', 'B+', 'C'
    credits: { type: Number, required: true },
    semester: { type: Number, required: true },
});

module.exports = mongoose.model('Subject', SubjectSchema);