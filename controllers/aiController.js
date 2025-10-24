const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Function to explain a general concept
exports.explainConcept = async (req, res) => {
    const { concept } = req.body;
    if (!concept) return res.status(400).json({ msg: 'Concept is required' });

    try {
        // Try multiple Gemini models, starting with the most reliable ones
        const candidateModels = [
            "gemini-2.5-flash",
            "gemini-2.5-pro",
            "gemini-1.5-flash",
            "gemini-1.0-pro"
        ];
        
        let model;
        let lastError;
        
        for (const modelId of candidateModels) {
            try {
                console.log(`Trying model: ${modelId}`);
                model = genAI.getGenerativeModel({ model: modelId });
                // Quick test without waiting for response
                model.generateContent("test").catch(() => {}); // Fire and forget
                console.log(`Successfully connected to model: ${modelId}`);
                break;
            } catch (err) {
                console.log(`Model ${modelId} failed:`, err.message);
                lastError = err;
                model = undefined;
            }
        }
        
        if (!model) {
            return res.status(500).send('No working Gemini model found. Please check your API key.');
        }
        const result = await model.generateContent(`Explain the concept of "${concept}" in a simple and concise way for a university student.`);
        const response = await result.response;
        const explanation = response.text();
        res.json(explanation);
    } catch (error) {
        res.status(500).send('Failed to fetch explanation from AI');
    }
};

// Function to generate school quiz
exports.generateSchoolQuiz = async (req, res) => {
    const { grade, subject, topic } = req.body;
    if (!grade || !subject || !topic) {
        return res.status(400).json({ error: 'Grade, subject, and topic are required' });
    }

    try {
        // Use the latest Gemini Pro model
        const candidateModels = [
            "gemini-2.5-flash",
            "gemini-2.5-pro",
            "gemini-1.5-flash",
            "gemini-1.0-pro"
        ];
        
        let model;
        let lastError;
        
        for (const modelId of candidateModels) {
            try {
                console.log(`Trying model: ${modelId}`);
                model = genAI.getGenerativeModel({ model: modelId });
                await model.generateContent("test");
                console.log(`Successfully connected to model: ${modelId}`);
                break;
            } catch (err) {
                console.log(`Model ${modelId} failed:`, err.message);
                lastError = err;
                model = undefined;
            }
        }
        
        if (!model) {
            return res.status(500).json({ error: 'No working Gemini model found. Please check your API key.' });
        }

        const prompt = `Create a quiz for ${grade} students studying ${subject} on the topic "${topic}". 
        
        Requirements:
        - Generate 5 multiple choice questions
        - Each question should have 4 options (A, B, C, D)
        - Questions should be age-appropriate for ${grade} level
        - Include one correct answer per question
        - Make questions clear and educational
        - Focus on the specific topic: ${topic}
        
        Return the response in this exact JSON format:
        {
            "title": "Quiz Title",
            "grade": "${grade}",
            "subject": "${subject}",
            "topic": "${topic}",
            "questions": [
                {
                    "id": "q1",
                    "question": "Question text here?",
                    "options": ["Option A", "Option B", "Option C", "Option D"],
                    "correctAnswer": "Option A"
                }
            ]
        }`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        
        // Clean and parse the JSON response
        const cleanedText = text.replace(/```json\n?|\n?```/g, '').trim();
        const quizData = JSON.parse(cleanedText);
        
        res.json(quizData);
    } catch (error) {
        console.error('Error generating school quiz:', error);
        res.status(500).json({ error: 'Failed to generate quiz. Please try again.' });
    }
};

// Function to generate an insight based on grades
exports.getAcademicInsight = async (req, res) => {
    const { subjects } = req.body;
    if (!subjects || subjects.length === 0) {
        return res.status(400).json({ msg: 'Academic data is required.' });
    }

    const prompt = `You are an encouraging academic advisor. Based on the following student data (subjects and grades): ${JSON.stringify(subjects)}. 
    1. Provide one piece of positive feedback about their strong performance in a subject.
    2. Suggest one relevant, more advanced topic or subject they should aim for next.
    Keep your response concise, friendly, and under 50 words. Format it as a single paragraph.`;

    try {
        // Try multiple Gemini models, starting with the most reliable ones
        const candidateModels = [
            "gemini-2.5-flash",
            "gemini-2.5-pro",
            "gemini-1.5-flash",
            "gemini-1.0-pro"
        ];
        
        let model;
        let lastError;
        
        for (const modelId of candidateModels) {
            try {
                console.log(`Trying model: ${modelId}`);
                model = genAI.getGenerativeModel({ model: modelId });
                // Quick test without waiting for response
                model.generateContent("test").catch(() => {}); // Fire and forget
                console.log(`Successfully connected to model: ${modelId}`);
                break;
            } catch (err) {
                console.log(`Model ${modelId} failed:`, err.message);
                lastError = err;
                model = undefined;
            }
        }
        
        if (!model) {
            return res.status(500).send('No working Gemini model found. Please check your API key.');
        }
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const insight = response.text();
        res.json({ insight });
    } catch (error) {
        res.status(500).send('Failed to generate academic insight.');
    }
};

