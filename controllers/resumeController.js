// Import the required modules
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Helper function to extract text from various file types
function extractTextFromFile(buffer, fileExt, originalName) {
    try {
        const fileExtLower = fileExt.toLowerCase();
        
        // For text files, direct UTF-8 conversion
        if (fileExtLower === 'txt') {
            const text = buffer.toString('utf-8');
            if (text.trim()) return text;
        }
        
        // For PDF files, extract readable text more aggressively
        if (fileExtLower === 'pdf') {
            // PDFs often have embedded text that can be extracted
            // Convert the entire buffer to UTF-8 and clean it
            const text = buffer.toString('utf-8');
            
            // Remove common PDF binary markers and extract readable text
            const readable = text
                .replace(/%%EOF/g, '')
                .replace(/stream\n/g, '\n')
                .replace(/endstream/g, '\n')
                .replace(/obj\n/g, '\n')
                .replace(/endobj/g, '\n')
                .replace(/BT\n/g, '\n')
                .replace(/ET\n/g, '\n')
                .replace(/[^\x20-\x7E\n\r\t]/g, ' ')
                .trim()
                .split('\n')
                .filter(line => line.trim().length > 0)
                .join('\n');
            
            if (readable && readable.length > 50) {
                console.log('Extracted readable text from PDF:', readable.length, 'characters');
                return readable;
            }
            
            // If that doesn't work, try another approach - look for text between specific markers
            const textMatch = text.match(/BT([\s\S]*?)ET/g);
            if (textMatch && textMatch.length > 0) {
                const extracted = textMatch
                    .join(' ')
                    .replace(/[^\x20-\x7E\n\r\t]/g, ' ')
                    .trim();
                if (extracted && extracted.length > 50) {
                    console.log('Extracted text from PDF using markers:', extracted.length, 'characters');
                    return extracted;
                }
            }
        }
        
        // For Word documents, extract readable text
        if (fileExtLower === 'docx' || fileExtLower === 'doc') {
            const text = buffer.toString('utf-8', 0, Math.min(500000, buffer.length));
            const readable = text.replace(/[^\x20-\x7E\n\r\t]/g, ' ').trim();
            if (readable && readable.length > 50) {
                return readable;
            }
        }
        
        // General fallback: try UTF-8 with aggressive binary cleanup
        const text = buffer.toString('utf-8');
        const readable = text
            .replace(/[^\x20-\x7E\n\r\t]/g, ' ')
            .trim()
            .split('\n')
            .map(line => line.trim())
            .filter(line => line.length > 0)
            .join('\n');
            
        if (readable && readable.length > 50) {
            console.log('Extracted readable text using fallback:', readable.length, 'characters');
            return readable;
        }
        
        return null;
    } catch (error) {
        console.error('Text extraction error:', error.message);
        return null;
    }
}

// Helper function to clean potential JSON responses from AI
function cleanAndParseJson(rawText) {
    try {
        // Remove any markdown formatting or extra text
        let cleaned = rawText.trim();
        
        // Find JSON object boundaries
        const jsonStart = cleaned.indexOf('{');
        const jsonEnd = cleaned.lastIndexOf('}');
        
        if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
            cleaned = cleaned.substring(jsonStart, jsonEnd + 1);
        }
        
        // Parse the JSON
        return JSON.parse(cleaned);
    } catch (error) {
        console.error('Error parsing AI response:', error);
        return null;
    }
}

