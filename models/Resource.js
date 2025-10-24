const mongoose = require('mongoose');

const ResourceSchema = new mongoose.Schema({
    subject: { type: String, required: true },
    title: { type: String, required: true },
    type: { type: String, enum: ['YouTube', 'Blog'], required: true },
    url: { type: String, required: true },
});

module.exports = mongoose.model('Resource', ResourceSchema);