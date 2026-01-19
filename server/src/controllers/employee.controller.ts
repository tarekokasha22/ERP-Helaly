import { Request, Response } from 'express';
import Employee from '../models/employee.model';
import Payment from '../models/payment.model';
import { IEmployee } from '../models/employee.model';

// Get all employees for a specific country
export const getEmployees = async (req: Request, res: Response) => {
  try {
    const { country } = req.params;
    const { employeeType, active, page = 1, limit = 10 } = req.query;

    const filter: any = { country };
    
    if (employeeType) {
      filter.employeeType = employeeType;
    }
    
    if (active !== undefined) {
      filter.active = active === 'true';
    }

    const skip = (Number(page) - 1) * Number(limit);

    const employees = await Employee.find(filter)
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Employee.countDocuments(filter);

    // Calculate balance and payment history for each employee
    const employeesWithBalance = await Promise.all(
      employees.map(async (employee) => {
        const employeeObj = employee.toObject();
        
        // Get all payments for this employee
        const payments = await Payment.find({ employeeId: employee._id });
        
        // Calculate total earned
        let totalEarned = 0;
        if (employee.employeeType === 'monthly' && employee.monthlySalary) {
          // Calculate months worked
          const monthsWorked = Math.max(1, Math.floor(
            (Date.now() - new Date(employee.hireDate).getTime()) / (1000 * 60 * 60 * 24 * 30)
          ));
          totalEarned = employee.monthlySalary * monthsWorked;
        } else if (employee.employeeType === 'piecework' && employee.pieceworkRate) {
          // Sum all piecework quantities
          const totalPieces = payments
            .filter(p => p.paymentType === 'piecework' && p.workQuantity)
            .reduce((sum, p) => sum + (p.workQuantity || 0), 0);
          totalEarned = employee.pieceworkRate * totalPieces;
        }
        
        // Calculate total paid (sum of all payments)
        const totalPaidEGP = payments.reduce((sum, p) => sum + (p.amountEGP || (p.currency === 'EGP' ? p.amount : 0)), 0);
        const totalPaidUSD = payments.reduce((sum, p) => sum + (p.amountUSD || (p.currency === 'USD' ? p.amount : 0)), 0);
        const totalPaid = totalPaidEGP + totalPaidUSD; // Simplified - in real app, convert USD to EGP
        
        // Calculate balance
        const balance = totalEarned - totalPaid;
        
        // Get assigned projects (from payments)
        const assignedProjectIds = [...new Set(
          payments
            .filter(p => p.projectId)
            .map(p => p.projectId?.toString())
        )];
        
        return {
          ...employeeObj,
          totalEarned,
          totalPaid,
          totalPaidEGP,
          totalPaidUSD,
          balance,
          payments: payments.map(p => ({
            id: p._id.toString(),
            date: p.paymentDate,
            amount: p.amount,
            currency: p.currency,
            amountEGP: p.amountEGP || (p.currency === 'EGP' ? p.amount : 0),
            amountUSD: p.amountUSD || (p.currency === 'USD' ? p.amount : 0),
            paymentMethod: p.paymentMethod,
            receiptNumber: p.receiptNumber,
            paymentType: p.paymentType,
            description: p.description,
            projectId: p.projectId?.toString(),
          })),
          assignedProjects: assignedProjectIds,
          activeProjects: assignedProjectIds.length,
        };
      })
    );

    res.json({
      success: true,
      data: employeesWithBalance,
      pagination: {
        current: Number(page),
        pages: Math.ceil(total / Number(limit)),
        total,
      },
    });
  } catch (error) {
    console.error('Error fetching employees:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching employees',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

// Get employee by ID
export const getEmployeeById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const employee = await Employee.findById(id).populate('createdBy', 'name email');

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found',
      });
    }

    // Get all payments for this employee
    const payments = await Payment.find({ employeeId: employee._id })
      .populate('projectId', 'name')
      .sort({ paymentDate: -1 });

    // Calculate total earned
    let totalEarned = 0;
    if (employee.employeeType === 'monthly' && employee.monthlySalary) {
      const monthsWorked = Math.max(1, Math.floor(
        (Date.now() - new Date(employee.hireDate).getTime()) / (1000 * 60 * 60 * 24 * 30)
      ));
      totalEarned = employee.monthlySalary * monthsWorked;
    } else if (employee.employeeType === 'piecework' && employee.pieceworkRate) {
      const totalPieces = payments
        .filter(p => p.paymentType === 'piecework' && p.workQuantity)
        .reduce((sum, p) => sum + (p.workQuantity || 0), 0);
      totalEarned = employee.pieceworkRate * totalPieces;
    }

    // Calculate total paid
    const totalPaidEGP = payments.reduce((sum, p) => sum + (p.amountEGP || (p.currency === 'EGP' ? p.amount : 0)), 0);
    const totalPaidUSD = payments.reduce((sum, p) => sum + (p.amountUSD || (p.currency === 'USD' ? p.amount : 0)), 0);
    const totalPaid = totalPaidEGP + totalPaidUSD;

    // Calculate balance
    const balance = totalEarned - totalPaid;

    // Get assigned projects
    const assignedProjectIds = [...new Set(
      payments
        .filter(p => p.projectId)
        .map(p => p.projectId?.toString())
    )];

    const employeeObj = employee.toObject();
    res.json({
      success: true,
      data: {
        ...employeeObj,
        totalEarned,
        totalPaid,
        totalPaidEGP,
        totalPaidUSD,
        balance,
        payments: payments.map(p => ({
          id: p._id.toString(),
          date: p.paymentDate,
          amount: p.amount,
          currency: p.currency,
          amountEGP: p.amountEGP || (p.currency === 'EGP' ? p.amount : 0),
          amountUSD: p.amountUSD || (p.currency === 'USD' ? p.amount : 0),
          paymentMethod: p.paymentMethod,
          receiptNumber: p.receiptNumber,
          paymentType: p.paymentType,
          description: p.description,
          projectId: p.projectId?.toString(),
          projectName: (p.projectId as any)?.name,
        })),
        assignedProjects: assignedProjectIds,
        activeProjects: assignedProjectIds.length,
      },
    });
  } catch (error) {
    console.error('Error fetching employee:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching employee',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

// Create new employee
export const createEmployee = async (req: Request, res: Response) => {
  try {
    const employeeData: Partial<IEmployee> = {
      ...req.body,
      createdBy: req.user?.id,
    };

    const employee = new Employee(employeeData);
    await employee.save();

    const populatedEmployee = await Employee.findById(employee._id)
      .populate('createdBy', 'name email');

    res.status(201).json({
      success: true,
      data: populatedEmployee,
      message: 'Employee created successfully',
    });
  } catch (error) {
    console.error('Error creating employee:', error);
    res.status(400).json({
      success: false,
      message: 'Error creating employee',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

// Update employee
export const updateEmployee = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const employee = await Employee.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate('createdBy', 'name email');

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found',
      });
    }

    res.json({
      success: true,
      data: employee,
      message: 'Employee updated successfully',
    });
  } catch (error) {
    console.error('Error updating employee:', error);
    res.status(400).json({
      success: false,
      message: 'Error updating employee',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

// Delete employee (soft delete by setting active to false)
export const deleteEmployee = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const employee = await Employee.findByIdAndUpdate(
      id,
      { active: false },
      { new: true }
    );

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found',
      });
    }

    res.json({
      success: true,
      message: 'Employee deactivated successfully',
    });
  } catch (error) {
    console.error('Error deleting employee:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting employee',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

// Get employee statistics
export const getEmployeeStats = async (req: Request, res: Response) => {
  try {
    const { country } = req.params;

    const stats = await Employee.aggregate([
      { $match: { country } },
      {
        $group: {
          _id: null,
          totalEmployees: { $sum: 1 },
          activeEmployees: {
            $sum: { $cond: [{ $eq: ['$active', true] }, 1, 0] }
          },
          monthlyEmployees: {
            $sum: { $cond: [{ $eq: ['$employeeType', 'monthly'] }, 1, 0] }
          },
          pieceworkEmployees: {
            $sum: { $cond: [{ $eq: ['$employeeType', 'piecework'] }, 1, 0] }
          },
          totalMonthlySalary: {
            $sum: { $cond: [{ $eq: ['$employeeType', 'monthly'] }, '$monthlySalary', 0] }
          },
        }
      }
    ]);

    res.json({
      success: true,
      data: stats[0] || {
        totalEmployees: 0,
        activeEmployees: 0,
        monthlyEmployees: 0,
        pieceworkEmployees: 0,
        totalMonthlySalary: 0,
      },
    });
  } catch (error) {
    console.error('Error fetching employee stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching employee statistics',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};
