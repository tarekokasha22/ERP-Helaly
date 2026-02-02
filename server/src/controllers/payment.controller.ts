import { Request, Response } from 'express';
import jsonStorage, { Payment, Employee } from '../storage/jsonStorage';

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
      limit = 1000
    } = req.query;

    const filters: any = {};
    if (employeeId) filters.employeeId = employeeId as string;
    if (paymentType) filters.paymentType = paymentType as string;
    if (currency) filters.currency = currency as string;
    if (startDate) filters.startDate = startDate as string;
    if (endDate) filters.endDate = endDate as string;

    const allPayments = await jsonStorage.getPayments(country, filters);

    // Apply pagination
    const skip = (Number(page) - 1) * Number(limit);
    const payments = allPayments.slice(skip, skip + Number(limit));
    const total = allPayments.length;

    // Get employees and projects for populating names
    const employees = await jsonStorage.getEmployees(country);
    const projects = await jsonStorage.getProjects(country);
    const sections = await jsonStorage.getSections(country);

    // Enrich payments with employee and project names
    const enrichedPayments = payments.map(payment => {
      const employee = employees.find(e => e._id === payment.employeeId);
      const project = projects.find(p => p._id === payment.projectId);
      const section = sections.find(s => s._id === payment.sectionId);

      return {
        ...payment,
        id: payment._id,
        employeeName: employee?.name,
        employeeType: employee?.employeeType,
        projectName: project?.name,
        sectionName: section?.name,
      };
    });

    res.json({
      success: true,
      data: enrichedPayments,
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
    const { country, id } = req.params;
    const payment = await jsonStorage.getPaymentById(id, country);

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found',
      });
    }

    // Get employee and project for populating names
    const employee = await jsonStorage.getEmployeeById(payment.employeeId, country);
    const project = payment.projectId ? await jsonStorage.getProjects(country).then(projects => projects.find(p => p._id === payment.projectId)) : null;
    const section = payment.sectionId ? await jsonStorage.getSections(country).then(sections => sections.find(s => s._id === payment.sectionId)) : null;

    res.json({
      success: true,
      data: {
        ...payment,
        id: payment._id,
        employeeName: employee?.name,
        employeeType: employee?.employeeType,
        projectName: project?.name,
        sectionName: section?.name,
      },
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
    const { country } = req.params;
    const paymentData: Omit<Payment, '_id' | 'createdAt' | 'updatedAt'> = {
      ...req.body,
      country: country as 'egypt' | 'libya',
      createdBy: (req as any).user?.id || 'system',
    };

    // Validate employee exists
    const employee = await jsonStorage.getEmployeeById(paymentData.employeeId, country);
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found',
      });
    }

    // For daily payments, calculate amount if not provided
    if (paymentData.paymentType === 'daily' && paymentData.workQuantity && employee.dailyRate) {
      paymentData.amount = paymentData.workQuantity * employee.dailyRate;
    }

    // Handle split payments - calculate total amount
    if (paymentData.currency === 'split') {
      if (!paymentData.amountEGP || !paymentData.amountUSD) {
        return res.status(400).json({
          success: false,
          message: 'Both EGP and USD amounts are required for split payments',
        });
      }
      paymentData.amount = paymentData.amountEGP + paymentData.amountUSD;
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

    const payment = await jsonStorage.createPayment(paymentData);

    // AUTO-CREATE SPENDING: If payment is linked to a project
    if (paymentData.projectId && paymentData.amount > 0) {
      const spendingCategory = paymentData.paymentType === 'salary' || paymentData.paymentType === 'daily'
        ? 'labor'
        : 'other';

      await jsonStorage.createSpending({
        projectId: paymentData.projectId,
        sectionId: paymentData.sectionId || undefined,
        amount: paymentData.amount,
        category: spendingCategory,
        description: `دفعة للموظف: ${employee.name} (${paymentData.paymentType === 'salary' ? 'راتب' : paymentData.paymentType === 'daily' ? 'يومي' : paymentData.paymentType})`,
        date: paymentData.paymentDate || new Date().toISOString(),
        country: country as 'egypt' | 'libya'
      });
      console.log(`✅ Auto-created spending of ${paymentData.amount} for project ${paymentData.projectId} from payment`);
    }

    // Get employee and project for response
    const employeeData = await jsonStorage.getEmployeeById(payment.employeeId, country);
    const project = payment.projectId ? await jsonStorage.getProjects(country).then(projects => projects.find(p => p._id === payment.projectId)) : null;
    const section = payment.sectionId ? await jsonStorage.getSections(country).then(sections => sections.find(s => s._id === payment.sectionId)) : null;

    res.status(201).json({
      success: true,
      data: {
        ...payment,
        id: payment._id,
        employeeName: employeeData?.name,
        employeeType: employeeData?.employeeType,
        projectName: project?.name,
        sectionName: section?.name,
      },
      message: 'Payment created successfully' + (paymentData.projectId ? ' (spending auto-created)' : ''),
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
    const { country, id } = req.params;
    const updateData = { ...req.body, country };

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

    const payment = await jsonStorage.updatePayment(id, updateData);

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found',
      });
    }

    // Get employee and project for response
    const employee = await jsonStorage.getEmployeeById(payment.employeeId, country);
    const project = payment.projectId ? await jsonStorage.getProjects(country).then(projects => projects.find(p => p._id === payment.projectId)) : null;
    const section = payment.sectionId ? await jsonStorage.getSections(country).then(sections => sections.find(s => s._id === payment.sectionId)) : null;

    res.json({
      success: true,
      data: {
        ...payment,
        id: payment._id,
        employeeName: employee?.name,
        employeeType: employee?.employeeType,
        projectName: project?.name,
        sectionName: section?.name,
      },
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
    const { country, id } = req.params;

    const deleted = await jsonStorage.deletePayment(id, country);

    if (!deleted) {
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

    const filters: any = {};
    if (startDate) filters.startDate = startDate as string;
    if (endDate) filters.endDate = endDate as string;

    const payments = await jsonStorage.getPayments(country, filters);

    const stats = {
      totalPayments: payments.length,
      totalAmountEGP: payments.reduce((sum, p) =>
        sum + (p.amountEGP || (p.currency === 'EGP' ? p.amount : 0)), 0
      ),
      totalAmountUSD: payments.reduce((sum, p) =>
        sum + (p.amountUSD || (p.currency === 'USD' ? p.amount : 0)), 0
      ),
      salaryPayments: payments.filter(p => p.paymentType === 'salary').length,
      advancePayments: payments.filter(p => p.paymentType === 'advance').length,
      loanPayments: payments.filter(p => p.paymentType === 'loan').length,
      dailyPayments: payments.filter(p => p.paymentType === 'daily').length,
    };

    res.json({
      success: true,
      data: stats,
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
    const { country, employeeId } = req.params;
    const { startDate, endDate, page = 1, limit = 1000 } = req.query;

    const filters: any = { employeeId };
    if (startDate) filters.startDate = startDate as string;
    if (endDate) filters.endDate = endDate as string;

    const allPayments = await jsonStorage.getPayments(country, filters);

    // Apply pagination
    const skip = (Number(page) - 1) * Number(limit);
    const payments = allPayments.slice(skip, skip + Number(limit));
    const total = allPayments.length;

    // Get projects and sections for names
    const projects = await jsonStorage.getProjects(country);
    const sections = await jsonStorage.getSections(country);

    const enrichedPayments = payments.map(payment => {
      const project = projects.find(p => p._id === payment.projectId);
      const section = sections.find(s => s._id === payment.sectionId);

      return {
        ...payment,
        id: payment._id,
        projectName: project?.name,
        sectionName: section?.name,
      };
    });

    // Calculate totals
    const totals = {
      EGP: payments.reduce((sum, p) => sum + (p.amountEGP || (p.currency === 'EGP' ? p.amount : 0)), 0),
      USD: payments.reduce((sum, p) => sum + (p.amountUSD || (p.currency === 'USD' ? p.amount : 0)), 0),
    };

    res.json({
      success: true,
      data: enrichedPayments,
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
