const mongoose = require('mongoose');

const PublicationSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    journal: { type: String, required: true },
    year: { type: Number, required: true },
});

module.exports = mongoose.model('Publication', PublicationSchema);