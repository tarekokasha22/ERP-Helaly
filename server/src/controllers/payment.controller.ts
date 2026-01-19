import { Request, Response } from 'express';
import Payment from '../models/payment.model';
import Employee from '../models/employee.model';
import { IPayment } from '../models/payment.model';

// Get all payments for a specific country
export const getPayments = async (req: Request, res: Response) => {
  try {
    const { country } = req.params;
    const { 
      employeeId, 
      paymentType, 
      currency, 
      startDate, 
      endDate,
      page = 1, 
      limit = 10 
    } = req.query;

    const filter: any = { country };
    
    if (employeeId) {
      filter.employeeId = employeeId;
    }
    
    if (paymentType) {
      filter.paymentType = paymentType;
    }
    
    if (currency) {
      filter.currency = currency;
    }
    
    if (startDate || endDate) {
      filter.paymentDate = {};
      if (startDate) {
        filter.paymentDate.$gte = new Date(startDate as string);
      }
      if (endDate) {
        filter.paymentDate.$lte = new Date(endDate as string);
      }
    }

    const skip = (Number(page) - 1) * Number(limit);

    const payments = await Payment.find(filter)
      .populate('employeeId', 'name employeeType position')
      .populate('projectId', 'name')
      .populate('sectionId', 'name')
      .populate('createdBy', 'name email')
      .sort({ paymentDate: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Payment.countDocuments(filter);

    res.json({
      success: true,
      data: payments,
      pagination: {
        current: Number(page),
        pages: Math.ceil(total / Number(limit)),
        total,
      },
    });
  } catch (error) {
    console.error('Error fetching payments:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching payments',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

// Get payment by ID
export const getPaymentById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const payment = await Payment.findById(id)
      .populate('employeeId', 'name employeeType position monthlySalary pieceworkRate')
      .populate('projectId', 'name')
      .populate('sectionId', 'name')
      .populate('createdBy', 'name email');

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found',
      });
    }

    res.json({
      success: true,
      data: payment,
    });
  } catch (error) {
    console.error('Error fetching payment:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching payment',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

// Create new payment
export const createPayment = async (req: Request, res: Response) => {
  try {
    const paymentData: Partial<IPayment> = {
      ...req.body,
      createdBy: req.user?.id,
    };

    // Validate employee exists
    const employee = await Employee.findById(paymentData.employeeId);
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found',
      });
    }

    // For piecework payments, calculate amount if not provided
    if (paymentData.paymentType === 'piecework' && paymentData.workQuantity && employee.pieceworkRate) {
      paymentData.amount = paymentData.workQuantity * employee.pieceworkRate;
    }

    // Handle split payments - calculate total amount
    if (paymentData.currency === 'split') {
      if (!paymentData.amountEGP || !paymentData.amountUSD) {
        return res.status(400).json({
          success: false,
          message: 'Both EGP and USD amounts are required for split payments',
        });
      }
      // For split payments, we store the total conceptually
      // The actual amounts are stored in amountEGP and amountUSD
      paymentData.amount = paymentData.amountEGP + paymentData.amountUSD; // Total for reference
    } else {
      // For single currency payments, set amountEGP or amountUSD based on currency
      if (paymentData.currency === 'EGP') {
        paymentData.amountEGP = paymentData.amount;
        paymentData.amountUSD = 0;
      } else if (paymentData.currency === 'USD') {
        paymentData.amountEGP = 0;
        paymentData.amountUSD = paymentData.amount;
      }
    }

    const payment = new Payment(paymentData);
    await payment.save();

    // Update employee balance (this will be calculated dynamically in getEmployeeById)
    // No need to store it in employee model as it's calculated from payments

    const populatedPayment = await Payment.findById(payment._id)
      .populate('employeeId', 'name employeeType position monthlySalary pieceworkRate')
      .populate('projectId', 'name')
      .populate('sectionId', 'name')
      .populate('createdBy', 'name email');

    res.status(201).json({
      success: true,
      data: populatedPayment,
      message: 'Payment created successfully',
    });
  } catch (error) {
    console.error('Error creating payment:', error);
    res.status(400).json({
      success: false,
      message: 'Error creating payment',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

// Update payment
export const updatePayment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Handle split payments - calculate total amount
    if (updateData.currency === 'split') {
      if (!updateData.amountEGP || !updateData.amountUSD) {
        return res.status(400).json({
          success: false,
          message: 'Both EGP and USD amounts are required for split payments',
        });
      }
      updateData.amount = updateData.amountEGP + updateData.amountUSD;
    } else if (updateData.currency) {
      // For single currency payments, set amountEGP or amountUSD based on currency
      if (updateData.currency === 'EGP') {
        updateData.amountEGP = updateData.amount || 0;
        updateData.amountUSD = 0;
      } else if (updateData.currency === 'USD') {
        updateData.amountEGP = 0;
        updateData.amountUSD = updateData.amount || 0;
      }
    }

    const payment = await Payment.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    )
      .populate('employeeId', 'name employeeType position monthlySalary pieceworkRate')
      .populate('projectId', 'name')
      .populate('sectionId', 'name')
      .populate('createdBy', 'name email');

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found',
      });
    }

    res.json({
      success: true,
      data: payment,
      message: 'Payment updated successfully',
    });
  } catch (error) {
    console.error('Error updating payment:', error);
    res.status(400).json({
      success: false,
      message: 'Error updating payment',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

// Delete payment
export const deletePayment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const payment = await Payment.findByIdAndDelete(id);

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found',
      });
    }

    res.json({
      success: true,
      message: 'Payment deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting payment:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting payment',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

// Get payment statistics
export const getPaymentStats = async (req: Request, res: Response) => {
  try {
    const { country } = req.params;
    const { startDate, endDate } = req.query;

    const matchFilter: any = { country };
    
    if (startDate || endDate) {
      matchFilter.paymentDate = {};
      if (startDate) {
        matchFilter.paymentDate.$gte = new Date(startDate as string);
      }
      if (endDate) {
        matchFilter.paymentDate.$lte = new Date(endDate as string);
      }
    }

    const stats = await Payment.aggregate([
      { $match: matchFilter },
      {
        $group: {
          _id: null,
          totalPayments: { $sum: 1 },
          totalAmountEGP: {
            $sum: {
              $cond: [
                { $eq: ['$currency', 'split'] },
                { $ifNull: ['$amountEGP', 0] },
                { $cond: [{ $eq: ['$currency', 'EGP'] }, '$amount', 0] }
              ]
            }
          },
          totalAmountUSD: {
            $sum: {
              $cond: [
                { $eq: ['$currency', 'split'] },
                { $ifNull: ['$amountUSD', 0] },
                { $cond: [{ $eq: ['$currency', 'USD'] }, '$amount', 0] }
              ]
            }
          },
          salaryPayments: {
            $sum: { $cond: [{ $eq: ['$paymentType', 'salary'] }, 1, 0] }
          },
          advancePayments: {
            $sum: { $cond: [{ $eq: ['$paymentType', 'advance'] }, 1, 0] }
          },
          loanPayments: {
            $sum: { $cond: [{ $eq: ['$paymentType', 'loan'] }, 1, 0] }
          },
          pieceworkPayments: {
            $sum: { $cond: [{ $eq: ['$paymentType', 'piecework'] }, 1, 0] }
          },
        }
      }
    ]);

    res.json({
      success: true,
      data: stats[0] || {
        totalPayments: 0,
        totalAmountEGP: 0,
        totalAmountUSD: 0,
        salaryPayments: 0,
        advancePayments: 0,
        loanPayments: 0,
        pieceworkPayments: 0,
      },
    });
  } catch (error) {
    console.error('Error fetching payment stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching payment statistics',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

// Get employee payment history
export const getEmployeePayments = async (req: Request, res: Response) => {
  try {
    const { employeeId } = req.params;
    const { startDate, endDate, page = 1, limit = 10 } = req.query;

    const filter: any = { employeeId };
    
    if (startDate || endDate) {
      filter.paymentDate = {};
      if (startDate) {
        filter.paymentDate.$gte = new Date(startDate as string);
      }
      if (endDate) {
        filter.paymentDate.$lte = new Date(endDate as string);
      }
    }

    const skip = (Number(page) - 1) * Number(limit);

    const payments = await Payment.find(filter)
      .populate('projectId', 'name')
      .populate('sectionId', 'name')
      .sort({ paymentDate: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Payment.countDocuments(filter);

    // Calculate totals
    const totals = await Payment.aggregate([
      { $match: filter },
      {
        $group: {
          _id: '$currency',
          total: { $sum: '$amount' }
        }
      }
    ]);

    res.json({
      success: true,
      data: payments,
      totals,
      pagination: {
        current: Number(page),
        pages: Math.ceil(total / Number(limit)),
        total,
      },
    });
  } catch (error) {
    console.error('Error fetching employee payments:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching employee payments',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};
