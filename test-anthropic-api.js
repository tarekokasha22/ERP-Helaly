/**
 * Quick test script for Anthropic API integration
 * 
 * Usage:
 * 1. Make sure your server is running: cd server && npm run dev
 * 2. Make sure you've added ANTHROPIC_API_KEY to server/.env
 * 3. Run this script: node test-anthropic-api.js
 * 
 * You'll need a JWT token from logging in first.
 */

const axios = require('axios');

const API_URL = 'http://localhost:5000/api';
const TEST_EMAIL = 'admin@helaly.com';
const TEST_PASSWORD = 'password';
const TEST_COUNTRY = 'egypt';

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function testAnthropicAPI() {
  log('\n🤖 Testing Anthropic API Integration\n', 'cyan');
  
  let token = '';
  
  try {
    // Step 1: Login to get token
    log('Step 1: Logging in...', 'yellow');
    const loginResponse = await axios.post(`${API_URL}/auth/login`, {
      email: TEST_EMAIL,
      password: TEST_PASSWORD,
      country: TEST_COUNTRY
    });
    
    if (loginResponse.data.success && loginResponse.data.token) {
      token = loginResponse.data.token;
      log('✅ Login successful!', 'green');
    } else {
      throw new Error('Login failed - no token received');
    }
    
    // Step 2: Check AI Status
    log('\nStep 2: Checking AI service status...', 'yellow');
    try {
      const statusResponse = await axios.get(`${API_URL}/ai/status`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (statusResponse.data.configured) {
        log('✅ AI service is configured and ready!', 'green');
        log(`   Message: ${statusResponse.data.message}`, 'blue');
      } else {
        log('⚠️  AI service is not configured', 'yellow');
        log('   Please add ANTHROPIC_API_KEY to server/.env', 'yellow');
        return;
      }
    } catch (error) {
      log('❌ Error checking AI status:', 'red');
      log(`   ${error.response?.data?.message || error.message}`, 'red');
      return;
    }
    
    // Step 3: Get Available Models
    log('\nStep 3: Getting available models...', 'yellow');
    try {
      const modelsResponse = await axios.get(`${API_URL}/ai/models`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      log('✅ Available models:', 'green');
      modelsResponse.data.models.forEach((model, index) => {
        log(`   ${index + 1}. ${model}`, 'blue');
      });
    } catch (error) {
      log('❌ Error getting models:', 'red');
      log(`   ${error.response?.data?.message || error.message}`, 'red');
    }
    
    // Step 4: Test Chat
    log('\nStep 4: Testing AI chat...', 'yellow');
    try {
      const chatResponse = await axios.post(
        `${API_URL}/ai/chat`,
        {
          message: 'Hello! Can you tell me a short joke?',
          model: 'claude-3-5-sonnet-20241022'
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      if (chatResponse.data.success) {
        log('✅ Chat successful!', 'green');
        log('\n📝 AI Response:', 'cyan');
        log(`   ${chatResponse.data.response}`, 'blue');
        log(`\n   Model used: ${chatResponse.data.model}`, 'blue');
      } else {
        throw new Error('Chat failed - no response received');
      }
    } catch (error) {
      log('❌ Error in chat:', 'red');
      if (error.response?.data?.message) {
        log(`   ${error.response.data.message}`, 'red');
      } else {
        log(`   ${error.message}`, 'red');
      }
      
      if (error.response?.data?.message?.includes('ANTHROPIC_API_KEY')) {
        log('\n💡 Tip: Make sure you:', 'yellow');
        log('   1. Added ANTHROPIC_API_KEY to server/.env', 'yellow');
        log('   2. Restarted the server after adding the key', 'yellow');
        log('   3. The key starts with "sk-ant-"', 'yellow');
      }
    }
    
    // Step 5: Test with a more complex prompt
    log('\nStep 5: Testing with a complex prompt...', 'yellow');
    try {
      const complexResponse = await axios.post(
        `${API_URL}/ai/chat`,
        {
          message: 'What are 3 best practices for construction project management?',
          model: 'claude-3-5-sonnet-20241022',
          systemPrompt: 'You are a construction project management expert.',
          maxTokens: 500
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      if (complexResponse.data.success) {
        log('✅ Complex chat successful!', 'green');
        log('\n📝 AI Response:', 'cyan');
        log(`   ${complexResponse.data.response}`, 'blue');
      }
    } catch (error) {
      log('❌ Error in complex chat:', 'red');
      log(`   ${error.response?.data?.message || error.message}`, 'red');
    }
    
    log('\n✅ All tests completed!', 'green');
    log('\n💡 Next steps:', 'cyan');
    log('   1. Visit http://localhost:3000/ai-chat in your browser', 'blue');
    log('   2. Make sure you\'re logged in', 'blue');
    log('   3. Start chatting with Claude!', 'blue');
    
  } catch (error) {
    log('\n❌ Test failed:', 'red');
    if (error.response) {
      log(`   Status: ${error.response.status}`, 'red');
      log(`   Message: ${error.response.data?.message || error.message}`, 'red');
    } else if (error.request) {
      log('   No response from server. Is the server running?', 'red');
      log('   Start server: cd server && npm run dev', 'yellow');
    } else {
      log(`   Error: ${error.message}`, 'red');
    }
  }
}

// Run the test
testAnthropicAPI();
