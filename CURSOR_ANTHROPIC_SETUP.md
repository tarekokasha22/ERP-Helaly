# 🤖 Configure Cursor IDE to Use Anthropic Models

This guide shows you how to configure Cursor IDE to use your Anthropic API key so you can use Claude models directly in Cursor.

## 🎯 Step 1: Open Cursor Settings

1. **Open Cursor Settings:**
   - Click the **gear icon** (⚙️) in the upper right corner
   - Or press `Ctrl + ,` (Windows/Linux) or `Cmd + ,` (Mac)
   - Or go to: **File → Preferences → Settings**

2. **Navigate to the "Models" tab** in the settings

## 🔑 Step 2: Configure Anthropic API Key

### The Easy Way (Recommended):

1. In the **Models** tab, find the **"Anthropic API Key"** section
2. **Paste your Anthropic API key** (starts with `sk-ant-`)
3. Click the **"Verify"** button to ensure the key is valid
4. Once verified, your Anthropic API key will be enabled ✅

### Alternative: Via Settings JSON

If you prefer to edit settings directly:

1. Press `Ctrl + Shift + P` (Windows/Linux) or `Cmd + Shift + P` (Mac)
2. Type: **"Preferences: Open User Settings (JSON)"**
3. Add this configuration:

```json
{
  "cursor.anthropic.apiKey": "sk-ant-api03-your-actual-api-key-here"
}
```

## 🎨 Step 3: Select Your Model

1. After verifying your API key, you can select which Claude model to use
2. Available Anthropic models:
   - `claude-3-5-sonnet-20241022` (Recommended - Latest and most capable)
   - `claude-3-5-haiku-20241022` (Fast and efficient)
   - `claude-3-opus-20240229` (Most powerful)
   - `claude-3-sonnet-20240229` (Balanced)
   - `claude-3-haiku-20240307` (Fastest)

**Note:** Custom API keys work with standard chat models. Features like Tab Completion may still use Cursor's built-in models.

## ✅ Step 4: Verify It's Working

1. **Open the Cursor Chat** (usually `Ctrl + L` or `Cmd + L`)
2. **Ask a test question** like: "Hello, can you help me with coding?"
3. If you get a response from Claude, it's working! 🎉

## 🔧 Alternative: Using Cursor Rules File

You can also create a `.cursorrules` file in your project root to configure model preferences:

```markdown
# Cursor Rules for this project

## Model Configuration
- Use Anthropic Claude 3.5 Sonnet for code generation
- Prefer detailed explanations
- Follow TypeScript/React best practices

## Code Style
- Use TypeScript strict mode
- Follow existing code patterns
- Use functional programming where appropriate
```

## 📝 Quick Reference

### Available Anthropic Models in Cursor:

| Model | Best For | Speed |
|-------|----------|-------|
| `claude-3-5-sonnet-20241022` | General coding, complex tasks | Medium |
| `claude-3-5-haiku-20241022` | Quick responses, simple tasks | Fast |
| `claude-3-opus-20240229` | Complex reasoning, analysis | Slow |
| `claude-3-sonnet-20240229` | General purpose | Medium |
| `claude-3-haiku-20240307` | Simple queries | Very Fast |

### Keyboard Shortcuts:

- `Ctrl + L` / `Cmd + L` - Open Cursor Chat
- `Ctrl + K` / `Cmd + K` - Inline edit with AI
- `Ctrl + Shift + L` / `Cmd + Shift + L` - Composer mode

## ⚠️ Troubleshooting

### ❌ "API Key not found" or "Invalid API Key"
- Make sure you've entered the key correctly (no extra spaces)
- Check it starts with `sk-ant-`
- Click "Verify" button to test the key
- Restart Cursor after adding the key

### ❌ "Model does not work with your current plan or API key"
- **Important:** Make sure **"Override OpenAI Base URL"** is **TURNED OFF**
- Enabling this option can cause Anthropic API requests to fail
- Verify your API key has access to the model
- Check your Anthropic account has credits/quota

### ❌ "Rate limit exceeded"
- You've hit your API usage limit
- Check your Anthropic account dashboard: https://console.anthropic.com/settings/usage
- Wait a bit or upgrade your plan

### ✅ Best Practices
- Custom API keys work with standard chat models
- Tab Completion and other specialized features may use Cursor's built-in models
- You'll be charged by Anthropic directly for API usage
- Monitor your usage at: https://console.anthropic.com/settings/usage

## 🔒 Security Note

- **Never commit your API key** to version control
- Add `.cursorrules` to `.gitignore` if it contains sensitive info
- Use environment variables for production setups

## 💰 Cost Information

- **You pay Anthropic directly** for API usage (not Cursor)
- **Unlimited AI messages** at your own cost
- Check pricing: https://www.anthropic.com/pricing
- Monitor usage: https://console.anthropic.com/settings/usage

## 🎉 You're All Set!

Now Cursor will use Claude models powered by your Anthropic API key. Enjoy coding with Claude! 🚀

---

**Need Help?**
- **Cursor API Keys Docs:** https://docs.cursor.com/advanced/api-keys
- **Anthropic Console:** https://console.anthropic.com/
- **Check your API usage:** https://console.anthropic.com/settings/usage
- **Anthropic Pricing:** https://www.anthropic.com/pricing
