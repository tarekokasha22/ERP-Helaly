/**
 * Manual test runner for auth middleware
 * This file can be run directly with Node.js to test the auth middleware
 */

// Import the auth middleware
const authMiddleware = require('../auth.middleware');

// Mock jwt module
const jwt = {
  verify: jest.fn(),
  TokenExpiredError: class TokenExpiredError extends Error {
    constructor(message, expiredAt) {
      super(message);
      this.name = 'TokenExpiredError';
      this.expiredAt = expiredAt;
    }
  },
  JsonWebTokenError: class JsonWebTokenError extends Error {
    constructor(message) {
      super(message);
      this.name = 'JsonWebTokenError';
    }
  }
};

// Mock config
const config = {
  jwt: {
    secret: 'test-secret'
  }
};

// Create mock objects
function createMockRequest(headerValue) {
  return {
    header: jest.fn().mockReturnValue(headerValue),
    user: undefined
  };
}

function createMockResponse() {
  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis()
  };
  return res;
}

function createMockNext() {
  return jest.fn();
}

// Test functions
function testNoAuthHeader() {
  console.log('\n--- Test: No Auth Header ---');
  const req = createMockRequest(undefined);
  const res = createMockResponse();
  const next = createMockNext();
  
  authMiddleware.authenticate(req, res, next);
  
  console.log('Status code:', res.status.mock.calls[0][0]);
  console.log('Response:', res.json.mock.calls[0][0]);
  console.log('Next called:', next.mock.calls.length > 0);
}

function testInvalidTokenFormat() {
  console.log('\n--- Test: Invalid Token Format ---');
  const req = createMockRequest('InvalidFormat token123');
  const res = createMockResponse();
  const next = createMockNext();
  
  authMiddleware.authenticate(req, res, next);
  
  console.log('Status code:', res.status.mock.calls[0][0]);
  console.log('Response:', res.json.mock.calls[0][0]);
  console.log('Next called:', next.mock.calls.length > 0);
}

function testNoToken() {
  console.log('\n--- Test: No Token ---');
  const req = createMockRequest('Bearer ');
  const res = createMockResponse();
  const next = createMockNext();
  
  authMiddleware.authenticate(req, res, next);
  
  console.log('Status code:', res.status.mock.calls[0][0]);
  console.log('Response:', res.json.mock.calls[0][0]);
  console.log('Next called:', next.mock.calls.length > 0);
}

function testExpiredToken() {
  console.log('\n--- Test: Expired Token ---');
  const req = createMockRequest('Bearer valid.token.here');
  const res = createMockResponse();
  const next = createMockNext();
  
  jwt.verify.mockImplementation(() => {
    throw new jwt.TokenExpiredError('jwt expired', new Date());
  });
  
  authMiddleware.authenticate(req, res, next);
  
  console.log('Status code:', res.status.mock.calls[0][0]);
  console.log('Response:', res.json.mock.calls[0][0]);
  console.log('Next called:', next.mock.calls.length > 0);
}

function testInvalidToken() {
  console.log('\n--- Test: Invalid Token ---');
  const req = createMockRequest('Bearer invalid.token.here');
  const res = createMockResponse();
  const next = createMockNext();
  
  jwt.verify.mockImplementation(() => {
    throw new jwt.JsonWebTokenError('invalid token');
  });
  
  authMiddleware.authenticate(req, res, next);
  
  console.log('Status code:', res.status.mock.calls[0][0]);
  console.log('Response:', res.json.mock.calls[0][0]);
  console.log('Next called:', next.mock.calls.length > 0);
}

function testValidToken() {
  console.log('\n--- Test: Valid Token ---');
  const req = createMockRequest('Bearer valid.token.here');
  const res = createMockResponse();
  const next = createMockNext();
  
  const mockUser = { id: '123', role: 'user' };
  jwt.verify.mockReturnValue(mockUser);
  
  authMiddleware.authenticate(req, res, next);
  
  console.log('req.user:', req.user);
  console.log('Next called:', next.mock.calls.length > 0);
}

function testIsAdminNotAuthenticated() {
  console.log('\n--- Test: isAdmin - Not Authenticated ---');
  const req = { user: undefined };
  const res = createMockResponse();
  const next = createMockNext();
  
  authMiddleware.isAdmin(req, res, next);
  
  console.log('Status code:', res.status.mock.calls[0][0]);
  console.log('Response:', res.json.mock.calls[0][0]);
  console.log('Next called:', next.mock.calls.length > 0);
}

function testIsAdminNotAdmin() {
  console.log('\n--- Test: isAdmin - Not Admin ---');
  const req = { user: { id: '123', role: 'user' } };
  const res = createMockResponse();
  const next = createMockNext();
  
  authMiddleware.isAdmin(req, res, next);
  
  console.log('Status code:', res.status.mock.calls[0][0]);
  console.log('Response:', res.json.mock.calls[0][0]);
  console.log('Next called:', next.mock.calls.length > 0);
}

function testIsAdminSuccess() {
  console.log('\n--- Test: isAdmin - Success ---');
  const req = { user: { id: '123', role: 'admin' } };
  const res = createMockResponse();
  const next = createMockNext();
  
  authMiddleware.isAdmin(req, res, next);
  
  console.log('Next called:', next.mock.calls.length > 0);
}

// Run tests
console.log('=== Auth Middleware Manual Tests ===');
testNoAuthHeader();
testInvalidTokenFormat();
testNoToken();
testExpiredToken();
testInvalidToken();
testValidToken();
testIsAdminNotAuthenticated();
testIsAdminNotAdmin();
testIsAdminSuccess(); 