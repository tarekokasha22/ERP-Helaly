#!/usr/bin/env node

const axios = require('axios');

// Configuration
const API_URL = 'http://localhost:5000/api';

// Color codes for better output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function testLogin() {
  log('\n🧪 LOGIN DEBUGGING TEST', 'cyan');
  log('=' .repeat(50), 'cyan');
  
  try {
    // Test 1: Check if server is running
    log('\n1️⃣ Testing server connectivity...', 'blue');
    try {
      const healthResponse = await axios.get(`http://localhost:5000/health`);
      log(`✅ Server is running: ${healthResponse.data.status}`, 'green');
      log(`   Environment: ${healthResponse.data.environment}`, 'green');
      log(`   Storage: ${healthResponse.data.storage}`, 'green');
    } catch (error) {
      log('❌ Server is not running or not accessible', 'red');
      log('   Please start the server with: cd server && npm run dev', 'yellow');
      return;
    }
    
    // Test 2: Test Egypt admin login
    log('\n2️⃣ Testing Egypt admin login...', 'blue');
    try {
      const loginData = {
        username: 'admin',
        password: 'admin123',
        country: 'egypt'
      };
      
      log(`   Sending: ${JSON.stringify(loginData, null, 2)}`, 'yellow');
      
      const response = await axios.post(`${API_URL}/auth/login`, loginData);
      
      if (response.data.success) {
        log('✅ Egypt admin login successful!', 'green');
        log(`   Token: ${response.data.token.substring(0, 20)}...`, 'green');
        log(`   User: ${response.data.user.name} (${response.data.user.country})`, 'green');
      } else {
        log('❌ Login failed - unexpected response format', 'red');
        log(`   Response: ${JSON.stringify(response.data, null, 2)}`, 'yellow');
      }
    } catch (error) {
      log('❌ Egypt admin login failed', 'red');
      if (error.response) {
        log(`   Status: ${error.response.status}`, 'red');
        log(`   Error: ${JSON.stringify(error.response.data, null, 2)}`, 'red');
      } else {
        log(`   Error: ${error.message}`, 'red');
      }
    }
    
    // Test 3: Test Libya admin login
    log('\n3️⃣ Testing Libya admin login...', 'blue');
    try {
      const loginData = {
        username: 'admin',
        password: 'admin123',
        country: 'libya'
      };
      
      const response = await axios.post(`${API_URL}/auth/login`, loginData);
      
      if (response.data.success) {
        log('✅ Libya admin login successful!', 'green');
        log(`   Token: ${response.data.token.substring(0, 20)}...`, 'green');
        log(`   User: ${response.data.user.name} (${response.data.user.country})`, 'green');
      } else {
        log('❌ Login failed - unexpected response format', 'red');
        log(`   Response: ${JSON.stringify(response.data, null, 2)}`, 'yellow');
      }
    } catch (error) {
      log('❌ Libya admin login failed', 'red');
      if (error.response) {
        log(`   Status: ${error.response.status}`, 'red');
        log(`   Error: ${JSON.stringify(error.response.data, null, 2)}`, 'red');
      } else {
        log(`   Error: ${error.message}`, 'red');
      }
    }
    
    // Test 4: Test invalid credentials
    log('\n4️⃣ Testing invalid credentials...', 'blue');
    try {
      const loginData = {
        username: 'invalid',
        password: 'invalid',
        country: 'egypt'
      };
      
      const response = await axios.post(`${API_URL}/auth/login`, loginData);
      log('❌ Invalid credentials were accepted (this should not happen)', 'red');
    } catch (error) {
      if (error.response && error.response.status === 401) {
        log('✅ Invalid credentials correctly rejected', 'green');
      } else {
        log(`⚠️  Unexpected error: ${error.response?.status || error.message}`, 'yellow');
      }
    }
    
    // Test 5: Test missing country
    log('\n5️⃣ Testing missing country...', 'blue');
    try {
      const loginData = {
        username: 'admin',
        password: 'admin123'
        // country missing
      };
      
      const response = await axios.post(`${API_URL}/auth/login`, loginData);
      log('❌ Missing country was accepted (this should not happen)', 'red');
    } catch (error) {
      if (error.response && error.response.status === 400) {
        log('✅ Missing country correctly rejected', 'green');
      } else {
        log(`⚠️  Unexpected error: ${error.response?.status || error.message}`, 'yellow');
      }
    }
    
  } catch (error) {
    log(`❌ Test failed: ${error.message}`, 'red');
  }
  
  log('\n📋 DEBUGGING TIPS:', 'cyan');
  log('1. Make sure server is running: cd server && npm run dev', 'yellow');
  log('2. Check server logs for errors', 'yellow');
  log('3. Verify data/users.json file exists and has admin users', 'yellow');
  log('4. Use these credentials: username="admin", password="admin123"', 'yellow');
  log('5. Make sure to select Egypt or Libya as country', 'yellow');
  
  log('\n🔧 If login still fails:', 'cyan');
  log('1. Delete server/data/users.json to reset users', 'yellow');
  log('2. Restart the server to recreate default users', 'yellow');
  log('3. Check browser Network tab for detailed error messages', 'yellow');
}

// Run the test
testLogin().catch(console.error);
