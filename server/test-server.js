/**
 * Simple test server to manually test the auth middleware
 * Run with: node test-server.js
 */

const express = require('express');
const app = express();
const PORT = 3000;

// Mock JWT verification
const jwt = require('jsonwebtoken');
const JWT_SECRET = 'test-secret';

// Create auth middleware
const authenticate = (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.header('Authorization');
    
    if (!authHeader) {
      return res.status(401).json({ message: 'No authorization header, authentication required' });
    }
    
    // Check if it's a Bearer token
    if (!authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Invalid token format, Bearer scheme required' });
    }
    
    const token = authHeader.split(' ')[1];
    
    // Check if token exists
    if (!token) {
      return res.status(401).json({ message: 'No token, authorization denied' });
    }
    
    // Verify token
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      
      // Add user from payload to request
      req.user = decoded;
      
      next();
    } catch (jwtError) {
      console.error('JWT verification error:', jwtError.name);
      if (jwtError.name === 'TokenExpiredError') {
        return res.status(401).json({ message: 'Token has expired' });
      } else if (jwtError.name === 'JsonWebTokenError') {
        return res.status(401).json({ message: 'Invalid token' });
      } else {
        return res.status(401).json({ message: 'Token verification failed' });
      }
    }
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(500).json({ message: 'Internal server error during authentication' });
  }
};

const isAdmin = (req, res, next) => {
  try {
    // Ensure authentication middleware was run first
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied, admin privileges required' });
    }
    
    next();
  } catch (error) {
    console.error('Admin check error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Middleware
app.use(express.json());

// Routes
app.get('/', (req, res) => {
  res.send(`
    <h1>Auth Middleware Test Server</h1>
    <p>Use the following endpoints to test the auth middleware:</p>
    <ul>
      <li><code>GET /api/public</code> - Public route (no auth required)</li>
      <li><code>GET /api/protected</code> - Protected route (auth required)</li>
      <li><code>GET /api/admin</code> - Admin route (admin auth required)</li>
      <li><code>POST /api/token</code> - Generate test tokens</li>
    </ul>
    <h2>Generate Test Tokens</h2>
    <form id="tokenForm">
      <label>
        User Role:
        <select id="role">
          <option value="user">Regular User</option>
          <option value="admin">Admin User</option>
        </select>
      </label>
      <button type="submit">Generate Token</button>
    </form>
    <div id="result" style="margin-top: 20px;"></div>
    <script>
      document.getElementById('tokenForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const role = document.getElementById('role').value;
        const response = await fetch('/api/token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ role })
        });
        const data = await response.json();
        const resultDiv = document.getElementById('result');
        resultDiv.innerHTML = \`
          <h3>Generated Token:</h3>
          <pre>\${data.token}</pre>
          <h3>Test Commands:</h3>
          <p>Test protected route:</p>
          <pre>curl -H "Authorization: Bearer \${data.token}" http://localhost:3000/api/protected</pre>
          <p>Test admin route:</p>
          <pre>curl -H "Authorization: Bearer \${data.token}" http://localhost:3000/api/admin</pre>
        \`;
      });
    </script>
  `);
});

// Public route
app.get('/api/public', (req, res) => {
  res.json({ message: 'This is a public route - no authentication required' });
});

// Protected route
app.get('/api/protected', authenticate, (req, res) => {
  res.json({ 
    message: 'You accessed a protected route!', 
    user: req.user 
  });
});

// Admin route
app.get('/api/admin', authenticate, isAdmin, (req, res) => {
  res.json({ 
    message: 'You accessed an admin route!', 
    user: req.user 
  });
});

// Generate token
app.post('/api/token', (req, res) => {
  const { role = 'user' } = req.body;
  const user = {
    id: role === 'admin' ? 'admin-123' : 'user-456',
    role: role
  };
  
  const token = jwt.sign(user, JWT_SECRET, { expiresIn: '1h' });
  
  res.json({ token });
});

// Start server
app.listen(PORT, () => {
  console.log(`Test server running at http://localhost:${PORT}`);
  console.log('Use the web interface or the following curl commands to test:');
  console.log('\nPublic route:');
  console.log('curl http://localhost:3000/api/public');
  console.log('\nProtected route (will fail without token):');
  console.log('curl http://localhost:3000/api/protected');
  console.log('\nAdmin route (will fail without admin token):');
  console.log('curl http://localhost:3000/api/admin');
}); 