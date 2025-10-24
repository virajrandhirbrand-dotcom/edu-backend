// backend/routes/publications.js

const express = require('express');
const router = express.Router();
const { getPublications, addPublication } = require('../controllers/publicationController');

// Correctly destructure the functions from the middleware file
const { checkAuth, authorize } = require('../middleware/auth');

// Use the destructured functions as separate arguments
router.route('/')
    .get(checkAuth, authorize('pg'), getPublications)
    .post(checkAuth, authorize('pg'), addPublication);

module.exports = router;