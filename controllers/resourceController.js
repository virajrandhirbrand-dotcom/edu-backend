const Resource = require('../models/Resource');

exports.getResources = async (req, res) => {
    try {
        // In a real app, you might filter by the user's enrolled subjects
        const resources = await Resource.find();
        res.json(resources);
    } catch (err) {
        res.status(500).send('Server Error');
    }
};