# 🚀 How to Use Claude in Cursor IDE

Now that you've configured your Anthropic API key, here's how to use Claude models in Cursor!

## ⌨️ Keyboard Shortcuts (Most Important!)

### 1. **Cursor Chat** - Main AI Assistant
- **Windows/Linux:** `Ctrl + L`
- **Mac:** `Cmd + L`
- Opens the chat panel where you can ask Claude questions and get help

### 2. **Inline Edit** - Edit code with AI
- **Windows/Linux:** `Ctrl + K`
- **Mac:** `Cmd + K`
- Select code, press the shortcut, and Claude will help you edit it

### 3. **Composer Mode** - Multi-file editing
- **Windows/Linux:** `Ctrl + Shift + L`
- **Mac:** `Cmd + Shift + L`
- Work across multiple files with Claude's help

## 💬 Using Cursor Chat (`Ctrl + L` / `Cmd + L`)

### Basic Usage:
1. Press `Ctrl + L` (or `Cmd + L` on Mac)
2. Type your question or request
3. Press `Enter` to send
4. Claude will respond with code suggestions or explanations

### Example Prompts:

**Ask for help:**
```
How do I create a React component for a user profile?
```

**Explain code:**
```
Explain what this function does: [select code and ask]
```

**Debug issues:**
```
Why is this code throwing an error? [paste error message]
```

**Refactor code:**
```
Refactor this code to use TypeScript best practices: [select code]
```

**Generate code:**
```
Create a TypeScript service for handling API authentication with JWT tokens
```

## ✏️ Using Inline Edit (`Ctrl + K` / `Cmd + K`)

### How to Use:
1. **Select the code** you want to modify
2. Press `Ctrl + K` (or `Cmd + K`)
3. Type your instruction in the popup
4. Claude will suggest changes
5. Accept or modify the suggestions

### Example Workflow:

**Example 1: Add error handling**
```
1. Select a function
2. Press Ctrl + K
3. Type: "Add try-catch error handling"
4. Review and accept changes
```

**Example 2: Convert to async/await**
```
1. Select promise-based code
2. Press Ctrl + K
3. Type: "Convert to async/await syntax"
4. Accept changes
```

**Example 3: Add TypeScript types**
```
1. Select JavaScript code
2. Press Ctrl + K
3. Type: "Add TypeScript type annotations"
4. Review types and accept
```

## 🎨 Using Composer Mode (`Ctrl + Shift + L`)

### When to Use:
- Working on features that span multiple files
- Refactoring across the codebase
- Creating new features with multiple components

### Example:
```
Create a new authentication system with:
- Login component
- Auth service
- Protected routes
- JWT token management
```

Claude will help you create all the necessary files!

## 🎯 Practical Examples for Your Project

### Example 1: Create a New API Endpoint

**In Cursor Chat (`Ctrl + L`):**
```
Create a new Express route for /api/notifications that:
- Returns a list of notifications
- Supports pagination
- Filters by read/unread status
- Uses TypeScript
```

### Example 2: Fix a Bug

**Select the problematic code, then `Ctrl + K`:**
```
Fix: This function is not handling null values correctly. 
Add proper null checks and return appropriate defaults.
```

### Example 3: Add a Feature

**In Composer Mode (`Ctrl + Shift + L`):**
```
Add a notification system to the ERP:
- Create notification model
- Add notification service
- Create notification API endpoints
- Add notification UI component
- Integrate with existing auth system
```

### Example 4: Refactor Code

**Select code, then `Ctrl + K`:**
```
Refactor this to use async/await instead of promises, 
add proper error handling, and improve TypeScript types
```

### Example 5: Explain Complex Code

**In Cursor Chat (`Ctrl + L`):**
```
Explain how the authentication middleware works in this project
```

Then select the auth middleware file and ask Claude to explain it.

## 💡 Pro Tips

### 1. **Be Specific**
❌ Bad: "Fix this"
✅ Good: "Add error handling for network failures and show user-friendly messages"

### 2. **Provide Context**
When asking about code, mention:
- What you're trying to achieve
- What's not working
- Any constraints or requirements

### 3. **Use Multi-turn Conversations**
- Ask follow-up questions
- Refine your requests based on responses
- Build on previous answers

### 4. **Review Before Accepting**
- Always review AI suggestions
- Test the code after accepting
- Make adjustments as needed

### 5. **Combine with Code Selection**
- Select relevant code before asking
- Claude will understand context better
- More accurate suggestions

## 🎨 Common Use Cases

### ✅ Code Generation
```
Create a React hook for managing form state with validation
```

### ✅ Code Review
```
Review this code for security vulnerabilities and best practices
```

### ✅ Documentation
```
Generate JSDoc comments for this TypeScript function
```

### ✅ Testing
```
Create unit tests for this service using Jest
```

### ✅ Debugging
```
Why is this useEffect hook running on every render?
```

### ✅ Optimization
```
Optimize this database query for better performance
```

## 🔍 Advanced Features

### 1. **Codebase Context**
Claude can understand your entire codebase. Ask:
```
How does authentication work in this project?
```

### 2. **File References**
Ask about specific files:
```
What does the auth.controller.ts file do?
```

### 3. **Pattern Matching**
```
Show me all places where we use JWT tokens
```

### 4. **Best Practices**
```
What are the best practices for error handling in Express?
```

## ⚡ Quick Reference Card

| Action | Shortcut | Use Case |
|--------|----------|----------|
| **Chat** | `Ctrl + L` / `Cmd + L` | Ask questions, get help |
| **Inline Edit** | `Ctrl + K` / `Cmd + K` | Edit selected code |
| **Composer** | `Ctrl + Shift + L` | Multi-file editing |
| **Tab Completion** | Auto | Code suggestions as you type |

## 🎯 Try These Right Now!

1. **Open Cursor Chat** (`Ctrl + L`)
   - Ask: "What are the main features of this ERP system?"

2. **Select some code** and press `Ctrl + K`
   - Ask: "Add comments explaining what this does"

3. **Try Composer** (`Ctrl + Shift + L`)
   - Ask: "Create a simple dashboard widget component"

## 🚨 Important Notes

- **Review all suggestions** before accepting
- **Test your code** after AI changes
- **Keep your API key secure** - don't share it
- **Monitor usage** at https://console.anthropic.com/settings/usage
- **Custom keys** work with chat models (Tab Completion may use Cursor's models)

## 🎉 You're Ready!

Start using Claude in Cursor:
1. Press `Ctrl + L` to open chat
2. Ask your first question
3. Start coding with AI assistance!

---

**Need Help?**
- Cursor Docs: https://docs.cursor.com
- Keyboard Shortcuts: Check Cursor Settings → Keyboard Shortcuts
- Anthropic Console: https://console.anthropic.com/
