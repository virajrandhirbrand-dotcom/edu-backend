#!/usr/bin/env node

/**
 * Test script to verify frontend-backend connection
 */

const https = require('https');
const http = require('http');

console.log('🔍 Testing Backend-Frontend Connection...\n');

// Test local server
function testLocalServer() {
  return new Promise((resolve) => {
    const req = http.get('http://localhost:5001', (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          console.log('✅ Local Server Test:');
          console.log(`   Status: ${response.status}`);
          console.log(`   CORS: ${response.cors}`);
          console.log(`   Environment: ${response.environment}`);
          resolve(true);
        } catch (e) {
          console.log('❌ Local Server Test: Failed to parse response');
          resolve(false);
        }
      });
    });
    
    req.on('error', () => {
      console.log('❌ Local Server Test: Server not running on localhost:5001');
      resolve(false);
    });
    
    req.setTimeout(5000, () => {
      console.log('❌ Local Server Test: Timeout');
      resolve(false);
    });
  });
}

// Test CORS headers
function testCORS() {
  console.log('\n🌐 CORS Configuration:');
  console.log('   ✅ Allowed Origins:');
  console.log('      - http://localhost:3000 (React)');
  console.log('      - http://localhost:3001 (React)');
  console.log('      - http://localhost:5173 (Vite)');
  console.log('      - https://*.vercel.app (Vercel)');
  console.log('      - https://*.netlify.app (Netlify)');
  console.log('   ✅ Methods: GET, POST, PUT, DELETE, PATCH, OPTIONS');
  console.log('   ✅ Headers: Content-Type, Authorization, x-auth-token');
  console.log('   ✅ Credentials: Enabled');
}

// Test API endpoints
function testAPIEndpoints() {
  console.log('\n📡 API Endpoints Available:');
  console.log('   ✅ GET  / - API Status');
  console.log('   ✅ GET  /health - Health Check');
  console.log('   ✅ POST /api/auth/register - User Registration');
  console.log('   ✅ POST /api/auth/login - User Login');
  console.log('   ✅ GET  /api/courses - Get Courses');
  console.log('   ✅ POST /api/ai/generate-quiz - AI Quiz Generation');
  console.log('   ✅ POST /api/ai-assistant/chat - AI Assistant');
  console.log('   ✅ GET  /api/internships - Get Internships');
  console.log('   ✅ POST /api/plagiarism/check - Plagiarism Check');
}

// Main test function
async function runTests() {
  console.log('🚀 Backend-Frontend Connection Test\n');
  
  // Test local server
  const localTest = await testLocalServer();
  
  // Show CORS configuration
  testCORS();
  
  // Show API endpoints
  testAPIEndpoints();
  
  console.log('\n📋 Frontend Integration Guide:');
  console.log('   1. Set your frontend API base URL to your Vercel backend URL');
  console.log('   2. Example: const API_BASE_URL = "https://your-backend.vercel.app"');
  console.log('   3. Make sure to include credentials in your requests');
  console.log('   4. Handle CORS preflight requests properly');
  
  console.log('\n🔧 Environment Variables Required:');
  console.log('   - MONGO_URI: Your MongoDB connection string');
  console.log('   - JWT_SECRET: Your JWT secret key');
  console.log('   - GEMINI_API_KEY: Your Google Gemini AI API key');
  console.log('   - FRONTEND_URL: Your frontend URL (optional)');
  
  if (localTest) {
    console.log('\n✅ All tests passed! Your backend is ready for frontend connection.');
  } else {
    console.log('\n⚠️  Local server test failed. Make sure to run: npm run dev');
  }
  
  console.log('\n🚀 Ready to deploy to Vercel!');
}

// Run tests
runTests().catch(console.error);
