const express = require('express');
const router = express.Router();
const { getQuizzes, submitQuiz } = require('../controllers/quizController');
const { checkAuth } = require('../middleware/auth');

router.get('/', checkAuth, getQuizzes);
router.post('/submit', checkAuth, submitQuiz);

module.exports = router;