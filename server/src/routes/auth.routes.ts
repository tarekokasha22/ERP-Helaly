import express from 'express';
import { login, register, getMe, changePassword } from '../controllers/auth.controller';
import { authenticate, isAdmin } from '../middlewares/auth.middleware';

const router = express.Router();

/**
 * @route POST /api/auth/login
 * @desc Authenticate user and get token
 * @access Public
 */
router.post('/login', login);

/**
 * @route POST /api/auth/register
 * @desc Register a new user
 * @access Private (admin only)
 */
router.post('/register', authenticate, isAdmin, register);

/**
 * @route GET /api/auth/me
 * @desc Get current user profile
 * @access Private
 */
router.get('/me', authenticate, getMe);

/**
 * @route POST /api/auth/change-password
 * @desc Change user password
 * @access Private
 */
router.post('/change-password', authenticate, changePassword);

export default router; 