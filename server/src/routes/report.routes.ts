import express, { Request, Response } from 'express';
import { authenticate, isAdmin } from '../middlewares/auth.middleware';
import jsonStorage from '../storage/jsonStorage';

const router = express.Router();

/**
 * @route GET /api/reports/summary
 * @desc Get comprehensive summary report with real data
 * @access Private
 */
router.get('/summary', authenticate, async (req: Request, res: Response) => {
  try {
    const userCountry = (req.user as any)?.country || req.query.country || 'egypt';

    // Get real data from storage
    const projects = await jsonStorage.getProjects(userCountry);
    const sections = await jsonStorage.getSections(userCountry);
    const spendings = await jsonStorage.getSpendings(userCountry);
    const employees = await jsonStorage.getEmployees(userCountry);
    const payments = await jsonStorage.getPayments(userCountry);
    const inventory = await jsonStorage.getInventory(userCountry);

    // Calculate project statistics
    const projectStats = {
      total: projects.length,
      completed: projects.filter(p => p.status === 'completed').length,
      inProgress: projects.filter(p => p.status === 'in_progress').length,
      notStarted: projects.filter(p => p.status === 'planning').length,
      completionRate: projects.length > 0
        ? (projects.filter(p => p.status === 'completed').length / projects.length) * 100
        : 0
    };

    // Calculate COMPREHENSIVE budget statistics including inventory costs
    const totalBudget = projects.reduce((sum, p) => sum + (p.budget || 0), 0);
    const directSpending = spendings.reduce((sum, s) => sum + (s.amount || 0), 0);

    // Calculate inventory costs linked to projects
    const inventoryCosts = inventory.reduce((sum, i) => sum + (i.totalValue || 0), 0);

    // Calculate payments linked to projects
    const paymentsCosts = payments.reduce((sum, p) => sum + (p.amount || 0), 0);

    // Total comprehensive spending
    const totalSpending = directSpending;  // Spendings already include auto-created records from inventory/payments

    const budgetStats = {
      totalBudget,
      totalSpending,
      directSpending,
      inventoryCosts,
      paymentsCosts,
      remaining: totalBudget - totalSpending,
      utilizationRate: totalBudget > 0 ? (totalSpending / totalBudget) * 100 : 0
    };

    // Calculate section statistics
    const sectionStats = {
      total: sections.length,
      averageProgress: sections.length > 0
        ? sections.reduce((sum, s) => sum + (s.progress || 0), 0) / sections.length
        : 0
    };

    // Calculate employee statistics with salary totals
    let totalMonthlySalaries = 0;
    let totalDailyRates = 0;
    employees.forEach(emp => {
      if (emp.active) {
        if (emp.employeeType === 'monthly' && emp.monthlySalary) {
          totalMonthlySalaries += emp.monthlySalary;
        } else if (emp.employeeType === 'daily' && emp.dailyRate) {
          totalDailyRates += emp.dailyRate * 22; // Estimated monthly
        }
      }
    });

    const employeeStats = {
      total: employees.length,
      active: employees.filter(e => e.active).length,
      monthly: employees.filter(e => e.employeeType === 'monthly').length,
      daily: employees.filter(e => e.employeeType === 'daily').length,
      totalMonthlySalaries,
      totalDailyRates,
      estimatedMonthlyCost: totalMonthlySalaries + totalDailyRates
    };

    // Calculate payment statistics
    const paymentStats = {
      totalPayments: payments.length,
      totalAmount: payments.reduce((sum, p) => sum + (p.amount || 0), 0),
      salaries: payments.filter(p => p.paymentType === 'salary').reduce((sum, p) => sum + (p.amount || 0), 0),
      advances: payments.filter(p => p.paymentType === 'advance').reduce((sum, p) => sum + (p.amount || 0), 0),
      byProject: payments.filter(p => p.projectId).reduce((sum, p) => sum + (p.amount || 0), 0)
    };

    // Calculate inventory statistics with project breakdown
    const inventoryByProject: { [key: string]: number } = {};
    inventory.forEach(item => {
      if (item.projectId) {
        inventoryByProject[item.projectId] = (inventoryByProject[item.projectId] || 0) + (item.totalValue || 0);
      }
    });

    const inventoryStats = {
      totalItems: inventory.length,
      totalValue: inventory.reduce((sum, i) => sum + (i.totalValue || 0), 0),
      lowStock: inventory.filter(i => i.status === 'low_stock').length,
      outOfStock: inventory.filter(i => i.status === 'out_of_stock').length,
      linkedToProjects: inventory.filter(i => i.projectId).length,
      valueByProject: inventoryByProject
    };

    res.status(200).json({
      success: true,
      data: {
        country: userCountry,
        projects: projectStats,
        budget: budgetStats,
        sections: sectionStats,
        employees: employeeStats,
        payments: paymentStats,
        inventory: inventoryStats,
        generatedAt: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error generating summary report:', error);
    res.status(500).json({ success: false, error: 'Failed to generate summary report' });
  }
});

/**
 * @route GET /api/reports/project-status
 * @desc Get project status report data
 * @access Private
 */
router.get('/project-status', authenticate, async (req: Request, res: Response) => {
  try {
    const userCountry = (req.user as any)?.country || req.query.country || 'egypt';
    const projects = await jsonStorage.getProjects(userCountry);

    const completed = projects.filter(p => p.status === 'completed').length;
    const inProgress = projects.filter(p => p.status === 'in_progress').length;
    const notStarted = projects.filter(p => p.status === 'planning').length;

    const projectStatusData = {
      labels: ['مكتمل', 'قيد التنفيذ', 'لم يبدأ'],
      datasets: [{
        label: 'المشاريع حسب الحالة',
        data: [completed, inProgress, notStarted],
        backgroundColor: ['#10B981', '#3B82F6', '#6B7280'],
        borderWidth: 0,
      }],
      summary: {
        total: projects.length,
        completed,
        inProgress,
        notStarted,
        completionRate: projects.length > 0 ? (completed / projects.length) * 100 : 0
      }
    };

    res.status(200).json(projectStatusData);
  } catch (error) {
    console.error('Error fetching project status:', error);
    res.status(500).json({ error: 'Failed to fetch project status' });
  }
});

/**
 * @route GET /api/reports/spending-category
 * @desc Get spending by category report data
 * @access Private
 */
router.get('/spending-category', authenticate, async (req: Request, res: Response) => {
  try {
    const userCountry = (req.user as any)?.country || req.query.country || 'egypt';
    const spendings = await jsonStorage.getSpendings(userCountry);

    // Group spendings by category
    const categories: { [key: string]: number } = {
      materials: 0,
      labor: 0,
      equipment: 0,
      consulting: 0,
      other: 0
    };

    spendings.forEach(s => {
      const cat = s.category || 'other';
      if (categories[cat] !== undefined) {
        categories[cat] += s.amount || 0;
      } else {
        categories.other += s.amount || 0;
      }
    });

    const total = Object.values(categories).reduce((sum, val) => sum + val, 0);
    const highestCategory = Object.entries(categories).sort((a, b) => b[1] - a[1])[0];

    const spendingCategoryData = {
      labels: ['المواد', 'العمالة', 'المعدات', 'الاستشارات', 'أخرى'],
      datasets: [{
        label: 'المصروفات حسب الفئة',
        data: Object.values(categories),
        backgroundColor: ['#F97316', '#8B5CF6', '#06B6D4', '#10B981', '#6B7280'],
        borderWidth: 0,
      }],
      summary: {
        total,
        highestCategory: highestCategory[0],
        highestAmount: highestCategory[1],
        highestPercentage: total > 0 ? (highestCategory[1] / total) * 100 : 0
      }
    };

    res.status(200).json(spendingCategoryData);
  } catch (error) {
    console.error('Error fetching spending categories:', error);
    res.status(500).json({ error: 'Failed to fetch spending categories' });
  }
});

/**
 * @route GET /api/reports/employees
 * @desc Get employee report data
 * @access Private
 */
router.get('/employees', authenticate, async (req: Request, res: Response) => {
  try {
    const userCountry = (req.user as any)?.country || req.query.country || 'egypt';
    const employees = await jsonStorage.getEmployees(userCountry);
    const payments = await jsonStorage.getPayments(userCountry);

    // Calculate employee payment totals
    const employeePayments = employees.map(emp => {
      const empPayments = payments.filter(p => p.employeeId === emp._id);
      return {
        id: emp._id,
        name: emp.name,
        position: emp.position,
        employeeType: emp.employeeType,
        totalPayments: empPayments.reduce((sum, p) => sum + (p.amount || 0), 0),
        paymentCount: empPayments.length
      };
    });

    res.status(200).json({
      success: true,
      data: {
        totalEmployees: employees.length,
        activeEmployees: employees.filter(e => e.active).length,
        monthlyEmployees: employees.filter(e => e.employeeType === 'monthly').length,
        dailyEmployees: employees.filter(e => e.employeeType === 'daily').length,
        employeePayments,
        totalPaymentsAmount: payments.reduce((sum, p) => sum + (p.amount || 0), 0)
      }
    });
  } catch (error) {
    console.error('Error fetching employee report:', error);
    res.status(500).json({ error: 'Failed to fetch employee report' });
  }
});

/**
 * @route GET /api/reports/inventory
 * @desc Get inventory report data
 * @access Private
 */
router.get('/inventory', authenticate, async (req: Request, res: Response) => {
  try {
    const userCountry = (req.user as any)?.country || req.query.country || 'egypt';
    const inventory = await jsonStorage.getInventory(userCountry);

    // Group by category
    const byCategory: { [key: string]: { count: number; value: number } } = {};
    inventory.forEach(item => {
      if (!byCategory[item.category]) {
        byCategory[item.category] = { count: 0, value: 0 };
      }
      byCategory[item.category].count++;
      byCategory[item.category].value += item.totalValue || 0;
    });

    res.status(200).json({
      success: true,
      data: {
        totalItems: inventory.length,
        totalValue: inventory.reduce((sum, i) => sum + (i.totalValue || 0), 0),
        inStock: inventory.filter(i => i.status === 'in_stock').length,
        lowStock: inventory.filter(i => i.status === 'low_stock').length,
        outOfStock: inventory.filter(i => i.status === 'out_of_stock').length,
        byCategory
      }
    });
  } catch (error) {
    console.error('Error fetching inventory report:', error);
    res.status(500).json({ error: 'Failed to fetch inventory report' });
  }
});

/**
 * @route GET /api/reports/spending-timeline
 * @desc Get spending timeline report data
 * @access Private
 */
router.get('/spending-timeline', authenticate, async (req: Request, res: Response) => {
  try {
    const userCountry = (req.user as any)?.country || req.query.country || 'egypt';
    const spendings = await jsonStorage.getSpendings(userCountry);
    const range = req.query.range || 'month';

    // Group by date
    const spendingsByDate: { [key: string]: number } = {};
    spendings.forEach(s => {
      const date = new Date(s.date || s.createdAt);
      const key = date.toISOString().split('T')[0];
      spendingsByDate[key] = (spendingsByDate[key] || 0) + (s.amount || 0);
    });

    const sortedDates = Object.keys(spendingsByDate).sort();
    const total = Object.values(spendingsByDate).reduce((sum, val) => sum + val, 0);

    res.status(200).json({
      labels: sortedDates,
      datasets: [{
        label: 'المصروفات اليومية',
        data: sortedDates.map(d => spendingsByDate[d]),
        backgroundColor: '#F97316',
      }],
      summary: {
        total,
        average: sortedDates.length > 0 ? total / sortedDates.length : 0,
        highest: sortedDates.length > 0 ? Math.max(...Object.values(spendingsByDate)) : 0
      }
    });
  } catch (error) {
    console.error('Error fetching spending timeline:', error);
    res.status(500).json({ error: 'Failed to fetch spending timeline' });
  }
});

/**
 * @route GET /api/reports/progress-timeline
 * @desc Get project progress timeline report data
 * @access Private
 */
router.get('/progress-timeline', authenticate, async (req: Request, res: Response) => {
  try {
    const userCountry = (req.user as any)?.country || req.query.country || 'egypt';
    const projects = await jsonStorage.getProjects(userCountry);

    const progressData = {
      labels: projects.map(p => p.name),
      datasets: [{
        label: 'نسبة التقدم',
        data: projects.map(p => (p as any).progress || 0),
        backgroundColor: projects.map(p =>
          p.status === 'completed' ? '#10B981' :
            p.status === 'in_progress' ? '#3B82F6' : '#6B7280'
        ),
        borderWidth: 0,
      }],
      summary: {
        projects: projects.map(p => ({
          name: p.name,
          progress: (p as any).progress || 0,
          status: p.status
        }))
      }
    };

    res.status(200).json(progressData);
  } catch (error) {
    console.error('Error fetching progress timeline:', error);
    res.status(500).json({ error: 'Failed to fetch progress timeline' });
  }
});

/**
 * @route GET /api/reports/performance
 * @desc Get worker performance report data
 * @access Private (admin only)
 */
router.get('/performance', authenticate, isAdmin, async (req: Request, res: Response) => {
  try {
    const userCountry = (req.user as any)?.country || req.query.country || 'egypt';
    const employees = await jsonStorage.getEmployees(userCountry);
    const payments = await jsonStorage.getPayments(userCountry);

    // Calculate performance metrics
    const performanceData = employees.slice(0, 10).map(emp => {
      const empPayments = payments.filter(p => p.employeeId === emp._id);
      return {
        name: emp.name,
        position: emp.position,
        totalEarnings: empPayments.reduce((sum, p) => sum + (p.amount || 0), 0),
        paymentCount: empPayments.length
      };
    });

    res.status(200).json({
      labels: performanceData.map(p => p.name),
      datasets: [{
        label: 'إجمالي الأرباح',
        data: performanceData.map(p => p.totalEarnings),
        backgroundColor: '#3B82F6',
      }],
      summary: {
        topPerformer: performanceData[0]?.name || 'N/A',
        totalPayments: payments.length,
        averagePayment: payments.length > 0
          ? payments.reduce((sum, p) => sum + (p.amount || 0), 0) / payments.length
          : 0
      }
    });
  } catch (error) {
    console.error('Error fetching performance data:', error);
    res.status(500).json({ error: 'Failed to fetch performance data' });
  }
});

export default router;