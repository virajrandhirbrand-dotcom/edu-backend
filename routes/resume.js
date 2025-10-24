const express = require('express');
const router = express.Router();
const multer = require('multer');
const { analyzeResume } = require('../controllers/resumeController');
const { checkAuth } = require('../middleware/auth');

// Configure multer to store the file in memory
const storage = multer.memoryStorage();
const upload = multer({ 
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
    fileFilter: (req, file, cb) => {
        // Accept all common file types for resume
        const allowedMimes = [
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'text/plain',
            'application/octet-stream'
        ];
        if (allowedMimes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(null, true); // Allow it anyway, backend will handle
        }
    }
});

// This route handles both file uploads and text input
// Always try to apply multer, but don't fail if there's no file
router.post('/analyze', checkAuth, upload.single('resume'), analyzeResume);

module.exports = router;