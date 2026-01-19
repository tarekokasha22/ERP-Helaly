import express, { Request, Response } from 'express';
import { authenticate, isAdmin } from '../middlewares/auth.middleware';

const router = express.Router();

/**
 * @route GET /api/reports/project-status
 * @desc Get project status report data
 * @access Private
 */
router.get('/project-status', authenticate, (req: Request, res: Response) => {
  // In a real app, this would fetch project status data from database
  const projectStatusData = {
    labels: ['Completed', 'In Progress', 'Not Started'],
    datasets: [
      {
        label: 'Projects by Status',
        data: [4, 8, 3],
        backgroundColor: ['#10B981', '#3B82F6', '#6B7280'],
        borderWidth: 0,
      },
    ],
    summary: {
      total: 15,
      completed: 4,
      inProgress: 8,
      notStarted: 3,
      completionRate: 26.67
    }
  };
  
  res.status(200).json(projectStatusData);
});

/**
 * @route GET /api/reports/spending-category
 * @desc Get spending by category report data
 * @access Private
 */
router.get('/spending-category', authenticate, (req: Request, res: Response) => {
  // In a real app, this would fetch spending category data from database
  const spendingCategoryData = {
    labels: ['Materials', 'Labor', 'Equipment', 'Permits', 'Consulting', 'Other'],
    datasets: [
      {
        label: 'Spending by Category',
        data: [350000, 275000, 120000, 45000, 60000, 25000],
        backgroundColor: [
          '#F97316', 
          '#8B5CF6', 
          '#06B6D4', 
          '#10B981',
          '#EAB308',
          '#6B7280'
        ],
        borderWidth: 0,
      },
    ],
    summary: {
      total: 875000,
      highestCategory: 'Materials',
      highestAmount: 350000,
      highestPercentage: 40
    }
  };
  
  res.status(200).json(spendingCategoryData);
});

/**
 * @route GET /api/reports/spending-timeline
 * @desc Get spending timeline report data
 * @access Private
 */
router.get('/spending-timeline', authenticate, (req: Request, res: Response) => {
  // Get date range from query params, default to 'month'
  const range = req.query.range || 'month';
  
  // In a real app, this would fetch spending timeline data from database based on the range
  
  // Mock data for different ranges
  let spendingTimelineData;
  
  if (range === 'year') {
    spendingTimelineData = {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
      datasets: [
        {
          label: 'Monthly Spending ($)',
          data: [65000, 78000, 92000, 68000, 84000, 105000, 120000, 112000, 96000, 78000, 85000, 92000],
          backgroundColor: '#F97316',
        },
      ],
      summary: {
        total: 1075000,
        average: 89583.33,
        highest: {
          period: 'Jul',
          amount: 120000
        },
        lowest: {
          period: 'Jan',
          amount: 65000
        }
      }
    };
  } else if (range === 'quarter') {
    spendingTimelineData = {
      labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5', 'Week 6', 'Week 7', 'Week 8', 'Week 9', 'Week 10', 'Week 11', 'Week 12'],
      datasets: [
        {
          label: 'Weekly Spending ($)',
          data: [22000, 25000, 28000, 24000, 26000, 29000, 32000, 30000, 27000, 25000, 28000, 30000],
          backgroundColor: '#F97316',
        },
      ],
      summary: {
        total: 326000,
        average: 27166.67,
        highest: {
          period: 'Week 7',
          amount: 32000
        },
        lowest: {
          period: 'Week 1',
          amount: 22000
        }
      }
    };
  } else {
    // month
    spendingTimelineData = {
      labels: ['Day 1', 'Day 5', 'Day 10', 'Day 15', 'Day 20', 'Day 25', 'Day 30'],
      datasets: [
        {
          label: 'Daily Spending ($)',
          data: [5000, 7200, 8500, 6800, 7500, 8200, 6500],
          backgroundColor: '#F97316',
        },
      ],
      summary: {
        total: 49700,
        average: 7100,
        highest: {
          period: 'Day 10',
          amount: 8500
        },
        lowest: {
          period: 'Day 1',
          amount: 5000
        }
      }
    };
  }
  
  res.status(200).json(spendingTimelineData);
});

/**
 * @route GET /api/reports/progress-timeline
 * @desc Get project progress timeline report data
 * @access Private
 */
router.get('/progress-timeline', authenticate, (req: Request, res: Response) => {
  // Get date range from query params, default to 'month'
  const range = req.query.range || 'month';
  
  // In a real app, this would fetch project progress data from database based on the range
  
  // Mock data
  const progressTimelineData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    datasets: [
      {
        label: 'Office Building',
        data: [10, 25, 38, 52, 65, 78, 85, 92, 100, 100, 100, 100],
        borderColor: '#3B82F6',
        backgroundColor: 'rgba(59, 130, 246, 0.5)',
        tension: 0.4,
      },
      {
        label: 'Residential Complex',
        data: [0, 0, 5, 12, 20, 28, 35, 42, 50, 58, 65, 72],
        borderColor: '#10B981',
        backgroundColor: 'rgba(16, 185, 129, 0.5)',
        tension: 0.4,
      },
      {
        label: 'Shopping Center',
        data: [0, 0, 0, 0, 5, 15, 30, 45, 52, 60, 68, 75],
        borderColor: '#F97316',
        backgroundColor: 'rgba(249, 115, 22, 0.5)',
        tension: 0.4,
      },
    ],
    summary: {
      projects: [
        {
          name: 'Office Building',
          currentProgress: 100,
          status: 'completed',
          completedAt: '2023-09-15'
        },
        {
          name: 'Residential Complex',
          currentProgress: 72,
          status: 'in_progress',
          estimatedCompletion: '2024-03-20'
        },
        {
          name: 'Shopping Center',
          currentProgress: 75,
          status: 'in_progress',
          estimatedCompletion: '2024-01-10'
        }
      ]
    }
  };
  
  res.status(200).json(progressTimelineData);
});

/**
 * @route GET /api/reports/performance
 * @desc Get worker performance report data
 * @access Private (admin only)
 */
router.get('/performance', authenticate, isAdmin, (req: Request, res: Response) => {
  // In a real app, this would fetch worker performance data from database
  const performanceData = {
    labels: ['John Smith', 'Sarah Davis', 'Michael Johnson', 'David Wilson', 'Emily Clark'],
    datasets: [
      {
        label: 'Tasks Completed',
        data: [45, 38, 42, 31, 36],
        backgroundColor: '#3B82F6',
      },
      {
        label: 'On-Time Completion Rate (%)',
        data: [95, 85, 92, 88, 90],
        backgroundColor: '#10B981',
      },
    ],
    summary: {
      topPerformer: 'John Smith',
      lowestPerformer: 'David Wilson',
      averageTasksCompleted: 38.4,
      averageOnTimeRate: 90
    }
  };
  
  res.status(200).json(performanceData);
});

export default router; 