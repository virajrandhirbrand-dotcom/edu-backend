const Attendance = require('../models/Attendance');

exports.getAttendance = async (req, res) => {
    try {
        const attendance = await Attendance.find({ user: req.user.id });
        res.json(attendance);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};