const mongoose = require('mongoose');

const MaterialSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    type: {
        type: String,
        enum: ['video', 'pdf', 'slides'],
        required: true
    },
    course: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
        required: true
    },
    uploadedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    filePath: {
        type: String,
        required: true
    },
    fileName: {
        type: String,
        required: true
    },
    fileSize: {
        type: Number,
        required: true
    },
    mimeType: {
        type: String,
        required: true
    },
    // For video materials
    duration: {
        type: Number, // in seconds
        default: null
    },
    thumbnail: {
        type: String, // path to thumbnail image
        default: null
    },
    // For slides
    slideCount: {
        type: Number,
        default: null
    },
    // Access control
    isPublic: {
        type: Boolean,
        default: true
    },
    tags: [{
        type: String,
        trim: true
    }],
    // Metadata
    uploadDate: {
        type: Date,
        default: Date.now
    },
    lastModified: {
        type: Date,
        default: Date.now
    },
    downloadCount: {
        type: Number,
        default: 0
    },
    viewCount: {
        type: Number,
        default: 0
    }
});

// Index for better query performance
MaterialSchema.index({ course: 1, type: 1 });
MaterialSchema.index({ uploadedBy: 1 });
MaterialSchema.index({ uploadDate: -1 });

module.exports = mongoose.model('Material', MaterialSchema);
