const express = require('express');
const router = express.Router();
const { getResources } = require('../controllers/resourceController');
const { checkAuth } = require('../middleware/auth');

router.get('/', checkAuth, getResources);

module.exports = router;