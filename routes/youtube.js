const express = require('express');
const router = express.Router();
const { 
    searchEducationalVideos, 
    getCourseVideos, 
    getTrendingEducationalVideos 
} = require('../controllers/youtubeController');
const { checkAuth } = require('../middleware/auth');

// Search for educational videos
router.post('/search', checkAuth, searchEducationalVideos);

// Get course-specific video recommendations
router.post('/course-videos', checkAuth, getCourseVideos);

// Get trending educational videos
router.post('/trending', checkAuth, getTrendingEducationalVideos);

module.exports = router;
