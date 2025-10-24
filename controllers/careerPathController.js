const { GoogleGenerativeAI } = require("@google/generative-ai");

// Initialize Gemini AI
const getGeminiInstance = () => {
    if (!process.env.GEMINI_API_KEY) {
        throw new Error('GEMINI_API_KEY is not set');
    }
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    return genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
};

exports.getRecommendations = async (req, res) => {
    try {
        const { field, cgpa, preferredCountry } = req.body;

        // Validate input
        if (!field || cgpa === undefined || !preferredCountry) {
            return res.status(400).json({
                success: false,
                error: 'Please provide field, CGPA, and preferred country'
            });
        }

        // Validate CGPA range
        if (cgpa < 0 || cgpa > 10) {
            return res.status(400).json({
                success: false,
                error: 'CGPA must be between 0 and 10'
            });
        }

        // Build comprehensive AI prompt
        const comprehensivePrompt = `You are an expert career counselor and education advisor. Analyze the following student profile and provide COMPLETE, DETAILED, and PERSONALIZED career recommendations.

STUDENT PROFILE:
- Field of Study: ${field}
- Current CGPA: ${cgpa}/10
- Preferred Country/Region: ${preferredCountry}

Based on this profile, please provide a comprehensive career guidance in the following JSON format. Be specific, realistic, and personalized:

{
  "personalAnalysis": "Your personalized analysis based on CGPA and field (2-3 sentences explaining their profile strengths and opportunities)",
  
  "programs": [
    {
      "name": "Program name (e.g., M.Tech, MBA, MS)",
      "duration": "Duration in years/months",
      "description": "Brief description of what this program covers"
    }
  ],
  
  "topUniversities": [
    {
      "name": "University name",
      "country": "${preferredCountry}",
      "ranking": "World ranking or tier",
      "admissionRate": "Approximate admission rate %",
      "tuitionFee": "Annual tuition fee in local currency",
      "requiredCGPA": "Minimum CGPA required",
      "specialization": "What makes this university special for this field"
    }
  ],
  
  "requiredExams": [
    {
      "examName": "Name of exam (e.g., GATE, GRE, CAT, GMAT)",
      "importance": "HIGH/MEDIUM/LOW for this field",
      "preparationTime": "Recommended weeks to prepare",
      "averageScore": "Average score needed for top universities",
      "cost": "Exam fee in USD",
      "description": "What this exam tests"
    }
  ],
  
  "scholarships": [
    {
      "name": "Scholarship name",
      "provider": "University or organization",
      "coverage": "Full tuition, partial, stipend, etc.",
      "eligibility": "Requirements based on CGPA and field",
      "deadline": "Approximate deadline",
      "website": "How to apply (general guidance)"
    }
  ],
  
  "careerProspects": [
    {
      "position": "Job position",
      "averageSalary": "Salary range in local currency",
      "companies": "Top companies hiring for this",
      "growth": "Career growth potential HIGH/MEDIUM/LOW",
      "description": "What you'll do in this role"
    }
  ],
  
  "estimatedCosts": {
    "tuitionPerYear": "Annual tuition in local currency",
    "livingExpenses": "Monthly living expenses",
    "totalCost": "Estimated total 2-3 year cost",
    "fundingOptions": "Available funding sources"
  },
  
  "roadmap": [
    {
      "step": 1,
      "title": "Step title",
      "duration": "Time frame",
      "description": "What to do in this step",
      "resources": "Tools/resources needed"
    }
  ],
  
  "eligibilityAssessment": {
    "overallEligibility": "HIGHLY ELIGIBLE / ELIGIBLE / BORDERLINE / CHALLENGING",
    "strengths": "Based on the CGPA and field, what are the strengths",
    "challenges": "What challenges might you face",
    "recommendations": "Specific steps to improve chances",
    "alternativeOptions": "Alternative programs if primary goal is challenging"
  },
  
  "costComparison": {
    "description": "How does cost compare to other countries for same field",
    "valueForMoney": "Quality of education vs cost",
    "roi": "Return on investment potential"
  },
  
  "timelineAndMilestones": {
    "monthsToApplication": "When to start applying",
    "applicationDeadline": "When to submit",
    "decisionTimeline": "When to expect decision",
    "enrollmentDate": "When program starts",
    "completionDate": "When you'll graduate"
  }
}

IMPORTANT GUIDELINES:
1. Make ALL information SPECIFIC and PERSONALIZED based on the CGPA (${cgpa}) and field (${field})
2. Consider the chosen country (${preferredCountry}) and adjust all recommendations accordingly
3. If CGPA is high (>8.5), recommend top-tier universities; if medium (6-8.5), recommend good universities; if lower (<6), suggest universities with moderate requirements
4. Generate AT LEAST 3-5 programs, 5-8 universities, 4-6 exams, 3-5 scholarships, 5-7 career options
5. Include REAL information about costs, admission rates, salaries in the chosen country
6. Provide a detailed 7-10 step roadmap
7. Return ONLY valid JSON, no markdown, no extra text
8. Make recommendations challenging but achievable based on CGPA`;

        console.log('Sending comprehensive prompt to Gemini AI...');
        const model = getGeminiInstance();
        const result = await model.generateContent(comprehensivePrompt);
        const aiResponse = result.response.text();

        console.log('AI Response received, parsing...');

        // Parse AI response
        let recommendations = {};
        try {
            recommendations = JSON.parse(aiResponse);
        } catch (parseError) {
            console.error('JSON Parse Error:', parseError.message);
            console.log('Raw AI Response:', aiResponse.substring(0, 500));
            
            // Try to extract JSON from the response
            const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                try {
                    recommendations = JSON.parse(jsonMatch[0]);
                } catch (retryError) {
                    console.error('Retry parse failed:', retryError.message);
                    throw new Error('Failed to parse AI recommendations. Please try again.');
                }
            } else {
                throw new Error('No valid JSON found in AI response');
            }
        }

        // Validate response has required fields
        if (!recommendations.programs || !Array.isArray(recommendations.programs)) {
            throw new Error('Invalid response format from AI');
        }

        // Add metadata
        const finalResponse = {
            field,
            cgpa,
            preferredCountry,
            generatedAt: new Date().toISOString(),
            aiGenerated: true,
            ...recommendations
        };

        console.log('Successfully generated AI recommendations');

        res.status(200).json({
            success: true,
            data: finalResponse
        });

    } catch (error) {
        console.error('Error generating recommendations:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to generate AI-powered recommendations. Please try again.'
        });
    }
};
