import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { authenticate, isAdmin } from '../auth.middleware';
import { config } from '../../config/config';

// Mock Express objects
const mockRequest = () => {
  const req: Partial<Request> = {
    header: jest.fn(),
    user: undefined
  };
  return req as Request;
};

const mockResponse = () => {
  const res: Partial<Response> = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis()
  };
  return res as Response;
};

const mockNext: NextFunction = jest.fn();

// Mock jwt module
jest.mock('jsonwebtoken');

describe('Auth Middleware', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('authenticate middleware', () => {
    test('should return 401 if no authorization header', () => {
      const req = mockRequest();
      const res = mockResponse();
      req.header = jest.fn().mockReturnValue(undefined);

      authenticate(req, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ message: 'No authorization header, authentication required' });
      expect(mockNext).not.toHaveBeenCalled();
    });

    test('should return 401 if token format is invalid', () => {
      const req = mockRequest();
      const res = mockResponse();
      req.header = jest.fn().mockReturnValue('InvalidFormat token123');

      authenticate(req, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ message: 'Invalid token format, Bearer scheme required' });
      expect(mockNext).not.toHaveBeenCalled();
    });

    test('should return 401 if no token provided', () => {
      const req = mockRequest();
      const res = mockResponse();
      req.header = jest.fn().mockReturnValue('Bearer ');

      authenticate(req, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ message: 'No token, authorization denied' });
      expect(mockNext).not.toHaveBeenCalled();
    });

    test('should return 401 if token is expired', () => {
      const req = mockRequest();
      const res = mockResponse();
      req.header = jest.fn().mockReturnValue('Bearer valid.token.here');

      const tokenExpiredError = new jwt.TokenExpiredError('jwt expired', new Date());
      (jwt.verify as jest.Mock).mockImplementation(() => {
        throw tokenExpiredError;
      });

      authenticate(req, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ message: 'Token has expired' });
      expect(mockNext).not.toHaveBeenCalled();
    });

    test('should return 401 if token is invalid', () => {
      const req = mockRequest();
      const res = mockResponse();
      req.header = jest.fn().mockReturnValue('Bearer invalid.token.here');

      const jwtError = new jwt.JsonWebTokenError('invalid token');
      (jwt.verify as jest.Mock).mockImplementation(() => {
        throw jwtError;
      });

      authenticate(req, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ message: 'Invalid token' });
      expect(mockNext).not.toHaveBeenCalled();
    });

    test('should set req.user and call next() if token is valid', () => {
      const req = mockRequest();
      const res = mockResponse();
      req.header = jest.fn().mockReturnValue('Bearer valid.token.here');

      const mockUser = { id: '123', role: 'user', country: 'egypt' };
      (jwt.verify as jest.Mock).mockReturnValue(mockUser);

      authenticate(req, res, mockNext);

      expect(req.user).toEqual(mockUser);
      expect(mockNext).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });
  });

  describe('isAdmin middleware', () => {
    test('should return 401 if user is not authenticated', () => {
      const req = mockRequest();
      const res = mockResponse();

      isAdmin(req, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ message: 'Authentication required' });
      expect(mockNext).not.toHaveBeenCalled();
    });

    test('should return 403 if user is not an admin', () => {
      const req = mockRequest();
      const res = mockResponse();
      req.user = { id: '123', role: 'user', country: 'egypt' };

      isAdmin(req, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ message: 'Access denied, admin privileges required' });
      expect(mockNext).not.toHaveBeenCalled();
    });

    test('should call next() if user is an admin', () => {
      const req = mockRequest();
      const res = mockResponse();
      req.user = { id: '123', role: 'admin', country: 'egypt' };

      isAdmin(req, res, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });
  });
}); 