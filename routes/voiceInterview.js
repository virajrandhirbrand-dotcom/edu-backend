const express = require('express');
const router = express.Router();
const { analyzeResume, generateFeedback, upload } = require('../controllers/voiceInterviewController');
const { checkAuth } = require('../middleware/auth');

// Create uploads directory if it doesn't exist
const fs = require('fs');
const path = require('path');
const uploadsDir = path.join(__dirname, '../uploads/voice-interview');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Analyze resume and generate interview questions
router.post('/analyze-resume', checkAuth, upload.single('resume'), analyzeResume);

// Generate feedback based on interview responses
router.post('/feedback', checkAuth, generateFeedback);

module.exports = router;



