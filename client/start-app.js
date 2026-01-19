const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

// First, make sure our mock modules are set up
require('./update-deps');

console.log('Starting Helaly ERP application...');

// Find the react-scripts start.js file
const reactScriptsPath = path.join(__dirname, 'node_modules', 'react-scripts');
const startScriptPath = path.join(reactScriptsPath, 'scripts', 'start.js');

if (fs.existsSync(startScriptPath)) {
  console.log('Found react-scripts start.js, launching application...');
  // Execute the start script directly
  require(startScriptPath);
} else {
  console.log('React scripts start.js not found, using alternative method...');
  
  // Create a simple HTTP server to serve the app
  const http = require('http');
  
  const publicDir = path.join(__dirname, 'public');
  const port = 3000;
  
  // Create a simple HTML file if it doesn't exist
  const indexHtmlPath = path.join(publicDir, 'index.html');
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }
  
  if (!fs.existsSync(indexHtmlPath)) {
    const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <title>Helaly ERP</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 0; }
        .container { max-width: 800px; margin: 0 auto; padding: 20px; }
        .header { background-color: #f97316; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; }
        .card { background: white; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); padding: 20px; margin-bottom: 20px; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>Helaly ERP System</h1>
      </div>
      <div class="container">
        <div class="content">
          <div class="card">
            <h2>Welcome to Helaly ERP</h2>
            <p>The application is now running in mock mode. You can log in with the following credentials:</p>
            <ul>
              <li><strong>Admin:</strong> admin@helaly.com / admin123</li>
              <li><strong>Worker:</strong> worker@helaly.com / worker123</li>
            </ul>
          </div>
        </div>
      </div>
    </body>
    </html>
    `;
    
    fs.writeFileSync(indexHtmlPath, htmlContent);
  }
  
  // Create and start the server
  const server = http.createServer((request, response) => {
    // Simple static file server
    let filePath = path.join(publicDir, request.url === '/' ? 'index.html' : request.url);
    
    // Check if file exists
    fs.access(filePath, fs.constants.F_OK, (err) => {
      if (err) {
        // File not found, serve index.html for SPA routing
        filePath = path.join(publicDir, 'index.html');
      }
      
      // Determine content type
      const extname = path.extname(filePath);
      let contentType = 'text/html';
      
      switch (extname) {
        case '.js':
          contentType = 'text/javascript';
          break;
        case '.css':
          contentType = 'text/css';
          break;
        case '.json':
          contentType = 'application/json';
          break;
        case '.png':
          contentType = 'image/png';
          break;
        case '.jpg':
        case '.jpeg':
          contentType = 'image/jpeg';
          break;
      }
      
      // Read and serve the file
      fs.readFile(filePath, (err, content) => {
        if (err) {
          response.writeHead(500);
          response.end(`Server Error: ${err.code}`);
        } else {
          response.writeHead(200, { 'Content-Type': contentType });
          response.end(content, 'utf-8');
        }
      });
    });
  });
  
  server.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
    console.log('Use the following credentials to log in:');
    console.log('Admin: admin@helaly.com / admin123');
    console.log('Worker: worker@helaly.com / worker123');
  });
} 