import express from 'express';
import {
  getPayments,
  getPaymentById,
  createPayment,
  updatePayment,
  deletePayment,
  getPaymentStats,
  getEmployeePayments,
} from '../controllers/payment.controller';
import { authenticate as authenticateToken } from '../middlewares/auth.middleware';
import { validateCountry } from '../middlewares/country.middleware';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticateToken);

// Get payment statistics
router.get('/:country/stats', validateCountry, getPaymentStats);

// Get all payments for a country
router.get('/:country', validateCountry, getPayments);

// Get payment by ID
router.get('/:country/:id', validateCountry, getPaymentById);

// Create new payment
router.post('/:country', validateCountry, createPayment);

// Update payment
router.put('/:country/:id', validateCountry, updatePayment);

// Delete payment
router.delete('/:country/:id', validateCountry, deletePayment);

// Get employee payment history
router.get('/:country/employee/:employeeId', validateCountry, getEmployeePayments);

export default router;
