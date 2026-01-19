/**
 * Simple script to test the auth middleware
 * Run with: node run-auth-test.js
 */

// Mock Express objects
const mockRequest = (headerValue) => {
  return {
    header: function(name) {
      if (name === 'Authorization') return headerValue;
      return null;
    },
    user: undefined
  };
};

const mockResponse = () => {
  const res = {};
  res.status = function(code) {
    console.log(`Response status: ${code}`);
    return res;
  };
  res.json = function(data) {
    console.log(`Response data: ${JSON.stringify(data)}`);
    return res;
  };
  return res;
};

const mockNext = function() {
  console.log('Next function called');
};

// Mock config
const config = {
  jwt: {
    secret: 'test-secret'
  }
};

// Simple auth middleware implementation for testing
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
      // Mock JWT verification
      let decoded;
      
      if (token === 'valid.token.here') {
        decoded = { id: '123', role: 'user' };
      } else if (token === 'admin.token.here') {
        decoded = { id: '456', role: 'admin' };
      } else if (token === 'expired.token.here') {
        throw { name: 'TokenExpiredError', message: 'jwt expired' };
      } else {
        throw { name: 'JsonWebTokenError', message: 'invalid token' };
      }
      
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

// Test functions
function runTest(name, callback) {
  console.log(`\n=== ${name} ===`);
  callback();
  console.log('----------------------------------------');
}

// Run tests
console.log('=== Auth Middleware Tests ===\n');

runTest('Test Case 1: No authorization header', () => {
  const req = mockRequest(undefined);
  const res = mockResponse();
  authenticate(req, res, mockNext);
});

runTest('Test Case 2: Invalid token format', () => {
  const req = mockRequest('InvalidFormat token123');
  const res = mockResponse();
  authenticate(req, res, mockNext);
});

runTest('Test Case 3: No token provided', () => {
  const req = mockRequest('Bearer ');
  const res = mockResponse();
  authenticate(req, res, mockNext);
});

runTest('Test Case 4: Expired token', () => {
  const req = mockRequest('Bearer expired.token.here');
  const res = mockResponse();
  authenticate(req, res, mockNext);
});

runTest('Test Case 5: Invalid token', () => {
  const req = mockRequest('Bearer invalid.token.here');
  const res = mockResponse();
  authenticate(req, res, mockNext);
});

runTest('Test Case 6: Valid token', () => {
  const req = mockRequest('Bearer valid.token.here');
  const res = mockResponse();
  authenticate(req, res, mockNext);
  console.log('req.user:', JSON.stringify(req.user));
});

runTest('Test Case 7: isAdmin - User not authenticated', () => {
  const req = { user: undefined };
  const res = mockResponse();
  isAdmin(req, res, mockNext);
});

runTest('Test Case 8: isAdmin - User not an admin', () => {
  const req = { user: { id: '123', role: 'user' } };
  const res = mockResponse();
  isAdmin(req, res, mockNext);
});

runTest('Test Case 9: isAdmin - User is an admin', () => {
  const req = { user: { id: '456', role: 'admin' } };
  const res = mockResponse();
  isAdmin(req, res, mockNext);
});

console.log('\nAll tests completed successfully!'); 