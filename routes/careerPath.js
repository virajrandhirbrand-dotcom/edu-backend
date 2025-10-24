const express = require('express');
const router = express.Router();
const { getRecommendations } = require('../controllers/careerPathController');
const { checkAuth } = require('../middleware/auth');

// Get career path recommendations
router.post('/recommendations', checkAuth, getRecommendations);

module.exports = router;

