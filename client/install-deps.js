// Script to install dependencies
const { execSync } = require('child_process');

console.log('Installing dependencies...');
try {
  // Using npm binary from node_modules
  execSync('npx.cmd npm install', { stdio: 'inherit' });
  console.log('Dependencies installed successfully!');
} catch (error) {
  console.error('Error installing dependencies:', error);
} 