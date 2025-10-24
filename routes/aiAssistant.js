const express = require('express');
const router = express.Router();
const { askQuestion } = require('../controllers/aiAssistantController');
const { checkAuth } = require('../middleware/auth');

// AI Assistant route - temporarily removing auth for testing
router.post('/ask', askQuestion);

module.exports = router;

