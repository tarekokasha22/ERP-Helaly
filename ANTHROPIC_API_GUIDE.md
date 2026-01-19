# 🤖 Anthropic API Integration Guide

This guide explains how to use your Anthropic API key with the Helaly ERP system.

## 📋 Prerequisites

1. **Get your API key** from [Anthropic Console](https://console.anthropic.com/)
2. **Install dependencies** (if not already done):
   ```bash
   cd server
   npm install
   ```

## 🔑 Step 1: Add Your API Key

### Option A: Using .env file (Recommended)

1. Navigate to the `server` directory
2. Create or edit the `.env` file
3. Add your API key:
   ```env
   ANTHROPIC_API_KEY=sk-ant-api03-your-actual-api-key-here
   ```

### Option B: Using setup script

Run the setup script which will create a `.env` file with a placeholder:
```bash
node setup-environment.js
```

Then edit `server/.env` and replace `your_anthropic_api_key_here` with your actual API key.

## 🚀 Step 2: Install the SDK

The Anthropic SDK should already be in `package.json`. If not, install it:

```bash
cd server
npm install @anthropic-ai/sdk
```

## 📝 Step 3: Using the API

### Available Endpoints

#### 1. Check API Status
```bash
GET /api/ai/status
```

**Response:**
```json
{
  "success": true,
  "configured": true,
  "message": "Anthropic API is configured and ready to use"
}
```

#### 2. Get Available Models
```bash
GET /api/ai/models
```

**Response:**
```json
{
  "success": true,
  "models": [
    "claude-3-5-sonnet-20241022",
    "claude-3-5-haiku-20241022",
    "claude-3-opus-20240229",
    "claude-3-sonnet-20240229",
    "claude-3-haiku-20240307"
  ],
  "configured": true
}
```

#### 3. Chat with Claude AI
```bash
POST /api/ai/chat
Authorization: Bearer <your-jwt-token>
Content-Type: application/json

{
  "message": "What is the weather like today?",
  "model": "claude-3-5-sonnet-20241022",  // Optional
  "systemPrompt": "You are a helpful assistant.",  // Optional
  "maxTokens": 1024  // Optional, default: 1024
}
```

**Response:**
```json
{
  "success": true,
  "response": "I don't have access to real-time weather data...",
  "model": "claude-3-5-sonnet-20241022"
}
```

## 💻 Code Examples

### Using the Service Directly (Server-side)

```typescript
import { sendMessageToClaude } from './services/anthropic.service';

// Simple message
const response = await sendMessageToClaude("Hello, Claude!");

// With options
const response = await sendMessageToClaude(
  "Explain quantum computing in simple terms",
  {
    model: 'claude-3-5-sonnet-20241022',
    systemPrompt: 'You are a helpful science teacher.',
    maxTokens: 2048
  }
);
```

### Using from Frontend (Client-side)

```typescript
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
const token = localStorage.getItem('token');

// Chat with AI
const chatWithAI = async (message: string) => {
  try {
    const response = await axios.post(
      `${API_URL}/ai/chat`,
      { message },
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
    return response.data.response;
  } catch (error) {
    console.error('Error chatting with AI:', error);
    throw error;
  }
};

// Usage
const aiResponse = await chatWithAI("What are the best practices for project management?");
console.log(aiResponse);
```

## 🧪 Testing the Integration

### 1. Test API Status
```bash
curl -X GET http://localhost:5000/api/ai/status \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 2. Test Chat Endpoint
```bash
curl -X POST http://localhost:5000/api/ai/chat \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello, Claude!"}'
```

### 3. Using PowerShell (Windows)
```powershell
$token = "YOUR_JWT_TOKEN"
$body = @{message="Hello, Claude!"} | ConvertTo-Json
$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}
Invoke-RestMethod -Uri "http://localhost:5000/api/ai/chat" -Method POST -Body $body -Headers $headers
```

## 📚 Available Models

| Model | Description | Best For |
|-------|-------------|----------|
| `claude-3-5-sonnet-20241022` | Latest and most capable | General use, complex tasks |
| `claude-3-5-haiku-20241022` | Fast and efficient | Simple queries, quick responses |
| `claude-3-opus-20240229` | Most powerful | Complex reasoning, analysis |
| `claude-3-sonnet-20240229` | Balanced performance | General purpose |
| `claude-3-haiku-20240307` | Fastest | Simple tasks, high throughput |

## 🔒 Security Notes

1. **Never commit your API key** to version control
2. **Keep your `.env` file** in `.gitignore`
3. **Use environment variables** in production
4. **Rotate your API key** if it's exposed

## ⚠️ Troubleshooting

### Error: "ANTHROPIC_API_KEY is not set"
- Make sure you've added the key to `server/.env`
- Restart the server after adding the key
- Check that the key starts with `sk-ant-`

### Error: "Failed to get response from Claude"
- Verify your API key is valid
- Check your internet connection
- Ensure you have API credits/quota available
- Check the Anthropic status page

### Error: "401 Unauthorized"
- Make sure you're sending a valid JWT token
- Check that the token hasn't expired
- Verify you're logged in

## 📖 Additional Resources

- [Anthropic API Documentation](https://docs.anthropic.com/)
- [Anthropic Console](https://console.anthropic.com/)
- [Claude Models Overview](https://docs.anthropic.com/claude/docs/models-overview)

## 🎯 Example Use Cases

### 1. Project Management Assistant
```typescript
const response = await sendMessageToClaude(
  "Generate a project timeline for a 6-month construction project",
  {
    systemPrompt: "You are a construction project management expert."
  }
);
```

### 2. Financial Analysis
```typescript
const response = await sendMessageToClaude(
  "Analyze these spending patterns: [data]",
  {
    systemPrompt: "You are a financial analyst specializing in construction projects."
  }
);
```

### 3. Report Generation
```typescript
const response = await sendMessageToClaude(
  "Create a monthly report summary for [project data]",
  {
    model: 'claude-3-5-sonnet-20241022',
    maxTokens: 2048
  }
);
```

## ✅ Quick Start Checklist

- [ ] Get API key from Anthropic Console
- [ ] Add `ANTHROPIC_API_KEY` to `server/.env`
- [ ] Install dependencies: `npm install` in `server/`
- [ ] Restart the server
- [ ] Test with: `GET /api/ai/status`
- [ ] Try a chat: `POST /api/ai/chat`

---

**Need Help?** Check the server logs for detailed error messages or visit the [Anthropic Documentation](https://docs.anthropic.com/).
