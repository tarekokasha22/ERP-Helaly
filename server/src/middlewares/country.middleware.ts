import { Request, Response, NextFunction } from 'express';

// Extend Express Request type to include country property
declare global {
  namespace Express {
    interface Request {
      userCountry?: 'egypt' | 'libya';
    }
  }
}

export interface CountryRequest extends Request {
  userCountry?: 'egypt' | 'libya';
}

/**
 * Main country middleware that enforces strict branch isolation
 * Must be used after authentication middleware
 */
export const countryMiddleware = (req: CountryRequest, res: Response, next: NextFunction) => {
  try {
    // Get country from JWT token (set by auth middleware)
    const userCountry = req.user?.country;

    if (!userCountry) {
      return res.status(400).json({
        success: false,
        message: 'Country not specified in user token'
      });
    }

    // Validate country value - CRITICAL FOR SECURITY
    if (userCountry !== 'egypt' && userCountry !== 'libya') {
      return res.status(400).json({
        success: false,
        message: 'Invalid country. Must be egypt or libya'
      });
    }

    // Attach country to request for controllers
    req.userCountry = userCountry;

    // Auto-filter GET requests by country - ENFORCE BRANCH ISOLATION
    if (req.method === 'GET') {
      req.query = { ...req.query, country: userCountry };
    }

    // Auto-add country to POST/PUT requests - PREVENT CROSS-BRANCH DATA
    if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
      if (req.body && typeof req.body === 'object') {
        req.body = { ...req.body, country: userCountry };
      }
    }

    next();
  } catch (error: any) {
    console.error('Country middleware error:', error);
    res.status(500).json({
      success: false,
      message: 'Country middleware error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Legacy middleware for backward compatibility
 */
export const setUserCountry = countryMiddleware;

/**
 * Middleware to validate country parameter from URL
 * Used by routes like /api/employees/:country
 */
export const validateCountry = (req: Request, res: Response, next: NextFunction) => {
  try {
    const { country } = req.params;

    // Validate country parameter
    if (!country) {
      console.error('❌ Country parameter missing in URL');
      return res.status(400).json({
        success: false,
        message: 'Country parameter is required'
      });
    }

    // Log for debugging
    console.log(`🌍 Validating country: ${country}`);

    // Check valid country values
    if (country !== 'egypt' && country !== 'libya') {
      console.error(`❌ Invalid country: ${country}`);
      return res.status(400).json({
        success: false,
        message: 'Invalid country. Must be egypt or libya'
      });
    }

    // Set country on request for controllers
    (req as CountryRequest).userCountry = country as 'egypt' | 'libya';

    next();
  } catch (error: any) {
    console.error('Country validation error:', error);
    res.status(500).json({
      success: false,
      message: 'Country validation error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Validate country access for specific operations
 */
export const validateCountryAccess = (req: CountryRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.userCountry) {
      return res.status(403).json({
        success: false,
        message: 'Country access validation failed'
      });
    }
    next();
  } catch (error) {
    console.error('Country validation error:', error);
    res.status(500).json({
      success: false,
      message: 'Country validation error'
    });
  }
};

/**
 * Helper function to add country filter to queries
 * CRITICAL: Always use this for database queries
 */
export const addCountryFilter = (userCountry: 'egypt' | 'libya', additionalFilters: any = {}) => {
  if (!userCountry) {
    throw new Error('User country is required for data filtering');
  }

  return {
    ...additionalFilters,
    country: userCountry,
  };
};

/**
 * Helper function to validate document belongs to user's country
 * CRITICAL: Always validate before returning data
 */
export const validateDocumentCountry = (document: any, userCountry: 'egypt' | 'libya'): boolean => {
  if (!document || !userCountry) {
    return false;
  }
  return document.country === userCountry;
};

/**
 * Filter array of documents by country
 * CRITICAL: Use this for all data responses
 */
export const filterByCountry = <T extends { country: string }>(
  documents: T[],
  userCountry: 'egypt' | 'libya'
): T[] => {
  if (!userCountry) {
    return [];
  }
  return documents.filter(doc => doc.country === userCountry);
};

/**
 * Ensure data has country field before saving
 * CRITICAL: Use this before any create/update operations
 */
export const ensureCountryField = (data: any, userCountry: 'egypt' | 'libya') => {
  if (!userCountry) {
    throw new Error('User country is required');
  }

  return {
    ...data,
    country: userCountry
  };
}; 