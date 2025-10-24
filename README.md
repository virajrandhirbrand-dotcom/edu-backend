# Educational Platform Backend API

A comprehensive backend API for an educational platform built with Node.js, Express, and MongoDB. This backend provides authentication, AI-powered features, course management, and more.

## 🚀 Features

- **Authentication & Authorization**: JWT-based auth with role-based access control
- **AI Integration**: Gemini AI for quizzes, voice interviews, and AI assistant
- **Course Management**: Full CRUD operations for courses, subjects, and materials
- **Assessment Tools**: Quizzes, plagiarism detection, and attendance tracking
- **Career Development**: Internships, resume management, and career path guidance
- **Content Management**: Publications, resources, and YouTube integration

## 🛠 Tech Stack

- **Runtime**: Node.js (>=18.0.0)
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT (jsonwebtoken)
- **AI**: Google Gemini AI
- **File Upload**: Multer
- **Security**: bcryptjs for password hashing

## 📋 Prerequisites

- Node.js (>=18.0.0)
- MongoDB Atlas account or local MongoDB instance
- Google Gemini AI API key
- Vercel account (for deployment)

## 🔧 Local Development Setup

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Variables**
   - Copy `.env.example` to `.env`
   - Fill in your environment variables:
   ```env
   MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/database_name
   JWT_SECRET=your_jwt_secret_key_here
   GEMINI_API_KEY=your_gemini_api_key_here
   PORT=5001
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

The server will start on `http://localhost:5001`

## 🌐 Vercel Deployment

### Method 1: Vercel CLI (Recommended)

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy**
   ```bash
   vercel
   ```

4. **Set Environment Variables**
   ```bash
   vercel env add MONGO_URI
   vercel env add JWT_SECRET
   vercel env add GEMINI_API_KEY
   vercel env add NODE_ENV production
   ```

5. **Redeploy with environment variables**
   ```bash
   vercel --prod
   ```

### Method 2: GitHub Integration

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Ready for Vercel deployment"
   git push origin main
   ```

2. **Connect to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Set environment variables in Vercel dashboard
   - Deploy

## 🔑 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `MONGO_URI` | MongoDB connection string | ✅ |
| `JWT_SECRET` | Secret key for JWT tokens | ✅ |
| `GEMINI_API_KEY` | Google Gemini AI API key | ✅ |
| `PORT` | Server port (default: 5001) | ❌ |
| `NODE_ENV` | Environment (development/production) | ❌ |
| `FRONTEND_URL` | Frontend URL for CORS | ❌ |

## 📚 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login

### AI Features
- `POST /api/ai/generate-quiz` - Generate AI quiz
- `POST /api/ai-assistant/chat` - AI assistant chat
- `POST /api/ai/voice-interview` - Voice interview processing

### Course Management
- `GET /api/courses` - Get all courses
- `POST /api/courses` - Create course
- `GET /api/subjects` - Get subjects
- `POST /api/subjects` - Create subject

### Assessment
- `GET /api/quizzes` - Get quizzes
- `POST /api/quizzes` - Create quiz
- `POST /api/plagiarism/check` - Check plagiarism

### Career Development
- `GET /api/internships` - Get internships
- `POST /api/internships` - Create internship
- `GET /api/career-path` - Get career paths

## 🏥 Health Check

- `GET /` - API status
- `GET /health` - Detailed health check

## 📁 Project Structure

```
backend/
├── api/
│   └── index.js          # Vercel serverless entry point
├── controllers/          # Route controllers
├── middleware/           # Custom middleware
├── models/              # MongoDB models
├── routes/              # API routes
├── uploads/             # File uploads (local only)
├── scripts/             # Utility scripts
├── server.js            # Main server file
├── vercel.json          # Vercel configuration
├── .vercelignore        # Files to ignore in deployment
├── .env.example         # Environment variables template
└── package.json         # Dependencies and scripts
```

## 🚨 Important Notes for Vercel Deployment

1. **File Uploads**: The `uploads/` directory is excluded from Vercel deployment. For production, use cloud storage (AWS S3, Cloudinary, etc.)

2. **Database Connection**: Ensure your MongoDB Atlas cluster allows connections from Vercel's IP ranges

3. **Environment Variables**: All sensitive data must be set in Vercel dashboard

4. **Cold Starts**: Vercel functions may have cold starts. The app handles reconnection automatically

5. **Timeout**: Default timeout is 30 seconds. Adjust in `vercel.json` if needed

## 🔍 Troubleshooting

### Common Issues

1. **MongoDB Connection Failed**
   - Check your `MONGO_URI` format
   - Ensure MongoDB Atlas allows Vercel IPs
   - Verify network access settings

2. **Environment Variables Not Loading**
   - Check variable names match exactly
   - Ensure variables are set in Vercel dashboard
   - Redeploy after adding variables

3. **CORS Issues**
   - Set `FRONTEND_URL` environment variable
   - Check CORS configuration in `server.js`

4. **File Upload Issues**
   - File uploads won't work in Vercel (serverless)
   - Use cloud storage for production

## 📞 Support

For issues and questions:
- Check the health endpoint: `GET /health`
- Review Vercel function logs
- Check MongoDB Atlas logs

## 📄 License

ISC License
