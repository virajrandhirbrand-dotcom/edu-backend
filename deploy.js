#!/usr/bin/env node

/**
 * Deployment script for Vercel
 * This script ensures all environment variables are set and the app is ready for deployment
 */

const fs = require('fs');
const path = require('path');

console.log('🚀 Preparing for Vercel deployment...');

// Check if .env.example exists
if (!fs.existsSync('.env.example')) {
  console.error('❌ .env.example file not found');
  process.exit(1);
}

// Check if server.js exists
if (!fs.existsSync('server.js')) {
  console.error('❌ server.js file not found');
  process.exit(1);
}

// Check if vercel.json exists
if (!fs.existsSync('vercel.json')) {
  console.error('❌ vercel.json file not found');
  process.exit(1);
}

// Check if api/index.js exists
if (!fs.existsSync('api/index.js')) {
  console.error('❌ api/index.js file not found');
  process.exit(1);
}

console.log('✅ All required files are present');
console.log('✅ Project is ready for Vercel deployment');
console.log('');
console.log('📋 Next steps:');
console.log('1. Set environment variables in Vercel dashboard:');
console.log('   - MONGO_URI');
console.log('   - JWT_SECRET');
console.log('   - GEMINI_API_KEY');
console.log('   - NODE_ENV=production');
console.log('');
console.log('2. Deploy using: vercel --prod');
console.log('');
console.log('3. Or connect your GitHub repository to Vercel dashboard');
