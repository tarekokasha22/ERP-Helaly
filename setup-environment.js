#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Color codes for better output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function header(message) {
  log(`\n${'='.repeat(60)}`, 'cyan');
  log(`${message}`, 'cyan');
  log(`${'='.repeat(60)}`, 'cyan');
}

function success(message) {
  log(`✅ ${message}`, 'green');
}

function warning(message) {
  log(`⚠️  ${message}`, 'yellow');
}

function info(message) {
  log(`ℹ️  ${message}`, 'blue');
}

// Environment file contents
const serverEnvContent = `PORT=5000
JWT_SECRET=helaly_construction_secret_key_2024
NODE_ENV=development
USE_JSON_STORAGE=true
CORS_ORIGIN=http://localhost:3000

# MongoDB Configuration (for future use)
MONGODB_URI=mongodb://localhost:27017/helaly-erp

# Anthropic AI Configuration
# Get your API key from: https://console.anthropic.com/
ANTHROPIC_API_KEY=your_anthropic_api_key_here

# Security
BCRYPT_ROUNDS=10

# File Upload
MAX_FILE_SIZE=10485760
UPLOAD_PATH=./uploads

# Logging
LOG_LEVEL=debug
LOG_FILE=./logs/app.log`;

const clientEnvContent = `REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_USE_MOCK_API=false
REACT_APP_VERSION=1.0.0
REACT_APP_COMPANY_NAME=Al-Helaly Construction
REACT_APP_DEFAULT_LANGUAGE=ar
REACT_APP_SUPPORTED_COUNTRIES=egypt,libya

# Development
GENERATE_SOURCEMAP=true
FAST_REFRESH=true`;

function createEnvironmentFile(filePath, content, description) {
  try {
    if (fs.existsSync(filePath)) {
      warning(`${description} already exists. Skipping...`);
      return false;
    }
    
    fs.writeFileSync(filePath, content);
    success(`Created ${description}`);
    return true;
  } catch (error) {
    log(`❌ Failed to create ${description}: ${error.message}`, 'red');
    return false;
  }
}

function ensureDirectory(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    success(`Created directory: ${dirPath}`);
  }
}

function createDefaultUsers() {
  const dataDir = path.join(__dirname, 'server', 'data');
  const usersFile = path.join(dataDir, 'users.json');
  
  ensureDirectory(dataDir);
  
  if (fs.existsSync(usersFile)) {
    info('Users file already exists. Skipping default user creation...');
    return;
  }
  
  // Create default users for both countries
  const defaultUsers = [
    {
      "_id": "admin_egypt_001",
      "name": "مدير مصر",
      "username": "admin",
      "email": "admin.egypt@helaly.com",
      "password": "$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi", // admin123
      "role": "admin",
      "country": "egypt",
      "createdAt": new Date().toISOString(),
      "updatedAt": new Date().toISOString()
    },
    {
      "_id": "admin_libya_001",
      "name": "مدير ليبيا", 
      "username": "admin",
      "email": "admin.libya@helaly.com",
      "password": "$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi", // admin123
      "role": "admin",
      "country": "libya",
      "createdAt": new Date().toISOString(),
      "updatedAt": new Date().toISOString()
    }
  ];
  
  try {
    fs.writeFileSync(usersFile, JSON.stringify(defaultUsers, null, 2));
    success('Created default admin users');
    info('Default credentials:');
    info('  Egypt: username="admin", password="admin123"');
    info('  Libya: username="admin", password="admin123"');
  } catch (error) {
    log(`❌ Failed to create default users: ${error.message}`, 'red');
  }
}

function createDataFiles() {
  const dataDir = path.join(__dirname, 'server', 'data');
  ensureDirectory(dataDir);
  
  const dataFiles = ['projects.json', 'sections.json', 'spendings.json'];
  
  dataFiles.forEach(file => {
    const filePath = path.join(dataDir, file);
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, '[]');
      success(`Created ${file}`);
    }
  });
}

function createLogDirectory() {
  const logsDir = path.join(__dirname, 'server', 'logs');
  ensureDirectory(logsDir);
}

function main() {
  header('🚀 HELALY CONSTRUCTION ERP - ENVIRONMENT SETUP');
  
  log('Setting up environment files and initial data...', 'blue');
  
  // Create environment files
  const serverEnvPath = path.join(__dirname, 'server', '.env');
  const clientEnvPath = path.join(__dirname, 'client', '.env');
  
  createEnvironmentFile(serverEnvPath, serverEnvContent, 'server/.env');
  createEnvironmentFile(clientEnvPath, clientEnvContent, 'client/.env');
  
  // Create data directories and files
  createLogDirectory();
  createDataFiles();
  createDefaultUsers();
  
  header('📋 SETUP COMPLETE');
  
  success('Environment setup completed successfully!');
  
  log('\n🚀 Next Steps:', 'cyan');
  log('1. Install dependencies:', 'yellow');
  log('   cd server && npm install', 'white');
  log('   cd ../client && npm install', 'white');
  
  log('\n2. Start the backend server:', 'yellow');
  log('   cd server && npm run dev', 'white');
  
  log('\n3. Start the frontend (in a new terminal):', 'yellow');
  log('   cd client && npm start', 'white');
  
  log('\n4. Run API tests (optional):', 'yellow');
  log('   node test-api-comprehensive.js', 'white');
  
  log('\n🔐 Default Login Credentials:', 'magenta');
  log('   Egypt Branch: admin / admin123', 'white');
  log('   Libya Branch: admin / admin123', 'white');
  
  log('\n📁 Files Created:', 'blue');
  if (fs.existsSync(serverEnvPath)) log('   ✅ server/.env', 'green');
  if (fs.existsSync(clientEnvPath)) log('   ✅ client/.env', 'green');
  log('   ✅ server/data/ directory with JSON files', 'green');
  log('   ✅ server/logs/ directory', 'green');
  
  log('\n🎯 System Features:', 'yellow');
  log('   • Branch-specific data isolation (Egypt/Libya)', 'white');
  log('   • JWT-based authentication', 'white');
  log('   • JSON file storage (MongoDB ready)', 'white');
  log('   • Role-based access control', 'white');
  log('   • Real-time API connection', 'white');
  
  log('\n📝 Important Notes:', 'red');
  log('   • Keep your JWT_SECRET secure in production', 'white');
  log('   • Change default passwords in production', 'white');
  log('   • Consider using MongoDB for production', 'white');
  log('   • Set up proper backup for JSON data files', 'white');
}

if (require.main === module) {
  main();
}
