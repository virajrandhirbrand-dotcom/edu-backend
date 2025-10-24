const Publication = require('../models/Publication');

exports.getPublications = async (req, res) => {
    try {
        const publications = await Publication.find({ user: req.user.id });
        res.json(publications);
    } catch (err) {
        res.status(500).send('Server Error');
    }
};

exports.addPublication = async (req, res) => {
    const { title, journal, year } = req.body;
    try {
        const newPublication = new Publication({
            title,
            journal,
            year,
            user: req.user.id,
        });
        const publication = await newPublication.save();
        res.json(publication);
    } catch (err) {
        res.status(500).send('Server Error');
    }
};