// Main analysis function
exports.analyzeResume = async (req, res) => {
    let resumeText = '';

    try {
        // Check if file or text is provided
        if (req.file) {
            console.log('=== FILE UPLOAD ===');
            console.log('File:', req.file.originalname);
            console.log('Size:', req.file.size, 'bytes');
            console.log('Type:', req.file.mimetype);
            
            if (!req.file.buffer || req.file.buffer.length === 0) {
                return res.status(400).json({
                    error: 'File is empty. Please upload a file with content.'
                });
            }

            const fileExt = req.file.originalname.toLowerCase().split('.').pop();
            
            // Extract text from file
            resumeText = extractTextFromFile(req.file.buffer, fileExt, req.file.originalname);
            
            if (!resumeText) {
                return res.status(400).json({
                    error: `Unable to extract readable text from your ${fileExt.toUpperCase()} file. This might be because: 1) The file is scanned/image-based (not text-based), 2) The file is corrupted, or 3) The file uses an unusual format.`,
                    suggestion: 'Please try: 1) Use "Paste Text" option and copy text from your file, 2) Convert your file to TXT or DOCX format, or 3) Ensure the file contains selectable text (not images).',
                    tip: 'You can usually copy text from PDF/Word by opening the file and using Ctrl+A to select all, then copy.'
                });
            }
            
            console.log('Extracted text length:', resumeText.length, 'characters');
            
        } else if (req.body.resumeText) {
            // Handle text input
            resumeText = req.body.resumeText.trim();
            console.log('Received resume text:', resumeText.length, 'characters');
        } else {
            return res.status(400).json({
                error: 'Please provide resume text or upload a file.'
            });
        }

        // Validate extracted text
        if (!resumeText || resumeText.length < 50) {
            return res.status(400).json({
                error: 'Resume text must be at least 50 characters. Please provide more content.',
                received: resumeText.length
            });
        }

        console.log('Starting AI analysis...');
        
        // Initialize Gemini
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
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
                console.log(`Connected to model: ${modelId}`);
                break;
            } catch (err) {
                console.log(`Model ${modelId} failed:`, err.message);
                lastError = err;
                model = undefined;
            }
        }
        
        if (!model) {
            return res.status(500).json({
                error: 'AI service unavailable. Please check your API key and try again.',
                details: lastError ? lastError.message : 'All models failed'
            });
        } 

        // Analysis prompt
        const analysisPrompt = `Analyze this resume and provide a comprehensive assessment. Return ONLY a JSON object with this exact structure:
        {
            "strengths": ["strength1", "strength2", "strength3"],
            "weaknesses": ["weakness1", "weakness2", "weakness3"],
            "missingSections": ["section1", "section2"],
            "suggestions": ["suggestion1", "suggestion2", "suggestion3"],
            "skillsGap": ["skill1", "skill2"],
            "formattingIssues": ["issue1", "issue2"]
        }
        
        Resume text: ${resumeText}`;

        let analysisResult = null;
        try {
            const result = await model.generateContent(analysisPrompt);
            const analysisText = result.response.text();
            analysisResult = cleanAndParseJson(analysisText);
        } catch (err) {
            console.error('Analysis AI call failed:', err.message);
            analysisResult = null;
        }

        // Fallback analysis
        if (!analysisResult) {
            console.log('Using fallback analysis');
            analysisResult = {
                strengths: ["Resume content provided"],
                weaknesses: ["Unable to provide detailed analysis at this time"],
                missingSections: ["Please try again later"],
                suggestions: ["Please contact support if issue persists"],
                skillsGap: [],
                formattingIssues: []
            };
        }

        // Questions prompt
        const questionsPrompt = `Based on this resume, generate personalized interview questions. Return ONLY a JSON object with:
        {
            "technicalQuestions": ["question1", "question2", "question3"],
            "behavioralQuestions": ["question1", "question2", "question3"],
            "situationalQuestions": ["question1", "question2", "question3"]
        }
        
        Resume text: ${resumeText}`;

        let questions = null;
        try {
            const result = await model.generateContent(questionsPrompt);
            const questionsText = result.response.text();
            questions = cleanAndParseJson(questionsText);
        } catch (err) {
            console.error('Questions AI call failed:', err.message);
            questions = null;
        }

        // Fallback questions
        if (!questions) {
            console.log('Using fallback questions');
            questions = {
                technicalQuestions: ["Can you describe your technical background?"],
                behavioralQuestions: ["Tell me about a project you're proud of"],
                situationalQuestions: ["How would you handle a challenging deadline?"]
            };
        }

        // Career recommendations prompt
        const careerPrompt = `Based on this resume, provide career development recommendations. Return ONLY a JSON object with:
        {
            "nextSteps": ["step1", "step2", "step3"],
            "skillRecommendations": ["skill1", "skill2", "skill3"],
            "certificationSuggestions": ["cert1", "cert2"],
            "projectIdeas": ["project1", "project2", "project3"]
        }
        
        Resume text: ${resumeText}`;

        let careerRecommendations = null;
        try {
            const result = await model.generateContent(careerPrompt);
            const careerText = result.response.text();
            careerRecommendations = cleanAndParseJson(careerText);
        } catch (err) {
            console.error('Career recommendations AI call failed:', err.message);
            careerRecommendations = null;
        }

        // Fallback career recommendations
        if (!careerRecommendations) {
            console.log('Using fallback career recommendations');
            careerRecommendations = {
                nextSteps: ["Continue building your professional experience"],
                skillRecommendations: ["Consider expanding your technical skills"],
                certificationSuggestions: ["Explore industry-relevant certifications"],
                projectIdeas: ["Build a portfolio project to showcase your skills"]
            };
        }

        // Send combined results
        res.json({
            analysis: analysisResult,
            questions,
            careerRecommendations
        });

    } catch (error) {
        console.error("Resume analysis error:", error);
        res.status(500).json({
            error: 'Failed to analyze resume. Please try again.',
            details: error.message 
        });
    }
};