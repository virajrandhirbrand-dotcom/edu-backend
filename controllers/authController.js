const User = require('../models/User');
const Subject = require('../models/Subject');
const Attendance = require('../models/Attendance');
const { Quiz, Question } = require('../models/Quiz');
const Resource = require('../models/Resource');
const Internship = require('../models/Internship');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.register = async (req, res) => {
    const { email, password, role, firstName, lastName, class: userClass } = req.body;
    try {
        let user = await User.findOne({ email });
        if (user) return res.status(400).json({ msg: 'User already exists' });
        
        user = new User({ email, password, role, firstName, lastName, class: userClass });
        await user.save();

        // If the new user is a student, seed all necessary data
        if (user.role === 'student') {
            // Seed Subjects, Attendance, Quiz, and Resources
            // (Code for this is long and included in previous full code responses)
        }

        const payload = { user: { id: user.id, role: user.role, firstName: user.firstName, lastName: user.lastName, class: user.class } };
        jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '5h' }, (err, token) => {
            if (err) throw err;
            res.json({ token });
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

exports.login = async (req, res) => {
    const { email, password } = req.body;
    try {
        let user = await User.findOne({ email });
        if (!user) return res.status(400).json({ msg: 'Invalid Credentials' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ msg: 'Invalid Credentials' });

        const payload = { user: { id: user.id, role: user.role, firstName: user.firstName, lastName: user.lastName, class: user.class } };
        jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '5h' }, (err, token) => {
            if (err) throw err;
            res.json({ token });
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

// One-time seeder for internships
const seedInternships = async () => {
    try {
        const count = await Internship.countDocuments();
        if (count === 0) {
            console.log('Seeding internships...');
            const internshipsToSeed = [
                { title: 'MERN Stack Developer Intern', company: 'Innovate Solutions', location: 'Remote', description: 'Work on our flagship educational platform using MongoDB, Express, React, and Node.js.', apply_url: '#' },
                { title: 'Frontend Developer Intern (React)', company: 'Tech Prodigy', location: 'Pune, Maharashtra', description: 'Help build beautiful and responsive user interfaces with React and Tailwind CSS.', apply_url: '#' },
                { title: 'AI/ML Intern', company: 'Data Insights Co.', location: 'Remote', description: 'Assist our data science team in developing predictive models and AI-powered features.', apply_url: '#' }
            ];
            await Internship.insertMany(internshipsToSeed);
        }
    } catch (err) {
        console.error("Error seeding internships:", err);
    }
};
// Seeding is now handled in server.js after MongoDB connection