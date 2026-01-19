import express from 'express';
import { authenticate, isAdmin } from '../middlewares/auth.middleware';

const router = express.Router();

/**
 * @route GET /api/users
 * @desc Get all users
 * @access Private (admin only)
 */
router.get('/', authenticate, isAdmin, (req, res) => {
  // In a real app, this would fetch users from database
  res.status(200).json([
    {
      id: '1',
      name: 'Admin User',
      email: 'admin@helaly.com',
      role: 'admin',
      position: 'System Administrator',
      active: true
    },
    {
      id: '2',
      name: 'Worker User',
      email: 'worker@helaly.com',
      role: 'worker',
      position: 'Staff Member',
      active: true
    }
  ]);
});

/**
 * @route GET /api/users/:id
 * @desc Get user by ID
 * @access Private (admin only)
 */
router.get('/:id', authenticate, isAdmin, (req, res) => {
  // In a real app, this would fetch a user from database
  const users = [
    {
      id: '1',
      name: 'Admin User',
      email: 'admin@helaly.com',
      role: 'admin',
      position: 'System Administrator',
      active: true
    },
    {
      id: '2',
      name: 'Worker User',
      email: 'worker@helaly.com',
      role: 'worker',
      position: 'Staff Member',
      active: true
    }
  ];
  
  const user = users.find(u => u.id === req.params.id);
  
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }
  
  res.status(200).json(user);
});

/**
 * @route POST /api/users
 * @desc Create a new user
 * @access Private (admin only)
 */
router.post('/', authenticate, isAdmin, (req, res) => {
  // In a real app, this would create a user in database
  res.status(201).json({ message: 'User created successfully' });
});

/**
 * @route PUT /api/users/:id
 * @desc Update a user
 * @access Private (admin only)
 */
router.put('/:id', authenticate, isAdmin, (req, res) => {
  // In a real app, this would update a user in database
  res.status(200).json({ message: 'User updated successfully' });
});

/**
 * @route DELETE /api/users/:id
 * @desc Delete a user
 * @access Private (admin only)
 */
router.delete('/:id', authenticate, isAdmin, (req, res) => {
  // In a real app, this would delete a user from database
  res.status(200).json({ message: 'User deleted successfully' });
});

export default router; 