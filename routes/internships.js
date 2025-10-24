const express = require('express');
const router = express.Router();
const { getInternships } = require('../controllers/internshipController');
const { checkAuth, authorize } = require('../middleware/auth');

// Only UG and PG users can view internships
router.get('/', checkAuth, authorize('ug', 'pg'), getInternships);

module.exports = router;