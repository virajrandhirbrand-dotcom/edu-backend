const { GoogleGenerativeAI } = require('@google/generative-ai');

// Configure Gemini AI with fallback models
const candidateModels = [
    'gemini-2.5-flash',
    'gemini-1.5-flash', 
    'gemini-1.0-pro'
];

const getAvailableModel = async () => {
    console.log('Initializing AI model...');
    console.log('API Key available:', !!process.env.GEMINI_API_KEY);
    
    if (!process.env.GEMINI_API_KEY) {
        throw new Error('GEMINI_API_KEY not found in environment variables');
    }
    
    try {
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        console.log('GoogleGenerativeAI instance created');
        
        // Try gemini-2.5-flash first
        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
        console.log('Using AI model: gemini-2.5-flash');
        return { genAI, model };
    } catch (error) {
        console.warn('gemini-2.5-flash failed:', error.message);
        try {
            const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
            const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
            console.log('Using AI model: gemini-1.5-flash');
            return { genAI, model };
        } catch (fallbackError) {
            console.warn('gemini-1.5-flash failed:', fallbackError.message);
            try {
                const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
                const model = genAI.getGenerativeModel({ model: 'gemini-1.0-pro' });
                console.log('Using AI model: gemini-1.0-pro');
                return { genAI, model };
            } catch (finalError) {
                console.error('All AI models failed:', finalError.message);
                throw new Error('All AI models are unavailable');
            }
        }
    }
};

// Fallback quiz generation
const generateFallbackQuiz = (standard, subject, topic, difficulty, numQuestions) => {
    const questions = [];
    
    for (let i = 1; i <= numQuestions; i++) {
        questions.push({
            question: `What is the main concept of ${topic} in ${subject} for Class ${standard}?`,
            options: [
                `Option A for ${topic}`,
                `Option B for ${topic}`,
                `Option C for ${topic}`,
                `Option D for ${topic}`
            ],
            correctAnswer: `Option A for ${topic}`,
            explanation: `This is a sample question about ${topic} in ${subject} for Class ${standard} students.`
        });
    }
    
    return {
        title: `${subject} Quiz - ${topic}`,
        description: `A ${difficulty} level quiz on ${topic} for Class ${standard} students`,
        questions: questions
    };
};

exports.generateQuiz = async (req, res) => {
    try {
        console.log('=== QUIZ GENERATION START ===');
        console.log('Quiz generation request received:', req.body);
        
        const { standard, subject, topic, difficulty, numQuestions } = req.body;

        if (!standard || !subject || !topic) {
            console.log('Missing required fields:', { standard, subject, topic });
            return res.status(400).json({ 
                error: 'Standard, subject, and topic are required' 
            });
        }

        console.log('All required fields present, proceeding...');
        console.log('Getting AI model...');
        let quiz;
        
        try {
            console.log('Attempting to get AI model...');
            const { genAI, model } = await getAvailableModel();
            console.log('AI model obtained successfully');

            // Create a comprehensive prompt for quiz generation
            const prompt = `Generate a ${difficulty} level quiz for Class ${standard} students on ${subject} - ${topic}.

Requirements:
- Create exactly ${numQuestions} multiple choice questions
- Each question should have 4 options (A, B, C, D)
- Include the correct answer for each question
- Make questions age-appropriate for Class ${standard}
- Cover the topic: ${topic}
- Difficulty level: ${difficulty}

Format the response as a JSON object with this structure:
{
  "title": "Quiz Title",
  "description": "Brief description",
  "questions": [
    {
      "question": "Question text?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": "Option A",
      "explanation": "Brief explanation of the correct answer"
    }
  ]
}

Generate the quiz now:`;

            console.log('Generating quiz with AI...');
            const result = await model.generateContent(prompt);
            const response = await result.response;
            const quizData = response.text();
            
            console.log('AI response received, length:', quizData.length);
            console.log('Raw AI response:', quizData.substring(0, 200) + '...');

            // Parse the JSON response
            try {
                // Clean the response to extract JSON
                const jsonMatch = quizData.match(/\{[\s\S]*\}/);
                if (jsonMatch) {
                    console.log('Found JSON in response, parsing...');
                    quiz = JSON.parse(jsonMatch[0]);
                    console.log('Successfully parsed quiz:', quiz.title);
                } else {
                    console.error('No valid JSON found in response');
                    throw new Error('No valid JSON found in response');
                }
            } catch (parseError) {
                console.error('Error parsing AI response:', parseError);
                console.error('Raw response was:', quizData);
                throw new Error('Failed to parse AI response');
            }
        } catch (aiError) {
            console.warn('AI generation failed, using fallback:', aiError.message);
            console.warn('AI Error details:', aiError);
            quiz = generateFallbackQuiz(standard, subject, topic, difficulty, numQuestions);
            console.log('Using fallback quiz generation');
        }

        // Validate the quiz structure
        if (!quiz.title || !quiz.questions || !Array.isArray(quiz.questions)) {
            return res.status(500).json({ 
                error: 'Invalid quiz format generated. Please try again.' 
            });
        }

        // Add metadata
        quiz.standard = standard;
        quiz.subject = subject;
        quiz.topic = topic;
        quiz.difficulty = difficulty;
        quiz.createdAt = new Date();

        console.log('Quiz generated successfully:', quiz.title);
        res.json(quiz);

    } catch (error) {
        console.error('=== QUIZ GENERATION ERROR ===');
        console.error('Quiz generation error:', error);
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
        console.error('Error type:', error.constructor.name);
        
        // Always try to use fallback first
        try {
            console.log('Attempting fallback quiz generation...');
            const fallbackQuiz = generateFallbackQuiz(standard, subject, topic, difficulty, numQuestions);
            console.log('Fallback quiz generated successfully');
            return res.json(fallbackQuiz);
        } catch (fallbackError) {
            console.error('Fallback also failed:', fallbackError);
        }
        
        if (error.message.includes('No AI models available')) {
            return res.status(503).json({ 
                error: 'AI service temporarily unavailable. Please try again later.' 
            });
        }
        
        if (error.message.includes('API key')) {
            return res.status(500).json({ 
                error: 'AI service configuration error. Please contact support.' 
            });
        }
        
        res.status(500).json({ 
            error: 'Failed to generate quiz. Please try again.',
            details: error.message
        });
    }
};
