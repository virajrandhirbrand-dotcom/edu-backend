const mongoose = require('mongoose');

const QuizSchema = new mongoose.Schema({
    title: { type: String, required: true },
    subject: { type: String, required: true },
});

const QuestionSchema = new mongoose.Schema({
    quiz: { type: mongoose.Schema.Types.ObjectId, ref: 'Quiz', required: true },
    text: { type: String, required: true },
    options: [{ type: String, required: true }],
    correctAnswer: { type: String, required: true },
});

const Quiz = mongoose.model('Quiz', QuizSchema);
const Question = mongoose.model('Question', QuestionSchema);

module.exports = { Quiz, Question };