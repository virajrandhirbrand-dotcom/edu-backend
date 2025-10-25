const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });

const app = express();
const PORT = process.env.PORT || 5001;

// 🔍 Debug environment variables (only in development)
if (process.env.NODE_ENV !== 'production') {
  console.log("✅ Environment variables loaded:");
  console.log("MONGO_URI:", process.env.MONGO_URI ? "Set" : "Not set");
  console.log("GEMINI_API_KEY:", process.env.GEMINI_API_KEY ? "Set" : "Not set");
  console.log("PORT:", process.env.PORT);
}

// 🧩 Middleware
app.use(cors({
  origin: [
    process.env.FRONTEND_URL,
    "http://localhost:3000",
    "http://localhost:3001", 
    "http://localhost:5173",
    "https://*.vercel.app",
    "https://*.netlify.app"
  ].filter(Boolean),
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-auth-token', 'x-requested-with'],
  optionsSuccessStatus: 200
}));
// Handle preflight requests
app.options('*', cors());

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 🗂 Serve static files (only in development)
if (process.env.NODE_ENV !== 'production') {
  app.use("/uploads", express.static(path.join(__dirname, "uploads")));
}

// ✅ Connect to MongoDB
let isConnected = false;

async function connectToMongoDB() {
  if (isConnected) return;

  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    isConnected = true;
    console.log("✅ MongoDB connected successfully");
  } catch (err) {
    console.error("❌ MongoDB connection error:", err.message);
  }
}

// Connect immediately
connectToMongoDB();

// Reconnect if lost
app.use((req, res, next) => {
  if (!isConnected) connectToMongoDB();
  next();
});

// 🏥 Health check endpoint
app.get("/", (req, res) => {
  res.json({
    message: "Educational Platform Backend API",
    status: "running",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
    cors: "enabled",
    endpoints: {
      health: "/health",
      auth: "/api/auth",
      authTest: "/api/auth/test",
      authRegister: "POST /api/auth/register",
      authLogin: "POST /api/auth/login",
      authRegisterDirect: "POST /api/auth/register-direct",
      authLoginDirect: "POST /api/auth/login-direct",
      ai: "/api/ai",
      courses: "/api/courses",
      subjects: "/api/subjects",
      quizzes: "/api/quizzes",
      internships: "/api/internships"
    }
  });
});

app.get("/health", (req, res) => {
  res.json({
    status: "healthy",
    database: isConnected ? "connected" : "disconnected",
    timestamp: new Date().toISOString()
  });
});

// Test endpoint for auth routes
app.get("/api/auth/test", (req, res) => {
  res.json({
    message: "Auth routes are working!",
    endpoints: {
      register: "POST /api/auth/register",
      login: "POST /api/auth/login"
    }
  });
});

// Direct auth endpoints (backup)
app.post("/api/auth/register-direct", async (req, res) => {
  try {
    const { register } = require('./controllers/authController');
    await register(req, res);
  } catch (error) {
    console.error('Direct register error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

app.post("/api/auth/login-direct", async (req, res) => {
  try {
    const { login } = require('./controllers/authController');
    await login(req, res);
  } catch (error) {
    console.error('Direct login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// 🧠 Routes
try {
  console.log("Loading routes...");
  app.use("/api/auth", require("./routes/auth"));
  console.log("✅ Auth routes loaded");
  
  app.use("/api/ai", require("./routes/ai"));
  console.log("✅ AI routes loaded");
  
  app.use("/api/ai-quiz", require("./routes/aiQuiz"));
  console.log("✅ AI Quiz routes loaded");
  
  app.use("/api/ai-assistant", require("./routes/aiAssistant"));
  console.log("✅ AI Assistant routes loaded");
  
  app.use("/api/ai/voice-interview", require("./routes/voiceInterview"));
  console.log("✅ Voice Interview routes loaded");
  
  app.use("/api/publications", require("./routes/publications"));
  console.log("✅ Publications routes loaded");
  
  app.use("/api/courses", require("./routes/courses"));
  console.log("✅ Courses routes loaded");
  
  app.use("/api/subjects", require("./routes/subjects"));
  console.log("✅ Subjects routes loaded");
  
  app.use("/api/attendance", require("./routes/attendance"));
  console.log("✅ Attendance routes loaded");
  
  app.use("/api/quizzes", require("./routes/quizzes"));
  console.log("✅ Quizzes routes loaded");
  
  app.use("/api/resources", require("./routes/resources"));
  console.log("✅ Resources routes loaded");
  
  app.use("/api/internships", require("./routes/internships"));
  console.log("✅ Internships routes loaded");
  
  app.use("/api/resume", require("./routes/resume"));
  console.log("✅ Resume routes loaded");
  
  app.use("/api/youtube", require("./routes/youtube"));
  console.log("✅ YouTube routes loaded");
  
  app.use("/api/plagiarism", require("./routes/plagiarism"));
  console.log("✅ Plagiarism routes loaded");
  
  app.use("/api/career-path", require("./routes/careerPath"));
  console.log("✅ Career Path routes loaded");
  
  app.use("/api/admin", require("./routes/admin"));
  console.log("✅ Admin routes loaded");
  
  console.log("✅ All routes loaded successfully");
} catch (error) {
  console.error("❌ Error loading routes:", error);
}

// 🚨 Global error handler
app.use((err, req, res, next) => {
  console.error("Error:", err);
  res.status(err.status || 500).json({
    error: process.env.NODE_ENV === 'production' 
      ? 'Internal Server Error' 
      : err.message,
    status: err.status || 500
  });
});

// 🚨 404 handler
app.use("*", (req, res) => {
  res.status(404).json({
    error: "Route not found",
    path: req.originalUrl,
    method: req.method
  });
});

// ✅ Start server only if not in Vercel environment
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
}

// ✅ Export for Vercel
module.exports = app;
