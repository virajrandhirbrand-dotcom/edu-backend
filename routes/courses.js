// CORRECTED version of backend/routes/courses.js

const express = require('express');
const router = express.Router();
const { getCourses, createCourse, deleteCourse, getCoursesByClass, getAllCourses } = require('../controllers/courseController');

// Correctly destructure the functions from the middleware file
const { checkAuth, authorize } = require('../middleware/auth');

// Get courses filtered by student's class
router.get('/student', checkAuth, getCoursesByClass);

// Get all courses (for teachers and admin)
router.get('/all', checkAuth, authorize(['teacher', 'admin']), getAllCourses);

// Use the destructured functions as separate arguments
router.get('/', checkAuth, getCourses);
router.post('/', checkAuth, authorize('teacher'), createCourse);
router.delete('/:id', checkAuth, authorize('teacher'), deleteCourse);

module.exports = router;