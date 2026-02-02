import express, { Request, Response } from 'express';
import { authenticate, isAdmin } from '../middlewares/auth.middleware';
import jsonStorage from '../storage/jsonStorage';

const router = express.Router();

/**
 * @route GET /api/users
 * @desc Get all users
 * @access Private
 */
router.get('/', authenticate, async (req: Request, res: Response) => {
  try {
    const userCountry = (req.user as any)?.country || 'egypt';
    const allUsers = await jsonStorage.getUsers();

    // Filter users by country and format the response
    const users = allUsers
      .filter(u => u.country === userCountry)
      .map(u => ({
        id: u._id,
        name: u.name,
        username: u.username,
        email: u.email || '',
        role: u.role,
        position: u.role === 'admin' ? 'مدير النظام' : 'موظف',
        active: true,
        country: u.country,
        createdAt: u.createdAt
      }));

    res.status(200).json({
      success: true,
      data: users
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch users' });
  }
});

/**
 * @route GET /api/users/:id
 * @desc Get user by ID
 * @access Private
 */
router.get('/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const user = await jsonStorage.findUserById(req.params.id);

    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    res.status(200).json({
      success: true,
      data: {
        id: user._id,
        name: user.name,
        username: user.username,
        email: user.email || '',
        role: user.role,
        position: user.role === 'admin' ? 'مدير النظام' : 'موظف',
        active: true,
        country: user.country,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch user' });
  }
});

/**
 * @route POST /api/users
 * @desc Create a new user
 * @access Private (admin only)
 */
router.post('/', authenticate, isAdmin, async (req: Request, res: Response) => {
  try {
    const userCountry = (req.user as any)?.country || 'egypt';
    const { name, email, role, position, password } = req.body;

    if (!name || !email) {
      return res.status(400).json({ success: false, error: 'Name and email are required' });
    }

    // Check if user exists
    const existingUser = await jsonStorage.findUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({ success: false, error: 'User with this email already exists' });
    }

    const newUser = {
      _id: `user_${Date.now()}`,
      name,
      username: email.split('@')[0],
      email,
      password: password || '123456', // Default password
      role: role || 'user',
      country: userCountry,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await jsonStorage.addUser(newUser);

    res.status(201).json({
      success: true,
      data: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        position: position || 'موظف',
        active: true,
        createdAt: newUser.createdAt
      },
      message: 'User created successfully'
    });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ success: false, error: 'Failed to create user' });
  }
});

/**
 * @route PUT /api/users/:id
 * @desc Update a user
 * @access Private (admin only)
 */
router.put('/:id', authenticate, isAdmin, async (req: Request, res: Response) => {
  try {
    const userId = req.params.id;
    const updates = req.body;

    const user = await jsonStorage.findUserById(userId);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    const updatedUser = await jsonStorage.updateUser(userId, {
      ...updates,
      updatedAt: new Date().toISOString()
    });

    res.status(200).json({
      success: true,
      data: updatedUser,
      message: 'User updated successfully'
    });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ success: false, error: 'Failed to update user' });
  }
});

/**
 * @route DELETE /api/users/:id
 * @desc Delete a user
 * @access Private (admin only)
 */
router.delete('/:id', authenticate, isAdmin, async (req: Request, res: Response) => {
  try {
    const userId = req.params.id;

    const user = await jsonStorage.findUserById(userId);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    await jsonStorage.deleteUser(userId);

    res.status(200).json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ success: false, error: 'Failed to delete user' });
  }
});

export default router;