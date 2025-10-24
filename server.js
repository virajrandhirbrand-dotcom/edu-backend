const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const app = express();
const PORT = process.env.PORT || 5001;

// Debug environment variables
console.log('Environment variables loaded:');
console.log('MONGO_URI:', process.env.MONGO_URI);
console.log('GEMINI_API_KEY:', process.env.GEMINI_API_KEY ? 'Set' : 'Not set');
console.log('PORT:', process.env.PORT);

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Function to seed data after MongoDB connection
async function seedData() {
    try {
        const Course = require('./models/Course');
        const Internship = require('./models/Internship');
        
        console.log('Seeding courses...');
        await Course.seed();
        
        console.log('Seeding internships...');
        await Internship.seed();
        
        console.log('Data seeding completed successfully');
    } catch (error) {
        console.error('Error seeding data:', error);
    }
}

// Connect to MongoDB with better timeout settings
// mongoose.connect(process.env.MONGO_URI, {
//     serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
//     socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
// })
//     .then(() => {
//         console.log('MongoDB connected successfully');
//         // Seed data after connection is established
//         seedData();
//     })
//     .catch(err => {
//         console.error('MongoDB connection error:', err);
//         console.log('Server will continue without database connection');
//     });



let isconnected = false;

async function connectToMongoDB() {
try {
    await mongoose.connect(process.env.MONGO_URI, {
        useNewUrlParser: true, // Keep trying to send operations for 5 seconds
        useUnifiedTopology: true, // Close sockets after 45 seconds of inactivity
    });
    isconnected = true;
    console.log('MongoDB connected successfully');
} catch (err) {
    console.error('MongoDB connection error:', err);
    isconnected = false;
}
}

connectToMongoDB();

//add middleware
app.use((req, res, next) => {
    if (!isconnected) {
        connectToMongoDB();
    }
    next();
    
})


// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/ai', require('./routes/ai'));
app.use('/api/ai-quiz', require('./routes/aiQuiz'));
app.use('/api/ai-assistant', require('./routes/aiAssistant'));
app.use('/api/ai/voice-interview', require('./routes/voiceInterview'));
app.use('/api/publications', require('./routes/publications'));
app.use('/api/courses', require('./routes/courses'));
app.use('/api/subjects', require('./routes/subjects'));
app.use('/api/attendance', require('./routes/attendance'));
app.use('/api/quizzes', require('./routes/quizzes'));
app.use('/api/resources', require('./routes/resources'));
app.use('/api/internships', require('./routes/internships'));
app.use('/api/resume', require('./routes/resume'));
app.use('/api/youtube', require('./routes/youtube'));
// app.use('/api/materials', require('./routes/materials'));
app.use('/api/plagiarism', require('./routes/plagiarism'));
app.use('/api/career-path', require('./routes/careerPath'));
app.use('/api/admin', require('./routes/admin'));

// app.listen(PORT, () => {
//     console.log(`Server is running on port ${PORT}`);
// });
module.exports = app