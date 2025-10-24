const Subject = require('../models/Subject');

// Get all subjects for the logged-in user
exports.getSubjects = async (req, res) => {
    try {
        const subjects = await Subject.find({ user: req.user.id }).sort({ semester: 1 });
        if (!subjects) {
            return res.status(404).json({ msg: 'No academic data found for this user.' });
        }
        res.json(subjects);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};