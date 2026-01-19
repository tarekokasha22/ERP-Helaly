import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

interface JwtPayload {
  id: string;
  username?: string;
  role: string;
  country: 'egypt' | 'libya';
  iat?: number;
  exp?: number;
}

// Extend Express Request type to include user property
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

/**
 * Middleware to authenticate JWT token
 * @param req Request object
 * @param res Response object
 * @param next Next function
 */
export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  try {
    // Get token from header
    const authHeader = req.header('Authorization');
    
    if (!authHeader) {
      return res.status(401).json({ 
        success: false, 
        message: 'No authorization header, authentication required' 
      });
    }
    
    // Check if it's a Bearer token
    if (!authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid token format, Bearer scheme required' 
      });
    }
    
    const token = authHeader.split(' ')[1];
    
    // Check if token exists
    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: 'No token, authorization denied' 
      });
    }
    
    // Verify token
    const secret = process.env.JWT_SECRET || 'helaly_construction_secret_key_2024';
    
    try {
      const decoded = jwt.verify(token, secret) as JwtPayload;
      
      // Validate required fields
      if (!decoded.id || !decoded.role || !decoded.country) {
        return res.status(401).json({ 
          success: false, 
          message: 'Invalid token payload' 
        });
      }
      
      // Validate country
      if (decoded.country !== 'egypt' && decoded.country !== 'libya') {
        return res.status(401).json({ 
          success: false, 
          message: 'Invalid country in token' 
        });
      }
      
      // Add user from payload to request
      req.user = decoded;
      
      next();
    } catch (jwtError: any) {
      console.error('JWT verification error:', jwtError);
      
      if (jwtError.name === 'TokenExpiredError') {
        return res.status(401).json({ 
          success: false, 
          message: 'Token has expired' 
        });
      } else if (jwtError.name === 'JsonWebTokenError') {
        return res.status(401).json({ 
          success: false, 
          message: 'Invalid token' 
        });
      } else if (jwtError.name === 'NotBeforeError') {
        return res.status(401).json({ 
          success: false, 
          message: 'Token not active yet' 
        });
      } else {
        return res.status(401).json({ 
          success: false, 
          message: 'Token verification failed' 
        });
      }
    }
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error during authentication' 
    });
  }
};

/**
 * Middleware to check if user is an admin
 * @param req Request object
 * @param res Response object
 * @param next Next function
 */
export const isAdmin = (req: Request, res: Response, next: NextFunction) => {
  try {
    // Ensure authentication middleware was run first
    if (!req.user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Authentication required' 
      });
    }
    
    if (req.user.role !== 'admin') {
      return res.status(403).json({ 
        success: false, 
        message: 'Access denied, admin privileges required' 
      });
    }
    
    next();
  } catch (error) {
    console.error('Admin check error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error in admin check' 
    });
  }
};

/**
 * Middleware to check if user is an admin or manager
 * @param req Request object
 * @param res Response object
 * @param next Next function
 */
export const isAdminOrManager = (req: Request, res: Response, next: NextFunction) => {
  try {
    // Ensure authentication middleware was run first
    if (!req.user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Authentication required' 
      });
    }
    
    if (req.user.role !== 'admin' && req.user.role !== 'manager') {
      return res.status(403).json({ 
        success: false, 
        message: 'Access denied, admin or manager privileges required' 
      });
    }
    
    next();
  } catch (error) {
    console.error('Admin/Manager check error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error in role check' 
    });
  }
}; 