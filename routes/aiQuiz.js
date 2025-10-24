const express = require('express');
const router = express.Router();
const { checkAuth } = require('../middleware/auth');
const { generateQuiz } = require('../controllers/aiQuizController');

// Generate AI quiz
router.post('/generate-quiz', checkAuth, generateQuiz);

module.exports = router;
