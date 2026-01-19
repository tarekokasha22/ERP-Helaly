/**
 * Example: How to use Anthropic API in your code
 * 
 * This file demonstrates different ways to use the Anthropic API service
 * Run this with: node examples/use-anthropic.js
 */

// Note: This is a Node.js example. In TypeScript, import from the service file directly.

// Example 1: Basic usage (after setting up the service)
console.log('📝 Example Usage of Anthropic API\n');

console.log('1. Using the service directly in TypeScript:');
console.log(`
import { sendMessageToClaude } from '../src/services/anthropic.service';

const response = await sendMessageToClaude("Hello, Claude!");
console.log(response);
`);

console.log('\n2. Using with options:');
console.log(`
const response = await sendMessageToClaude(
  "Explain quantum computing",
  {
    model: 'claude-3-5-sonnet-20241022',
    systemPrompt: 'You are a helpful science teacher.',
    maxTokens: 2048
  }
);
`);

console.log('\n3. Using via API endpoint (from frontend):');
console.log(`
// In your React component or API client
const chatWithAI = async (message) => {
  const response = await fetch('http://localhost:5000/api/ai/chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': \`Bearer \${token}\`
    },
    body: JSON.stringify({ message })
  });
  const data = await response.json();
  return data.response;
};
`);

console.log('\n4. Using with axios:');
console.log(`
import axios from 'axios';

const response = await axios.post(
  'http://localhost:5000/api/ai/chat',
  { 
    message: 'What are best practices for project management?',
    model: 'claude-3-5-sonnet-20241022'
  },
  {
    headers: {
      'Authorization': \`Bearer \${token}\`
    }
  }
);
console.log(response.data.response);
`);

console.log('\n5. Error handling:');
console.log(`
try {
  const response = await sendMessageToClaude("Hello!");
  console.log(response);
} catch (error) {
  if (error.message.includes('ANTHROPIC_API_KEY')) {
    console.error('Please set your API key in .env file');
  } else {
    console.error('Error:', error.message);
  }
}
`);

console.log('\n✅ Make sure to:');
console.log('   1. Set ANTHROPIC_API_KEY in server/.env');
console.log('   2. Install dependencies: npm install');
console.log('   3. Restart the server after adding the key');
console.log('   4. Get your API key from: https://console.anthropic.com/\n');
