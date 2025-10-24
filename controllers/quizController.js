const { Quiz, Question } = require('../models/Quiz');

// Get all available quizzes with their questions
exports.getQuizzes = async (req, res) => {
    try {
        const quizzes = await Quiz.find();
        const quizzesWithQuestions = await Promise.all(
            quizzes.map(async (quiz) => {
                const questions = await Question.find({ quiz: quiz._id }, '-correctAnswer'); // Exclude correct answers
                return { ...quiz.toObject(), questions };
            })
        );
        res.json(quizzesWithQuestions);
    } catch (err) {
        res.status(500).send('Server Error');
    }
};

// Submit a quiz and get the score
exports.submitQuiz = async (req, res) => {
    const { quizId, answers, quizData } = req.body;
    try {
        let questions = [];
        
        // If quizData is provided (AI-generated quiz), use it directly
        if (quizData && quizData.questions) {
            questions = quizData.questions;
        } else if (quizId) {
            // Otherwise, fetch from database
            questions = await Question.find({ quiz: quizId });
        } else {
            return res.status(400).json({ error: 'Quiz ID or quiz data required' });
        }
        
        let score = 0;
        let correctAnswers = 0;
        
        questions.forEach(question => {
            // Handle both database format (question._id) and AI format (question.question)
            const questionId = question._id || question.question;
            const userAnswer = answers[questionId];
            const correctAnswer = question.correctAnswer;
            
            if (userAnswer === correctAnswer) {
                score++;
                correctAnswers++;
            }
        });
        
        const totalQuestions = questions.length;
        const percentage = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;
        
        res.json({ 
            score: percentage,
            correctAnswers,
            totalQuestions,
            percentage
        });
    } catch (err) {
        console.error('Submit quiz error:', err);
        res.status(500).json({ error: 'Server Error', details: err.message });
    }
};