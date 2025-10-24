const express = require('express');
const router = express.Router();
const { getAttendance } = require('../controllers/attendanceController');
const { checkAuth } = require('../middleware/auth');

router.get('/', checkAuth, getAttendance);

module.exports = router;