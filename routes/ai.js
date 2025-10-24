const express = require('express');
const router = express.Router();
const { 
    explainConcept, 
    getAcademicInsight, 
    getAttendancePrediction,
    generatePersonalizedQuiz,
    getRecommendations,
    generateStudyPlan,
    enhanceResume,
    getInterviewQuestion,
    generateSchoolQuiz
} = require('../controllers/aiController');
const { checkAuth } = require('../middleware/auth');

// Student Dashboard AI Routes
router.post('/explain', checkAuth, explainConcept);
router.post('/insight', checkAuth, getAcademicInsight);
router.post('/predict-performance', checkAuth, getAttendancePrediction);
router.post('/generate-quiz', checkAuth, generatePersonalizedQuiz);
router.post('/recommend', checkAuth, getRecommendations);

// UG Dashboard AI Routes
router.post('/study-plan', checkAuth, generateStudyPlan);
router.post('/enhance-resume', checkAuth, enhanceResume);
router.post('/interview-question', checkAuth, getInterviewQuestion);

// School Quiz Routes
router.post('/generate-school-quiz', checkAuth, generateSchoolQuiz);

module.exports = router;