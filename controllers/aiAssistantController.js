const { GoogleGenerativeAI } = require('@google/generative-ai');

exports.askQuestion = async (req, res) => {
    try {
        const { question, userType = 'student' } = req.body;

        if (!question || question.trim().length === 0) {
            return res.status(400).json({ 
                error: 'Please provide a question.' 
            });
        }

        // Check if Gemini API key is configured
        if (!process.env.GEMINI_API_KEY) {
            console.log('GEMINI_API_KEY not configured, using fallback response');
            const fallbackResponse = getFallbackResponse(question, userType);
            return res.json({ 
                answer: fallbackResponse, 
                isFallback: true,
                error: 'AI service temporarily unavailable, providing general response'
            });
        }

        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

        // Create context-aware prompt based on user type
        const systemPrompt = getUserTypePrompt(userType);
        
        // Use the latest Gemini Pro model with fallback
        let model;
        let lastError;
        
        const candidateModels = [
            "gemini-2.5-flash",
            "gemini-1.5-flash", 
            "gemini-1.0-pro"
        ];
        
        for (const modelId of candidateModels) {
            try {
                console.log(`Trying model: ${modelId}`);
                model = genAI.getGenerativeModel({ model: modelId });
                console.log(`Successfully initialized model: ${modelId}`);
                break;
            } catch (err) {
                console.log(`Model ${modelId} initialization failed:`, err.message);
                lastError = err;
                model = undefined;
            }
        }
        
        if (!model) {
            console.error('All models failed to initialize:', lastError);
            return res.status(500).json({
                error: 'AI service is temporarily unavailable. Please try again later.',
                details: lastError ? lastError.message : 'All models failed to initialize'
            });
        }
        
        // Combine system prompt and user question
        const fullPrompt = `${systemPrompt}\n\nUser Question: ${question}`;
        
        try {
            const result = await model.generateContent(fullPrompt);
            const response = await result.response;
            const answer = response.text();

            res.json({
                answer: answer,
                question: question,
                userType: userType,
                timestamp: new Date().toISOString(),
                isFallback: false
            });
        } catch (generateError) {
            console.error('Content generation failed:', generateError);
            
            // Provide a fallback response instead of failing completely
            const fallbackResponse = getFallbackResponse(question, userType);
            
            res.json({
                answer: fallbackResponse,
                question: question,
                userType: userType,
                timestamp: new Date().toISOString(),
                isFallback: true,
                error: 'AI service temporarily unavailable, providing general response'
            });
        }

    } catch (error) {
        console.error("AI Assistant Error:", error);
        res.status(500).json({ 
            error: 'Sorry, I encountered an error with the AI service. Please try again.'
        });
    }
};

// Get context-aware system prompt based on user type
function getUserTypePrompt(userType) {
    const basePrompt = `You are a helpful AI assistant for an educational platform. 

CRITICAL RESPONSE FORMAT RULES:
- NEVER write in paragraph format
- ALWAYS use bullet points (•) or numbered lists (1. 2. 3.)
- Keep responses under 100 words
- Use short, punchy sentences
- One idea per bullet point
- Be direct and actionable
- NO long explanations or paragraphs
- Format: Bullet points only, no paragraphs`;
    
    const userTypePrompts = {
        'student': `${basePrompt}

You are helping students with academic and career questions. ALWAYS respond with:
• Bullet points only
• Short, actionable tips
• Step-by-step numbered lists when needed
• Resource recommendations
• Study strategies
• Career advice

NEVER use paragraphs. Use bullet points for everything.`,
        
        'ug': `${basePrompt}

You are helping undergraduate students. ALWAYS respond with:
• Bullet points only
• Course planning tips
• Study techniques
• Career preparation
• Skill development
• Internship guidance

NEVER use paragraphs. Use bullet points for everything.`,
        
        'pg': `${basePrompt}

You are helping postgraduate students with research and advanced studies. ALWAYS respond with:
• Bullet points only
• Research methodology tips
• Academic writing guidance
• Career opportunities
• Publishing advice
• Professional development

NEVER use paragraphs. Use bullet points for everything.`,
        
        'default': basePrompt
    };

    return userTypePrompts[userType] || userTypePrompts['default'];
}

// Get fallback response when AI service is unavailable
function getFallbackResponse(question, userType) {
    const fallbackResponses = {
        'student': `I understand you're asking about "${question}". While my AI service is temporarily unavailable, here are quick resources:

• Academic help: Consult professors or advisors
• Career guidance: Check LinkedIn, Indeed, Glassdoor
• Technical skills: Try Coursera, Udemy, freeCodeCamp
• Study tips: Use Pomodoro Technique or spaced repetition

Please try again shortly when my service is restored.`,
        
        'ug': `I understand your question about "${question}". While my AI service is temporarily unavailable, here are quick resources:

• Academic planning: Consult your academic advisor
• Study resources: Use university library and online platforms
• Career development: Visit career services office
• Internships: Check university job board and company websites

Please try again shortly when my service is restored.`,
        
        'pg': `I understand your question about "${question}". While my AI service is temporarily unavailable, here are quick resources:

• Research guidance: Consult your thesis supervisor
• Academic writing: Use Purdue OWL or university writing center
• Career opportunities: Explore academic job boards
• Publishing: Check journal submission guidelines

Please try again shortly when my service is restored.`,
        
        'default': `I understand you're asking about "${question}". While I'm experiencing technical difficulties, here are quick suggestions:

• Consult relevant experts or resources
• Check official documentation or help centers
• Look for community forums or support groups
• Reach out to mentors or colleagues

Please try again shortly when my service is restored.`
    };

    return fallbackResponses[userType] || fallbackResponses['default'];
}

