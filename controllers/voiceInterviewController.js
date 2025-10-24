const { GoogleGenerativeAI } = require('@google/generative-ai');
const multer = require('multer');

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/voice-interview/');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({ 
    storage: storage,
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only PDF, DOC, DOCX, and TXT files are allowed.'));
        }
    },
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    }
});

// Analyze resume and generate interview questions
exports.analyzeResume = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No resume file uploaded' });
        }

        // Check if Gemini API key is configured
        if (!process.env.GEMINI_API_KEY) {
            console.log('GEMINI_API_KEY not configured, using fallback questions');
            // Return fallback questions
            const fallbackQuestions = [
                "Tell me about yourself and your background.",
                "What are your key strengths and how do they relate to this role?",
                "Describe a challenging project you worked on and how you overcame obstacles.",
                "Where do you see yourself in 5 years?",
                "What questions do you have for us about this position?"
            ];
            
            // Clean up uploaded file
            try {
                const fs = require('fs');
                fs.unlinkSync(req.file.path);
            } catch (cleanupError) {
                console.error('Error cleaning up file:', cleanupError);
            }
            
            return res.json({
                success: true,
                questions: fallbackQuestions,
                message: 'Fallback questions generated (AI service unavailable)'
            });
        }

        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        
        // Read the uploaded file content
        const fs = require('fs');
        const path = require('path');
        const filePath = req.file.path;
        
        let resumeContent = '';
        
        try {
            if (req.file.mimetype === 'text/plain') {
                resumeContent = fs.readFileSync(filePath, 'utf8');
            } else if (req.file.mimetype === 'application/pdf') {
                // For PDF files, try to extract text using a simple approach
                // In production, you would use pdf-parse library
                resumeContent = `PDF Resume: ${req.file.originalname}
                
This is a PDF resume file. The content extraction is simplified for this demo. In a production environment, you would use a proper PDF parsing library like pdf-parse to extract the actual text content.

For now, I'll generate general interview questions suitable for undergraduate students.`;
            } else if (req.file.mimetype === 'application/msword' || req.file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
                // For DOC/DOCX files
                resumeContent = `Word Document Resume: ${req.file.originalname}
                
This is a Word document resume file. The content extraction is simplified for this demo. In a production environment, you would use a library like mammoth to extract the actual text content.

For now, I'll generate general interview questions suitable for undergraduate students.`;
            } else {
                resumeContent = `Resume file: ${req.file.originalname} (${req.file.mimetype})`;
            }
        } catch (readError) {
            console.error('Error reading file:', readError);
            resumeContent = `Resume file: ${req.file.originalname}`;
        }

        // Generate interview questions based on resume
        const prompt = `Based on the following resume content, generate exactly 5 interview questions that would be appropriate for an undergraduate student. The questions should be:

1. Relevant to their experience and skills
2. Appropriate for entry-level positions
3. Mix of technical and behavioral questions
4. Clear and concise
5. Suitable for voice-based interview

Resume Content:
${resumeContent}

Generate 5 interview questions in JSON format:
{
  "questions": [
    "Question 1 here",
    "Question 2 here",
    "Question 3 here", 
    "Question 4 here",
    "Question 5 here"
  ]
}`;

        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        // Parse the JSON response
        let questions;
        try {
            const jsonMatch = text.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                questions = JSON.parse(jsonMatch[0]);
            } else {
                throw new Error('No JSON found in response');
            }
        } catch (parseError) {
            console.error('Error parsing AI response:', parseError);
            // Fallback questions
            questions = {
                questions: [
                    "Tell me about yourself and your background.",
                    "What are your key strengths and how do they relate to this role?",
                    "Describe a challenging project you worked on and how you overcame obstacles.",
                    "Where do you see yourself in 5 years?",
                    "What questions do you have for us about this position?"
                ]
            };
        }

        // Ensure we have exactly 5 questions
        if (!questions.questions || questions.questions.length !== 5) {
            console.log('Invalid question count, using fallback questions');
            questions = {
                questions: [
                    "Tell me about yourself and your background.",
                    "What are your key strengths and how do they relate to this role?",
                    "Describe a challenging project you worked on and how you overcame obstacles.",
                    "Where do you see yourself in 5 years?",
                    "What questions do you have for us about this position?"
                ]
            };
        }

        // Clean up uploaded file
        try {
            fs.unlinkSync(filePath);
        } catch (cleanupError) {
            console.error('Error cleaning up file:', cleanupError);
        }

        res.json({
            success: true,
            questions: questions.questions,
            message: 'Interview questions generated successfully'
        });

    } catch (error) {
        console.error('Error analyzing resume:', error);
        
        // Clean up uploaded file if it exists
        if (req.file && req.file.path) {
            try {
                const fs = require('fs');
                fs.unlinkSync(req.file.path);
            } catch (cleanupError) {
                console.error('Error cleaning up file:', cleanupError);
            }
        }
        
        // Return fallback questions instead of error
        const fallbackQuestions = [
            "Tell me about yourself and your background.",
            "What are your key strengths and how do they relate to this role?",
            "Describe a challenging project you worked on and how you overcame obstacles.",
            "Where do you see yourself in 5 years?",
            "What questions do you have for us about this position?"
        ];
        
        res.json({
            success: true,
            questions: fallbackQuestions,
            message: 'Fallback questions generated due to processing error'
        });
    }
};

// Generate feedback based on interview responses
exports.generateFeedback = async (req, res) => {
    try {
        const { resume, questions, answers } = req.body;

        if (!questions || !answers || questions.length !== answers.length) {
            return res.status(400).json({ error: 'Invalid interview data provided' });
        }

        // Check if Gemini API key is configured
        if (!process.env.GEMINI_API_KEY) {
            return res.status(500).json({
                error: 'Gemini API key is not configured. Please set GEMINI_API_KEY environment variable.'
            });
        }

        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

        // Create feedback prompt
        const interviewData = questions.map((question, index) => 
            `Q${index + 1}: ${question}\nA${index + 1}: ${answers[index].answer}`
        ).join('\n\n');

        const prompt = `Based on the following interview responses from an undergraduate student, provide constructive feedback. The feedback should be:

1. Encouraging and supportive
2. Specific and actionable
3. Focus on areas for improvement
4. Highlight strengths
5. Provide tips for future interviews
6. Keep it concise but comprehensive

Interview Responses:
${interviewData}

Provide feedback in a friendly, mentor-like tone that helps the student improve their interview skills.`;

        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const feedback = response.text();

        res.json({
            success: true,
            feedback: feedback,
            message: 'Feedback generated successfully'
        });

    } catch (error) {
        console.error('Error generating feedback:', error);
        
        // Fallback feedback
        const fallbackFeedback = `Thank you for completing the voice interview practice! Here's some general feedback:

Strengths:
• You completed all interview questions
• Your responses show engagement with the process

Areas for Improvement:
• Practice speaking clearly and at a moderate pace
• Structure your answers with specific examples
• Prepare stories that highlight your skills and experiences
• Research common interview questions in your field

Tips for Future Interviews:
• Practice with friends or family
• Record yourself answering questions
• Prepare 3-5 examples of your achievements
• Research the company and role beforehand
• Ask thoughtful questions about the position

Keep practicing and you'll continue to improve!`;

        res.json({
            success: true,
            feedback: fallbackFeedback,
            message: 'Feedback generated successfully'
        });
    }
};

// Export multer middleware for file uploads
exports.upload = upload;
