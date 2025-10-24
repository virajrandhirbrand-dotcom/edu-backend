const { GoogleGenerativeAI } = require('@google/generative-ai');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

// ✅ Detect if running on Vercel
const isVercel = process.env.VERCEL === '1';

// ✅ Use /tmp on Vercel, uploads folder locally
const uploadDir = isVercel
  ? path.join('/tmp', 'voice-interview')
  : path.join(__dirname, '../uploads/voice-interview');

// ✅ Ensure upload directory exists
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log(`✅ Uploads directory created at: ${uploadDir}`);
}

// ✅ Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain'
    ];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF, DOC, DOCX, and TXT files are allowed.'));
    }
  },
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB
});

// ✅ Analyze resume and generate interview questions
exports.analyzeResume = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No resume file uploaded' });
    }

    // Gemini setup
    if (!process.env.GEMINI_API_KEY) {
      console.log('GEMINI_API_KEY not configured, using fallback questions');
      const fallbackQuestions = [
        "Tell me about yourself and your background.",
        "What are your key strengths and how do they relate to this role?",
        "Describe a challenging project you worked on and how you overcame obstacles.",
        "Where do you see yourself in 5 years?",
        "What questions do you have for us about this position?"
      ];

      // Cleanup uploaded file
      try { fs.unlinkSync(req.file.path); } catch (err) {}

      return res.json({
        success: true,
        questions: fallbackQuestions,
        message: 'Fallback questions generated (AI service unavailable)'
      });
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

    // Read resume file
    const filePath = req.file.path;
    let resumeContent = '';

    try {
      if (req.file.mimetype === 'text/plain') {
        resumeContent = fs.readFileSync(filePath, 'utf8');
      } else if (req.file.mimetype === 'application/pdf') {
        resumeContent = `PDF Resume: ${req.file.originalname}\n\n(This is a simplified placeholder. Use pdf-parse in production.)`;
      } else if (
        req.file.mimetype === 'application/msword' ||
        req.file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      ) {
        resumeContent = `Word Resume: ${req.file.originalname}\n\n(This is a simplified placeholder. Use mammoth in production.)`;
      } else {
        resumeContent = `Resume file: ${req.file.originalname} (${req.file.mimetype})`;
      }
    } catch (err) {
      console.error('Error reading file:', err);
      resumeContent = `Resume file: ${req.file.originalname}`;
    }

    const prompt = `Based on the following resume content, generate exactly 5 interview questions suitable for an undergraduate student.

Resume Content:
${resumeContent}

Respond ONLY in this JSON format:
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
    const text = result.response.text();

    let questions;
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        questions = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found');
      }
    } catch {
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

    try { fs.unlinkSync(filePath); } catch (err) {}

    res.json({
      success: true,
      questions: questions.questions,
      message: 'Interview questions generated successfully'
    });

  } catch (error) {
    console.error('Error analyzing resume:', error);

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

// ✅ Generate feedback based on interview responses
exports.generateFeedback = async (req, res) => {
  try {
    const { questions, answers } = req.body;
    if (!questions || !answers || questions.length !== answers.length) {
      return res.status(400).json({ error: 'Invalid interview data provided' });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({
        error: 'Gemini API key is not configured. Please set GEMINI_API_KEY environment variable.'
      });
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const interviewData = questions.map((q, i) => `Q${i + 1}: ${q}\nA${i + 1}: ${answers[i].answer}`).join('\n\n');

    const prompt = `Provide friendly, constructive interview feedback based on the responses below.
Be encouraging, specific, and concise.

${interviewData}`;

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const result = await model.generateContent(prompt);
    const feedback = result.response.text();

    res.json({
      success: true,
      feedback,
      message: 'Feedback generated successfully'
    });

  } catch (error) {
    console.error('Error generating feedback:', error);
    res.json({
      success: true,
      feedback: `Thank you for completing the interview! 
Here are some general tips:
- Speak clearly and confidently.
- Support your answers with examples.
- Prepare stories that highlight your achievements.
- Practice and refine your responses.`,
      message: 'Fallback feedback generated'
    });
  }
};

// ✅ Export multer middleware
exports.upload = upload;
