const express = require('express');
const router = express.Router();
const { checkAuth } = require('../middleware/auth');
const plagiarismController = require('../controllers/plagiarismController');

// Upload document and analyze for plagiarism
router.post('/analyze-document', checkAuth, plagiarismController.uploadMiddleware, plagiarismController.analyzeDocument);

// Analyze text directly
router.post('/analyze-text', checkAuth, plagiarismController.analyzeText);

// Get analysis history
router.get('/history', checkAuth, plagiarismController.getAnalysisHistory);

module.exports = router;
