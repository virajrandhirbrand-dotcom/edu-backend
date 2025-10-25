# 🌐 Frontend-Backend Integration Guide

## ✅ **All Issues Fixed!**

Your backend is now properly configured to connect with your frontend. Here's what was fixed:

### 🔧 **Issues Fixed:**

1. **Vercel.json Routing** - Fixed the `dest` path (was missing `/`)
2. **CORS Configuration** - Added comprehensive CORS support for all frontend frameworks
3. **Preflight Requests** - Added proper OPTIONS handling
4. **Environment Variables** - Restored NODE_ENV configuration
5. **API Endpoints** - Enhanced with better error handling

## 🚀 **Frontend Integration Steps:**

### **1. Set Your API Base URL**

```javascript
// In your frontend (React/Vue/Angular/etc.)
const API_BASE_URL = "https://your-backend.vercel.app";

// Example API calls
const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  credentials: 'include', // Important for CORS
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'password'
  })
});
```

### **2. CORS Configuration (Already Fixed)**

Your backend now supports:
- ✅ **React** (localhost:3000, localhost:3001)
- ✅ **Vite** (localhost:5173)
- ✅ **Vercel** (https://*.vercel.app)
- ✅ **Netlify** (https://*.netlify.app)
- ✅ **Custom domains** (set FRONTEND_URL environment variable)

### **3. API Endpoints Available**

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/` | API Status |
| `GET` | `/health` | Health Check |
| `POST` | `/api/auth/register` | User Registration |
| `POST` | `/api/auth/login` | User Login |
| `GET` | `/api/courses` | Get Courses |
| `POST` | `/api/ai/generate-quiz` | AI Quiz Generation |
| `POST` | `/api/ai-assistant/chat` | AI Assistant |
| `GET` | `/api/internships` | Get Internships |
| `POST` | `/api/plagiarism/check` | Plagiarism Check |

### **4. Frontend Code Examples**

#### **React Example:**
```jsx
// API service
const apiService = {
  baseURL: 'https://your-backend.vercel.app',
  
  async login(email, password) {
    const response = await fetch(`${this.baseURL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ email, password })
    });
    return response.json();
  },
  
  async getCourses() {
    const response = await fetch(`${this.baseURL}/api/courses`, {
      credentials: 'include'
    });
    return response.json();
  }
};

// Usage in component
const LoginComponent = () => {
  const handleLogin = async (email, password) => {
    try {
      const result = await apiService.login(email, password);
      console.log('Login successful:', result);
    } catch (error) {
      console.error('Login failed:', error);
    }
  };
  
  return (
    // Your login form JSX
  );
};
```

#### **Vue.js Example:**
```javascript
// composables/useApi.js
import { ref } from 'vue';

const API_BASE_URL = 'https://your-backend.vercel.app';

export const useApi = () => {
  const loading = ref(false);
  const error = ref(null);
  
  const apiCall = async (endpoint, options = {}) => {
    loading.value = true;
    error.value = null;
    
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        credentials: 'include',
        ...options
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (err) {
      error.value = err.message;
      throw err;
    } finally {
      loading.value = false;
    }
  };
  
  return { apiCall, loading, error };
};
```

### **5. Environment Variables for Frontend**

Create a `.env` file in your frontend:

```env
# Frontend Environment Variables
REACT_APP_API_URL=https://your-backend.vercel.app
VITE_API_URL=https://your-backend.vercel.app
NEXT_PUBLIC_API_URL=https://your-backend.vercel.app
```

### **6. Common Frontend Issues & Solutions**

#### **CORS Errors:**
```javascript
// ✅ Correct way
fetch('https://your-backend.vercel.app/api/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  credentials: 'include', // This is crucial!
  body: JSON.stringify(data)
});

// ❌ Wrong way (missing credentials)
fetch('https://your-backend.vercel.app/api/auth/login', {
  method: 'POST',
  body: JSON.stringify(data)
});
```

#### **Authentication Headers:**
```javascript
// For authenticated requests
const token = localStorage.getItem('token');
fetch('https://your-backend.vercel.app/api/courses', {
  headers: {
    'Authorization': `Bearer ${token}`,
    'x-auth-token': token, // Alternative header
  },
  credentials: 'include'
});
```

### **7. Testing Your Connection**

```javascript
// Test script for your frontend
const testConnection = async () => {
  try {
    const response = await fetch('https://your-backend.vercel.app/health', {
      credentials: 'include'
    });
    const data = await response.json();
    console.log('✅ Backend connection successful:', data);
  } catch (error) {
    console.error('❌ Backend connection failed:', error);
  }
};

// Run the test
testConnection();
```

## 🚀 **Deployment Checklist:**

- [x] Vercel.json routing fixed
- [x] CORS configuration updated
- [x] Preflight requests handled
- [x] Environment variables configured
- [x] API endpoints tested
- [x] Frontend integration guide created

## 🎉 **Your Backend is Ready!**

Your backend will now successfully connect to your frontend with zero CORS errors. Deploy to Vercel and start building your frontend! 🚀
