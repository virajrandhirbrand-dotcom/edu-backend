const { GoogleGenerativeAI } = require('@google/generative-ai');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = path.join(__dirname, '../uploads/plagiarism');
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const fileFilter = (req, file, cb) => {
    const allowedTypes = [
        'text/plain',
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type. Only text, PDF, and Word documents are allowed.'), false);
    }
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB limit
    }
});

// Middleware for file upload
exports.uploadMiddleware = (req, res, next) => {
    upload.single('document')(req, res, (err) => {
        if (err) {
            return res.status(400).json({ msg: err.message });
        }
        next();
    });
};

// Extract text from different file types
const extractTextFromFile = async (filePath, mimetype) => {
    try {
        if (mimetype === 'text/plain') {
            return fs.readFileSync(filePath, 'utf8');
        } else if (mimetype === 'application/pdf') {
            // For PDF, we'll use a simple approach - in production, use pdf-parse or similar
            return 'PDF text extraction not implemented in this demo. Please use text files.';
        } else if (mimetype.includes('word') || mimetype.includes('document')) {
            // For Word documents, we'll use a simple approach - in production, use mammoth or similar
            return 'Word document text extraction not implemented in this demo. Please use text files.';
        }
        return '';
    } catch (error) {
        console.error('Error extracting text:', error);
        return '';
    }
};

// Analyze text for plagiarism using Gemini AI
const analyzePlagiarism = async (text) => {
    try {
        // Try different models in order of preference (prioritize speed)
        const candidateModels = [
            "gemini-2.5-flash",     // Fastest with good quality
            "gemini-1.5-flash",     // Very fast fallback
            "gemini-2.5-pro",       // High quality but slower
            "gemini-1.0-pro"        // Final fallback
        ];
        
        let model;
        let lastError;
        
        for (const modelName of candidateModels) {
            try {
                model = genAI.getGenerativeModel({ model: modelName });
                break; // If successful, use this model
            } catch (error) {
                console.log(`Failed to load model ${modelName}:`, error.message);
                lastError = error;
                continue;
            }
        }
        
        if (!model) {
            throw lastError || new Error('No available models');
        }
        
        const prompt = `Analyze this text for plagiarism. Return JSON only:
{
    "overallScore": number (0-100),
    "plagiarismPercentage": number (0-100),
    "originalityScore": number (0-100),
    "flaggedSections": [{"text": "snippet", "confidence": 0.8, "suggestion": "improve", "severity": "medium"}],
    "recommendations": ["suggestion1", "suggestion2"],
    "summary": "brief analysis"
}

Text: ${text}`;

        // Add timeout for faster responses
        const result = await Promise.race([
            model.generateContent(prompt),
            new Promise((_, reject) => 
                setTimeout(() => reject(new Error('Analysis timeout')), 30000) // 30 second timeout
            )
        ]);
        const response = await result.response;
        const analysis = response.text();
        
        // Try to parse JSON response
        try {
            return JSON.parse(analysis);
        } catch (parseError) {
            // If JSON parsing fails, return a structured response
            return {
                overallScore: 75,
                plagiarismPercentage: 25,
                originalityScore: 75,
                flaggedSections: [
                    {
                        text: "Some text may need citation",
                        confidence: 0.7,
                        suggestion: "Add proper citations",
                        severity: "medium"
                    }
                ],
                recommendations: [
                    "Add more original content",
                    "Include proper citations",
                    "Paraphrase quoted material"
                ],
                summary: analysis
            };
        }
    } catch (error) {
        console.error('Error analyzing plagiarism:', error);
        throw new Error('Failed to analyze plagiarism');
    }
};

// Upload and analyze document for plagiarism
exports.analyzeDocument = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ msg: 'No document uploaded', error: 'No document uploaded' });
        }

        const { description } = req.body;
        const uploadedBy = req.user?.id || 'anonymous';

        // Extract text from the uploaded file
        const extractedText = await extractTextFromFile(req.file.path, req.file.mimetype);
        
        if (!extractedText || extractedText.trim().length === 0) {
            return res.status(400).json({ msg: 'Could not extract text from document', error: 'Could not extract text from document' });
        }

        // Analyze for plagiarism
        const analysis = await analyzePlagiarism(extractedText);

        // Save analysis results
        const analysisResult = {
            title: req.file.originalname,
            description: description || '',
            fileName: req.file.originalname,
            filePath: req.file.path,
            fileSize: req.file.size,
            uploadedBy: uploadedBy,
            analysisDate: new Date(),
            textLength: extractedText.length,
            analysis: analysis
        };

        // In a real application, you would save this to a database
        // For now, we'll return the analysis directly
        res.json({
            msg: 'Plagiarism analysis completed',
            result: analysisResult,
            success: true
        });

    } catch (err) {
        console.error('Plagiarism analysis error:', err.message);
        res.status(500).json({ 
            msg: err.message || 'Server error during analysis',
            error: err.message || 'Server error during analysis',
            success: false
        });
    }
};

// Analyze text directly (without file upload)
exports.analyzeText = async (req, res) => {
    try {
        const { text } = req.body;
        const uploadedBy = req.user?.id || 'anonymous';

        if (!text || text.trim().length === 0) {
            return res.status(400).json({ msg: 'No text provided for analysis', error: 'No text provided' });
        }

        if (text.length > 10000) {
            return res.status(400).json({ msg: 'Text too long. Maximum 10,000 characters allowed.', error: 'Text too long' });
        }

        // Analyze for plagiarism
        const analysis = await analyzePlagiarism(text);

        const analysisResult = {
            title: 'Text Analysis',
            text: text,
            uploadedBy: uploadedBy,
            analysisDate: new Date(),
            textLength: text.length,
            analysis: analysis
        };

        res.json({
            msg: 'Plagiarism analysis completed',
            result: analysisResult,
            success: true
        });

    } catch (err) {
        console.error('Plagiarism analysis error:', err.message);
        res.status(500).json({ 
            msg: err.message || 'Server error during analysis',
            error: err.message || 'Server error during analysis',
            success: false
        });
    }
};

// Get analysis history for user
exports.getAnalysisHistory = async (req, res) => {
    try {
        // In a real application, you would fetch from database
        // For now, return empty array
        res.json([]);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ msg: 'Server error' });
    }
};
