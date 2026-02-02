import { Request, Response } from 'express';
import jsonStorage, { Employee, Payment } from '../storage/jsonStorage';

// Get all employees for a specific country
export const getEmployees = async (req: Request, res: Response) => {
  try {
    const { country } = req.params;
    const { employeeType, active, page = 1, limit = 1000 } = req.query;

    const filters: any = {};
    if (employeeType) filters.employeeType = employeeType as string;
    if (active !== undefined) filters.active = active === 'true';

    const allEmployees = await jsonStorage.getEmployees(country, filters);

    // Apply pagination
    const skip = (Number(page) - 1) * Number(limit);
    const employees = allEmployees.slice(skip, skip + Number(limit));
    const total = allEmployees.length;

    // Get all payments for balance calculation
    const allPayments = await jsonStorage.getPayments(country);

    // Calculate balance and payment history for each employee
    const employeesWithBalance = await Promise.all(
      employees.map(async (employee) => {
        const employeePayments = allPayments.filter(p => p.employeeId === employee._id);

        // Calculate total earned
        let totalEarned = 0;
        if (employee.employeeType === 'monthly' && employee.monthlySalary) {
          const monthsWorked = Math.max(1, Math.floor(
            (Date.now() - new Date(employee.hireDate).getTime()) / (1000 * 60 * 60 * 24 * 30)
          ));
          totalEarned = employee.monthlySalary * monthsWorked;
          totalEarned = employee.monthlySalary * monthsWorked;
        } else if ((employee.employeeType === 'daily' || employee.employeeType as any === 'piecework') && (employee.dailyRate || (employee as any).pieceworkRate)) {
          // Calculate earnings for daily workers (and legacy piecework)
          // Logic: Sum of (workQuantity * dailyRate) for all daily payments
          // Note: In this system, 'daily' payments represent "work done + paid". 
          // If workQuantity is present, it adds to earned amount.

          // Legacy support: handle both 'daily' and 'piecework' types, and 'dailyRate' vs 'pieceworkRate'
          const rate = employee.dailyRate || (employee as any).pieceworkRate || 0;

          const totalDays = employeePayments
            .filter(p => (p.paymentType === 'daily' || p.paymentType as any === 'piecework') && p.workQuantity)
            .reduce((sum, p) => sum + (p.workQuantity || 0), 0);

          totalEarned = rate * totalDays;
        }

        // Calculate total paid
        const totalPaidEGP = employeePayments.reduce((sum, p) => sum + (p.amountEGP || (p.currency === 'EGP' ? p.amount : 0)), 0);
        const totalPaidUSD = employeePayments.reduce((sum, p) => sum + (p.amountUSD || (p.currency === 'USD' ? p.amount : 0)), 0);
        const totalPaid = totalPaidEGP + totalPaidUSD;

        // Calculate balance
        const balance = totalEarned - totalPaid;

        // Get assigned projects
        const assignedProjectIds = [...new Set(
          employeePayments
            .filter(p => p.projectId)
            .map(p => p.projectId!)
        )];

        return {
          ...employee,
          id: employee._id,
          totalEarned,
          totalPaid,
          totalPaidEGP,
          totalPaidUSD,
          balance,
          payments: employeePayments.map(p => ({
            id: p._id,
            date: p.paymentDate,
            amount: p.amount,
            currency: p.currency,
            amountEGP: p.amountEGP || (p.currency === 'EGP' ? p.amount : 0),
            amountUSD: p.amountUSD || (p.currency === 'USD' ? p.amount : 0),
            paymentMethod: p.paymentMethod,
            receiptNumber: p.receiptNumber,
            paymentType: p.paymentType,
            description: p.description,
            projectId: p.projectId,
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
    const { country, id } = req.params;
    const employee = await jsonStorage.getEmployeeById(id, country);

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found',
      });
    }

    // Get all payments for this employee
    const payments = await jsonStorage.getPaymentsByEmployeeId(id, country);

    // Get projects for project names
    const projects = await jsonStorage.getProjects();

    // Calculate total earned
    let totalEarned = 0;
    if (employee.employeeType === 'monthly' && employee.monthlySalary) {
      const monthsWorked = Math.max(1, Math.floor(
        (Date.now() - new Date(employee.hireDate).getTime()) / (1000 * 60 * 60 * 24 * 30)
      ));
      totalEarned = employee.monthlySalary * monthsWorked;
    } else if ((employee.employeeType === 'daily' || employee.employeeType as any === 'piecework') && (employee.dailyRate || (employee as any).pieceworkRate)) {
      // Legacy support: handle both 'daily' and 'piecework' types, and 'dailyRate' vs 'pieceworkRate'
      const rate = employee.dailyRate || (employee as any).pieceworkRate || 0;

      const totalDays = payments
        .filter(p => (p.paymentType === 'daily' || p.paymentType as any === 'piecework') && p.workQuantity)
        .reduce((sum, p) => sum + (p.workQuantity || 0), 0);

      totalEarned = rate * totalDays;
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
        .map(p => p.projectId!)
    )];

    res.json({
      success: true,
      data: {
        ...employee,
        id: employee._id,
        totalEarned,
        totalPaid,
        totalPaidEGP,
        totalPaidUSD,
        balance,
        payments: payments.map(p => {
          const project = projects.find(proj => proj._id === p.projectId);
          return {
            id: p._id,
            date: p.paymentDate,
            amount: p.amount,
            currency: p.currency,
            amountEGP: p.amountEGP || (p.currency === 'EGP' ? p.amount : 0),
            amountUSD: p.amountUSD || (p.currency === 'USD' ? p.amount : 0),
            paymentMethod: p.paymentMethod,
            receiptNumber: p.receiptNumber,
            paymentType: p.paymentType,
            description: p.description,
            projectId: p.projectId,
            projectName: project?.name,
          };
        }),
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
    const { country } = req.params;
    const employeeData: Omit<Employee, '_id' | 'createdAt' | 'updatedAt'> = {
      ...req.body,
      country: country as 'egypt' | 'libya',
      createdBy: (req as any).user?.id || 'system',
    };

    const employee = await jsonStorage.createEmployee(employeeData);

    res.status(201).json({
      success: true,
      data: {
        ...employee,
        id: employee._id,
      },
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
    const { country, id } = req.params;
    const updateData = { ...req.body, country };

    const employee = await jsonStorage.updateEmployee(id, updateData);

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found',
      });
    }

    res.json({
      success: true,
      data: {
        ...employee,
        id: employee._id,
      },
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
    const { country, id } = req.params;

    const employee = await jsonStorage.deleteEmployee(id, country);

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

    const employees = await jsonStorage.getEmployees(country);

    const stats = {
      totalEmployees: employees.length,
      activeEmployees: employees.filter(e => e.active).length,
      monthlyEmployees: employees.filter(e => e.employeeType === 'monthly').length,
      dailyEmployees: employees.filter(e => e.employeeType === 'daily').length,
      totalMonthlySalary: employees
        .filter(e => e.employeeType === 'monthly' && e.monthlySalary)
        .reduce((sum, e) => sum + (e.monthlySalary || 0), 0),
    };

    res.json({
      success: true,
      data: stats,
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
