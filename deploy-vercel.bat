@echo off
echo 🚀 Deploying to Vercel...
echo.

echo ✅ Checking deployment readiness...
npm run deploy

echo.
echo 🚀 Starting Vercel deployment...
echo.

echo 📋 Make sure you have set these environment variables in Vercel:
echo    - MONGO_URI
echo    - JWT_SECRET  
echo    - GEMINI_API_KEY
echo    - NODE_ENV=production
echo.

pause
vercel --prod

echo.
echo ✅ Deployment complete!
echo 🌐 Your backend is now live on Vercel!
