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
  origin: process.env.FRONTEND_URL || "*",
  credentials: true
}));
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
    environment: process.env.NODE_ENV || "development"
  });
});

app.get("/health", (req, res) => {
  res.json({
    status: "healthy",
    database: isConnected ? "connected" : "disconnected",
    timestamp: new Date().toISOString()
  });
});

// 🧠 Routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/ai", require("./routes/ai"));
app.use("/api/ai-quiz", require("./routes/aiQuiz"));
app.use("/api/ai-assistant", require("./routes/aiAssistant"));
app.use("/api/ai/voice-interview", require("./routes/voiceInterview"));
app.use("/api/publications", require("./routes/publications"));
app.use("/api/courses", require("./routes/courses"));
app.use("/api/subjects", require("./routes/subjects"));
app.use("/api/attendance", require("./routes/attendance"));
app.use("/api/quizzes", require("./routes/quizzes"));
app.use("/api/resources", require("./routes/resources"));
app.use("/api/internships", require("./routes/internships"));
app.use("/api/resume", require("./routes/resume"));
app.use("/api/youtube", require("./routes/youtube"));
app.use("/api/plagiarism", require("./routes/plagiarism"));
app.use("/api/career-path", require("./routes/careerPath"));
app.use("/api/admin", require("./routes/admin"));

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
