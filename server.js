const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });

const app = express();
const PORT = process.env.PORT || 5001;

// 🔍 Debug environment variables
console.log("✅ Environment variables loaded:");
console.log("MONGO_URI:", process.env.MONGO_URI ? "Set" : "Not set");
console.log("GEMINI_API_KEY:", process.env.GEMINI_API_KEY ? "Set" : "Not set");
console.log("PORT:", process.env.PORT);

// 🧩 Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 🗂 Serve static files
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ✅ Connect to MongoDB
let isConnected = false;

async function connectToMongoDB() {
  if (isConnected) return;

  try {
    await mongoose.connect(process.env.MONGO_URI);
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

// ✅ Export for Vercel (no app.listen)
module.exports = app;
