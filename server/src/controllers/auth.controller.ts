import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import Joi from 'joi';
import jsonStorage from '../storage/jsonStorage';

// Validation schemas
const loginSchema = Joi.object({
  username: Joi.string().min(3).required(),
  password: Joi.string().min(6).required(),
  country: Joi.string().valid('egypt', 'libya').required()
});

const registerSchema = Joi.object({
  name: Joi.string().min(2).required(),
  username: Joi.string().min(3).required(),
  password: Joi.string().min(6).required(),
  role: Joi.string().valid('admin', 'manager', 'user').default('user'),
  country: Joi.string().valid('egypt', 'libya').required()
});

/**
 * Login user and return token
 * @route POST /api/auth/login
 * @access Public
 */
export const login = async (req: Request, res: Response) => {
  try {
    // Validate input
    const { error, value } = loginSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ 
        success: false, 
        message: error.details[0].message 
      });
    }

    const { username, password, country } = value;

    // Find user by username and country
    const users = await jsonStorage.getUsers();
    console.log(`🔍 Looking for user: username="${username}", country="${country}"`);
    console.log(`📋 Available users: ${users.map(u => `${u.username}@${u.country}`).join(', ')}`);
    
    const user = users.find(u => 
      u.username === username && 
      u.country === country
    );

    if (!user) {
      console.log(`❌ User not found: username="${username}", country="${country}"`);
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid credentials or country selection' 
      });
    }
    
    console.log(`✅ User found: ${user.name} (${user.country})`);

    // Verify password
    console.log(`🔐 Verifying password for user: ${user.username}`);
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      console.log(`❌ Invalid password for user: ${user.username}`);
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid credentials' 
      });
    }
    
    console.log(`✅ Password verified for user: ${user.username}`);

    // Generate token with country
    const token = jwt.sign(
      { 
        id: user._id, 
        username: user.username,
        role: user.role, 
        country: user.country 
      },
      process.env.JWT_SECRET || 'helaly_construction_secret_key_2024',
      { expiresIn: '24h' }
    );

    // Update user last login
    await jsonStorage.updateUser(user._id, {
      ...user,
      lastLogin: new Date().toISOString()
    });

    // Send response
    console.log(`🎉 Login successful for user: ${user.username}@${user.country}`);
    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        username: user.username,
        role: user.role,
        country: user.country
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error during login' 
    });
  }
};

/**
 * Register a new user
 * @route POST /api/auth/register
 * @access Private (admin only)
 */
export const register = async (req: Request, res: Response) => {
  try {
    // Validate input
    const { error, value } = registerSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ 
        success: false, 
        message: error.details[0].message 
      });
    }

    const { name, username, password, role, country } = value;

    // Check if user exists
    const users = await jsonStorage.getUsers();
    const existingUser = users.find(u => 
      u.username === username && 
      u.country === country
    );

    if (existingUser) {
      return res.status(400).json({ 
        success: false, 
        message: 'User already exists in this country branch' 
      });
    }

    // Hash password
    const saltRounds = parseInt(process.env.BCRYPT_ROUNDS || '10');
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create new user
    const newUser = await jsonStorage.createUser({
      name,
      username,
      password: hashedPassword,
      role: role || 'user',
      country
    });

    // Generate token for immediate login
    const token = jwt.sign(
      { 
        id: newUser._id, 
        username: newUser.username,
        role: newUser.role, 
        country: newUser.country 
      },
      process.env.JWT_SECRET || 'helaly_construction_secret_key_2024',
      { expiresIn: '24h' }
    );

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      user: {
        id: newUser._id,
        name: newUser.name,
        username: newUser.username,
        role: newUser.role,
        country: newUser.country
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error during registration' 
    });
  }
};

/**
 * Get current user profile
 * @route GET /api/auth/me
 * @access Private
 */
export const getMe = async (req: Request, res: Response) => {
  try {
    // Ensure user exists in request (set by authenticate middleware)
    if (!req.user || !req.user.id) {
      return res.status(401).json({ 
        success: false, 
        message: 'Authentication required' 
      });
    }
    
    const users = await jsonStorage.getUsers();
    const user = users.find(u => u._id === req.user!.id);
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    // Return user data without password
    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        username: user.username,
        role: user.role,
        country: user.country,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }
    });
  } catch (error) {
    console.error('Get user profile error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
};

/**
 * Change user password
 * @route POST /api/auth/change-password
 * @access Private
 */
export const changePassword = async (req: Request, res: Response) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Current password and new password are required'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters long'
      });
    }

    const users = await jsonStorage.getUsers();
    const user = users.find(u => u._id === req.user!.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Verify current password
    const isValidPassword = await bcrypt.compare(currentPassword, user.password);
    if (!isValidPassword) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Hash new password
    const saltRounds = parseInt(process.env.BCRYPT_ROUNDS || '10');
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    // Update user password
    await jsonStorage.updateUser(user._id, {
      ...user,
      password: hashedPassword,
      updatedAt: new Date().toISOString()
    });

    res.json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during password change'
    });
  }
}; 