import express from 'express';
import {
  getEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  getEmployeeStats,
} from '../controllers/employee.controller';
import { authenticate as authenticateToken } from '../middlewares/auth.middleware';
import { validateCountry } from '../middlewares/country.middleware';

const router = express.Router();

// DEBUG ROUTE - Bypass auth to test router registration
router.get('/debug', (req, res) => {
  console.log('🐞 Debug route hit!');
  res.json({ message: 'Employee router is working!' });
});

// Apply authentication middleware to all routes
router.use(authenticateToken);

// Get employee statistics
router.get('/:country/stats', validateCountry, getEmployeeStats);

// Get all employees for a country
router.get('/:country', validateCountry, getEmployees);

// Get employee by ID
router.get('/:country/:id', validateCountry, getEmployeeById);

// Create new employee
router.post('/:country', validateCountry, createEmployee);

// Update employee
router.put('/:country/:id', validateCountry, updateEmployee);

// Delete employee (soft delete)
router.delete('/:country/:id', validateCountry, deleteEmployee);

export default router;
