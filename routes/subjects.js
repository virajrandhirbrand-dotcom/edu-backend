const express = require('express');
const router = express.Router();
const { getSubjects } = require('../controllers/subjectController');
const { checkAuth } = require('../middleware/auth'); // Correctly destructure middleware

// Defines the GET route to fetch subjects for a logged-in user
router.get('/', checkAuth, getSubjects);

module.exports = router;