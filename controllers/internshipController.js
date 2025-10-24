const Internship = require('../models/Internship');

exports.getInternships = async (req, res) => {
    try {
        const internships = await Internship.find();
        res.json(internships);
    } catch (err) {
        res.status(500).send('Server Error');
    }
};