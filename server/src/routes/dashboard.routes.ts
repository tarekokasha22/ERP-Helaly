import express, { Request, Response } from 'express';
import { authenticate } from '../middlewares/auth.middleware';
import jsonStorage from '../storage/jsonStorage';

const router = express.Router();

/**
 * @route GET /api/dashboard
 * @desc Get dashboard statistics
 * @access Private
 */
router.get('/', authenticate, async (req: Request, res: Response) => {
  try {
    const { timeRange, country } = req.query;
    const userCountry = (req.user as any)?.country || country || 'egypt';

    // Get all data for the user's country
    const projects = await jsonStorage.getProjects(userCountry);
    const sections = await jsonStorage.getSections(userCountry);
    const spendings = await jsonStorage.getSpendings(userCountry);

    // Calculate project statistics
    const projectStats = {
      total: projects.length,
      active: projects.filter(p => p.status === 'in-progress').length,
      completed: projects.filter(p => p.status === 'completed').length,
      notStarted: projects.filter(p => p.status === 'planning').length,
      percentChange: 0 // This would be calculated based on historical data
    };

    // Calculate financial statistics
    const totalBudget = projects.reduce((sum, project) => sum + (project.budget || 0), 0);
    const totalSpending = spendings.reduce((sum, spending) => sum + (spending.amount || 0), 0);
    const totalRemaining = totalBudget - totalSpending;

    const financialStats = {
      totalBudget,
      totalSpending,
      totalRemaining,
      monthlyTrend: [0, 0, 0, 0, 0, 0], // Mock data for chart
      percentChange: 0
    };

    // Recent activities (mock for now)
    const recentActivities = [
      {
        id: '1',
        type: 'project_created',
        message: 'تم إنشاء مشروع جديد',
        timestamp: new Date().toISOString(),
        user: 'مدير النظام'
      }
    ];

    const dashboardData = {
      projectStats,
      financialStats,
      recentActivities,
      totalProjects: projects.length,
      totalSections: sections.length,
      totalSpendings: spendings.length
    };

    res.status(200).json(dashboardData);
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard data' });
  }
});

export default router;