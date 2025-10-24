const mongoose = require('mongoose');

const InternshipSchema = new mongoose.Schema({
    title: { type: String, required: true },
    company: { type: String, required: true },
    location: { type: String, required: true },
    description: { type: String, required: true },
    apply_url: { type: String, required: true },
});

InternshipSchema.statics.seed = async function() {
    const count = await this.countDocuments();
    if (count === 0) {
        console.log('Seeding internships...');
        await this.create([
            { title: 'MERN Stack Developer Intern', company: 'Innovate Solutions', location: 'Remote', description: 'Work on our flagship educational platform using MongoDB, Express, React, and Node.js.', apply_url: '#' },
            { title: 'Frontend Developer Intern (React)', company: 'Tech Prodigy', location: 'Pune, Maharashtra', description: 'Help build beautiful and responsive user interfaces with React and Tailwind CSS.', apply_url: '#' },
            { title: 'AI/ML Intern', company: 'Data Insights Co.', location: 'Remote', description: 'Assist our data science team in developing predictive models and AI-powered features.', apply_url: '#' }
        ]);
    }
};

module.exports = mongoose.model('Internship', InternshipSchema);