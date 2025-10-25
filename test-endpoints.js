#!/usr/bin/env node

/**
 * Test script to verify all API endpoints are working
 */

const https = require('https');
const http = require('http');

const API_BASE_URL = process.argv[2] || 'https://your-backend.vercel.app';

console.log(`🔍 Testing API endpoints at: ${API_BASE_URL}\n`);

// Test function
function testEndpoint(method, endpoint, data = null) {
  return new Promise((resolve) => {
    const url = new URL(endpoint, API_BASE_URL);
    const options = {
      method: method,
      headers: {
        'Content-Type': 'application/json',
      }
    };

    const req = (url.protocol === 'https:' ? https : http).request(url, options, (res) => {
      let responseData = '';
      res.on('data', chunk => responseData += chunk);
      res.on('end', () => {
        const status = res.statusCode;
        const success = status >= 200 && status < 300;
        console.log(`${success ? '✅' : '❌'} ${method} ${endpoint} - Status: ${status}`);
        if (!success) {
          console.log(`   Response: ${responseData.substring(0, 100)}...`);
        }
        resolve({ success, status, data: responseData });
      });
    });

    req.on('error', (error) => {
      console.log(`❌ ${method} ${endpoint} - Error: ${error.message}`);
      resolve({ success: false, error: error.message });
    });

    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

// Test endpoints
async function runTests() {
  console.log('🚀 Starting API endpoint tests...\n');

  // Test basic endpoints
  await testEndpoint('GET', '/');
  await testEndpoint('GET', '/health');
  await testEndpoint('GET', '/api/auth/test');

  // Test auth endpoints
  console.log('\n🔐 Testing Authentication Endpoints:');
  await testEndpoint('POST', '/api/auth/register', {
    email: 'test@example.com',
    password: 'password123',
    role: 'student',
    firstName: 'Test',
    lastName: 'User'
  });

  await testEndpoint('POST', '/api/auth/login', {
    email: 'test@example.com',
    password: 'password123'
  });

  // Test direct auth endpoints
  console.log('\n🔐 Testing Direct Authentication Endpoints:');
  await testEndpoint('POST', '/api/auth/register-direct', {
    email: 'test2@example.com',
    password: 'password123',
    role: 'student',
    firstName: 'Test2',
    lastName: 'User2'
  });

  await testEndpoint('POST', '/api/auth/login-direct', {
    email: 'test2@example.com',
    password: 'password123'
  });

  // Test other endpoints
  console.log('\n📚 Testing Other Endpoints:');
  await testEndpoint('GET', '/api/courses');
  await testEndpoint('GET', '/api/subjects');
  await testEndpoint('GET', '/api/internships');
  await testEndpoint('GET', '/api/quizzes');

  console.log('\n✅ Endpoint testing complete!');
  console.log('\n📋 If you see ❌ errors, check:');
  console.log('   1. Environment variables are set in Vercel');
  console.log('   2. MongoDB connection is working');
  console.log('   3. All route files are properly loaded');
  console.log('   4. No syntax errors in controllers');
}

// Run tests
runTests().catch(console.error);
