const express = require('express');
const router = express.Router();
const { analyzeResume, generateFeedback, upload } = require('../controllers/voiceInterviewController');
const { checkAuth } = require('../middleware/auth');
const fs = require('fs');
const path = require('path');

// ✅ Detect if running on Vercel
const isVercel = process.env.VERCEL === '1';

// ✅ Use /tmp (writable in Vercel) or local uploads folder
const uploadsDir = isVercel
  ? path.join('/tmp', 'voice-interview')
  : path.join(__dirname, '../uploads/voice-interview');

// ✅ Create uploads directory safely
try {
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
    console.log('✅ Uploads directory created at:', uploadsDir);
  }
} catch (err) {
  console.error('❌ Failed to create uploads directory:', err.message);
}

// ✅ Analyze resume (file upload)
router.post('/analyze-resume', checkAuth, upload.single('resume'), analyzeResume);

// ✅ Generate feedback
router.post('/feedback', checkAuth, generateFeedback);

module.exports = router;