// Function to generate a prediction based on attendance
exports.getAttendancePrediction = async (req, res) => {
    const { attendancePercentage } = req.body;
    if (attendancePercentage === undefined) {
        return res.status(400).json({ msg: 'Attendance percentage is required.' });
    }

    let advice;
    if (attendancePercentage >= 90) {
        advice = "Your excellent attendance is a strong indicator of success. Keep it up!";
    } else if (attendancePercentage >= 75) {
        advice = "Your attendance is good, but be careful not to let it slip as it's closely linked to performance.";
    } else {
        advice = "Warning: Your attendance is below the recommended 75%. This is a strong predictor of a potential drop in grades. Please prioritize attending classes to stay on track.";
    }

    const prompt = `Based on the following analysis: "${advice}", generate a short, encouraging, and predictive insight for a student. Frame it as a forecast. Keep it under 30 words.`;

    try {
        // Try multiple Gemini models, starting with the most reliable ones
        const candidateModels = [
            "gemini-2.5-flash",
            "gemini-2.5-pro",
            "gemini-1.5-flash",
            "gemini-1.0-pro"
        ];
        
        let model;
        let lastError;
        
        for (const modelId of candidateModels) {
            try {
                console.log(`Trying model: ${modelId}`);
                model = genAI.getGenerativeModel({ model: modelId });
                // Quick test without waiting for response
                model.generateContent("test").catch(() => {}); // Fire and forget
                console.log(`Successfully connected to model: ${modelId}`);
                break;
            } catch (err) {
                console.log(`Model ${modelId} failed:`, err.message);
                lastError = err;
                model = undefined;
            }
        }
        
        if (!model) {
            return res.status(500).send('No working Gemini model found. Please check your API key.');
        }
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const prediction = response.text();
        res.json({ prediction });
    } catch (error) {
        res.status(500).send('Failed to generate prediction.');
    }
};

// Function to generate a personalized quiz
exports.generatePersonalizedQuiz = async (req, res) => {
    const { topic } = req.body;
    if (!topic) return res.status(400).json({ msg: 'A topic is required.' });

    const prompt = `You are a quiz generator. Create a 3-question multiple-choice quiz on the topic of "${topic}".
    Provide the response as a valid JSON array of objects.
    Each object must have "text", "options" (an array of 4 strings), and "correctAnswer" keys.
    Do not include any text outside of the JSON array.`;

    try {
        // Try multiple Gemini models, starting with the most reliable ones
        const candidateModels = [
            "gemini-2.5-flash",
            "gemini-2.5-pro",
            "gemini-1.5-flash",
            "gemini-1.0-pro"
        ];
        
        let model;
        let lastError;
        
        for (const modelId of candidateModels) {
            try {
                console.log(`Trying model: ${modelId}`);
                model = genAI.getGenerativeModel({ model: modelId });
                // Quick test without waiting for response
                model.generateContent("test").catch(() => {}); // Fire and forget
                console.log(`Successfully connected to model: ${modelId}`);
                break;
            } catch (err) {
                console.log(`Model ${modelId} failed:`, err.message);
                lastError = err;
                model = undefined;
            }
        }
        
        if (!model) {
            return res.status(500).send('No working Gemini model found. Please check your API key.');
        }
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const jsonResponse = JSON.parse(response.text());
        res.json(jsonResponse);
    } catch (error) {
        res.status(500).send('Failed to generate AI quiz.');
    }
};

// Function to get learning recommendations
exports.getRecommendations = async (req, res) => {
    const { topic } = req.body;
    if (!topic) return res.status(400).json({ msg: 'A topic is required.' });

    const prompt = `You are a learning assistant AI. A student needs resources on: "${topic}".
    Provide a valid JSON object with "search_queries" (an array of 3 precise search strings) and "recommended_resources" (an array of 3 objects, each with "title", "type" ['YouTube' or 'Blog'], and a plausible "url").
    Do not include text outside the JSON object.`;

    try {
        // Try multiple Gemini models, starting with the most reliable ones
        const candidateModels = [
            "gemini-2.5-flash",
            "gemini-2.5-pro",
            "gemini-1.5-flash",
            "gemini-1.0-pro"
        ];
        
        let model;
        let lastError;
        
        for (const modelId of candidateModels) {
            try {
                console.log(`Trying model: ${modelId}`);
                model = genAI.getGenerativeModel({ model: modelId });
                // Quick test without waiting for response
                model.generateContent("test").catch(() => {}); // Fire and forget
                console.log(`Successfully connected to model: ${modelId}`);
                break;
            } catch (err) {
                console.log(`Model ${modelId} failed:`, err.message);
                lastError = err;
                model = undefined;
            }
        }
        
        if (!model) {
            return res.status(500).send('No working Gemini model found. Please check your API key.');
        }
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const jsonResponse = JSON.parse(response.text());
        res.json(jsonResponse);
    } catch (error) {
        res.status(500).send('Failed to generate AI recommendations.');
    }
};

