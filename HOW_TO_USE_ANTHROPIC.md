# 🚀 How to Use Anthropic API - Quick Start

You've added your API key! Here's how to use it:

## ✅ Step 1: Install Dependencies

```bash
cd helaly-erp/server
npm install
```

## ✅ Step 2: Restart Your Server

After adding the API key, restart your server:

```bash
cd helaly-erp/server
npm run dev
```

## 🎯 Step 3: Test It Works

### Option A: Use the Test Script (Easiest)

```bash
# From the project root
node test-anthropic-api.js
```

This will:
- ✅ Login automatically
- ✅ Check if API is configured
- ✅ List available models
- ✅ Test a simple chat
- ✅ Test a complex prompt

### Option B: Use the Web Interface

1. **Start your frontend:**
   ```bash
   cd helaly-erp/client
   npm start
   ```

2. **Login** to your account (admin@helaly.com / password)

3. **Navigate to AI Chat:**
   - Click on "AI Chat" or "المساعد الذكي" in the sidebar
   - Or go directly to: http://localhost:3000/ai-chat

4. **Start chatting!** Type a message and press Send.

## 💻 Step 4: Use in Your Code

### From Frontend (React)

```typescript
import aiService from './services/aiService';

// Simple chat
const response = await aiService.chat("What are best practices for project management?");

// With options
const response = await aiService.chat(
  "Analyze this project data...",
  {
    model: 'claude-3-5-sonnet-20241022',
    systemPrompt: 'You are a construction project expert.',
    maxTokens: 2048
  }
);
```

### From Backend (TypeScript)

```typescript
import { sendMessageToClaude } from './services/anthropic.service';

// In your controller or service
const response = await sendMessageToClaude("Hello, Claude!");

// With options
const response = await sendMessageToClaude(
  "Generate a project report",
  {
    model: 'claude-3-5-sonnet-20241022',
    systemPrompt: 'You are a project management assistant.',
    maxTokens: 2048
  }
);
```

### Via API Endpoint

```bash
# POST /api/ai/chat
curl -X POST http://localhost:5000/api/ai/chat \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Hello, Claude!",
    "model": "claude-3-5-sonnet-20241022"
  }'
```

## 📋 Available API Endpoints

### 1. Check Status
```bash
GET /api/ai/status
```

### 2. Get Models
```bash
GET /api/ai/models
```

### 3. Chat
```bash
POST /api/ai/chat
Body: {
  "message": "Your message",
  "model": "claude-3-5-sonnet-20241022",  // Optional
  "systemPrompt": "You are...",           // Optional
  "maxTokens": 1024                        // Optional
}
```

## 🎨 Example Use Cases

### 1. Project Management Assistant
```typescript
const response = await aiService.chat(
  "Create a timeline for a 6-month road construction project",
  {
    systemPrompt: "You are a construction project management expert."
  }
);
```

### 2. Financial Analysis
```typescript
const response = await aiService.chat(
  `Analyze these spending patterns:
  - Materials: $50,000
  - Labor: $30,000
  - Equipment: $20,000
  What are the key insights?`,
  {
    systemPrompt: "You are a financial analyst for construction projects."
  }
);
```

### 3. Report Generation
```typescript
const response = await aiService.chat(
  "Generate a monthly summary report for our construction projects",
  {
    model: 'claude-3-5-sonnet-20241022',
    maxTokens: 2048
  }
);
```

## 🔍 Troubleshooting

### ❌ "ANTHROPIC_API_KEY is not set"
- Make sure you added the key to `server/.env`
- Restart the server after adding the key
- Check the key starts with `sk-ant-`

### ❌ "401 Unauthorized"
- Make sure you're logged in
- Check your JWT token is valid
- Token expires after 24 hours

### ❌ "Failed to get response from Claude"
- Check your internet connection
- Verify you have API credits/quota
- Check the Anthropic status page

## 📚 More Information

- Full guide: `ANTHROPIC_API_GUIDE.md`
- Examples: `server/examples/use-anthropic.js`
- Test script: `test-anthropic-api.js`

## 🎉 You're Ready!

Your Anthropic API is now integrated and ready to use. Try it out in the web interface or use it in your code!