// Function to generate a study plan
exports.generateStudyPlan = async (req, res) => {
    const { courses } = req.body;
    if (!courses || courses.length === 0) {
        return res.status(400).json({ msg: 'Course data is required.' });
    }

    const incompleteCourses = courses.filter(c => c.progress < 100);
    if (incompleteCourses.length === 0) {
        return res.json({ plan: "Great job! All your courses are complete. Time to focus on final exam preparation." });
    }

    const prompt = `You are an AI academic advisor. A student has the following course progress: ${JSON.stringify(incompleteCourses)}.
    1. Identify the 1-2 courses with the lowest progress.
    2. Create a simple, actionable 3-step study plan for the week for these priority areas.
    3. Keep it encouraging and under 100 words. Format as a single string.`;

    try {
        // Try multiple Gemini models, starting with the most reliable ones
        const candidateModels = [
            "gemini-2.5-flash",
            "gemini-2.5-pro",
            "gemini-1.5-flash",
            "gemini-1.0-pro"
        ];
        
        let model;
        let lastError;
        
        for (const modelId of candidateModels) {
            try {
                console.log(`Trying model: ${modelId}`);
                model = genAI.getGenerativeModel({ model: modelId });
                // Quick test without waiting for response
                model.generateContent("test").catch(() => {}); // Fire and forget
                console.log(`Successfully connected to model: ${modelId}`);
                break;
            } catch (err) {
                console.log(`Model ${modelId} failed:`, err.message);
                lastError = err;
                model = undefined;
            }
        }
        
        if (!model) {
            return res.status(500).send('No working Gemini model found. Please check your API key.');
        }
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const plan = response.text();
        res.json({ plan });
    } catch (error) {
        res.status(500).send('Failed to generate study plan.');
    }
};

// Function to enhance a resume
exports.enhanceResume = async (req, res) => {
    const { resumeText } = req.body;
    if (!resumeText) return res.status(400).json({ msg: 'Resume text is required.' });

    const prompt = `You are a professional career coach reviewing a student's resume. The resume content is: "${resumeText}".
    Provide 3-4 specific, actionable suggestions for improvement.
    Focus on using stronger action verbs, quantifying achievements, and improving clarity.
    Format your response as a single string with each suggestion on a new line, starting with a bullet point (•).`;

    try {
        // Try multiple Gemini models, starting with the most reliable ones
        const candidateModels = [
            "gemini-2.5-flash",
            "gemini-2.5-pro",
            "gemini-1.5-flash",
            "gemini-1.0-pro"
        ];
        
        let model;
        let lastError;
        
        for (const modelId of candidateModels) {
            try {
                console.log(`Trying model: ${modelId}`);
                model = genAI.getGenerativeModel({ model: modelId });
                // Quick test without waiting for response
                model.generateContent("test").catch(() => {}); // Fire and forget
                console.log(`Successfully connected to model: ${modelId}`);
                break;
            } catch (err) {
                console.log(`Model ${modelId} failed:`, err.message);
                lastError = err;
                model = undefined;
            }
        }
        
        if (!model) {
            return res.status(500).send('No working Gemini model found. Please check your API key.');
        }
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const feedback = response.text();
        res.json({ feedback });
    } catch (error) {
        res.status(500).send('Failed to enhance resume.');
    }
};

// Function to generate an interview question
exports.getInterviewQuestion = async (req, res) => {
    const prompt = `You are a mock interviewer. Generate one common behavioral interview question for a software development intern role. For example: "Tell me about a challenging project you worked on."`;

    try {
        // Try multiple Gemini models, starting with the most reliable ones
        const candidateModels = [
            "gemini-2.5-flash",
            "gemini-2.5-pro",
            "gemini-1.5-flash",
            "gemini-1.0-pro"
        ];
        
        let model;
        let lastError;
        
        for (const modelId of candidateModels) {
            try {
                console.log(`Trying model: ${modelId}`);
                model = genAI.getGenerativeModel({ model: modelId });
                // Quick test without waiting for response
                model.generateContent("test").catch(() => {}); // Fire and forget
                console.log(`Successfully connected to model: ${modelId}`);
                break;
            } catch (err) {
                console.log(`Model ${modelId} failed:`, err.message);
                lastError = err;
                model = undefined;
            }
        }
        
        if (!model) {
            return res.status(500).send('No working Gemini model found. Please check your API key.');
        }
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const question = response.text();
        res.json({ question });
    } catch (error) {
        res.status(500).send('Failed to generate interview question.');
    }
};