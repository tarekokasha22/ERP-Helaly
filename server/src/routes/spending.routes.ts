import express, { Request, Response } from 'express';
import { authenticate, isAdmin } from '../middlewares/auth.middleware';
import { countryMiddleware } from '../middlewares/country.middleware';
import jsonStorage from '../storage/jsonStorage';

const router = express.Router();

/**
 * @route GET /api/spendings
 * @desc Get all spendings
 * @access Private
 */
router.get('/', authenticate, countryMiddleware, async (req: Request, res: Response) => {
  try {
    const userCountry = req.userCountry;
    const { projectId } = req.query;
    const spendings = await jsonStorage.getSpendings(userCountry, projectId as string);
    res.status(200).json({
      success: true,
      data: spendings,
      count: spendings.length
    });
  } catch (error: any) {
    console.error('Error fetching spendings:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch spendings',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * @route GET /api/spendings/mock
 * @desc Get mock spendings data
 * @access Private
 */
router.get('/mock', authenticate, (req: Request, res: Response) => {
  // Mock data for development
  const spendings = [
    {
      id: '1',
      projectId: '1',
      projectName: 'Office Building Renovation',
      sectionId: '1',
      sectionName: 'Structural Repairs',
      amount: 72500,
      category: 'Materials',
      description: 'Structural steel and concrete',
      date: '2023-08-05',
      approvedBy: 'John Smith'
    },
    {
      id: '2',
      projectId: '1',
      projectName: 'Office Building Renovation',
      sectionId: '1',
      sectionName: 'Structural Repairs',
      amount: 15000,
      category: 'Labor',
      description: 'Foundation repair labor',
      date: '2023-08-08',
      approvedBy: 'John Smith'
    },
    {
      id: '3',
      projectId: '1',
      projectName: 'Office Building Renovation',
      sectionId: '2',
      sectionName: 'Electrical System Upgrade',
      amount: 45000,
      category: 'Materials',
      description: 'Electrical panels and wiring',
      date: '2023-08-20',
      approvedBy: 'John Smith'
    },
    {
      id: '4',
      projectId: '1',
      projectName: 'Office Building Renovation',
      sectionId: '2',
      sectionName: 'Electrical System Upgrade',
      amount: 35000,
      category: 'Labor',
      description: 'Electrician labor',
      date: '2023-08-25',
      approvedBy: 'John Smith'
    },
    {
      id: '5',
      projectId: '2',
      projectName: 'Residential Complex',
      sectionId: '4',
      sectionName: 'Foundation Work',
      amount: 120000,
      category: 'Materials',
      description: 'Concrete and rebar',
      date: '2023-06-10',
      approvedBy: 'Sarah Johnson'
    },
    {
      id: '6',
      projectId: '2',
      projectName: 'Residential Complex',
      sectionId: '4',
      sectionName: 'Foundation Work',
      amount: 90000,
      category: 'Labor',
      description: 'Foundation laying labor',
      date: '2023-06-15',
      approvedBy: 'Sarah Johnson'
    },
    {
      id: '7',
      projectId: '2',
      projectName: 'Residential Complex',
      sectionId: '5',
      sectionName: 'Steel Framework',
      amount: 200000,
      category: 'Materials',
      description: 'Structural steel',
      date: '2023-07-05',
      approvedBy: 'Sarah Johnson'
    }
  ];
  
  res.status(200).json(spendings);
});

/**
 * @route GET /api/spendings/project/:projectId
 * @desc Get spendings for a specific project
 * @access Private
 */
router.get('/project/:projectId', authenticate, (req: Request, res: Response) => {
  // In a real app, this would fetch spendings for a project from database
  const allSpendings = [
    {
      id: '1',
      projectId: '1',
      projectName: 'Office Building Renovation',
      sectionId: '1',
      sectionName: 'Structural Repairs',
      amount: 72500,
      category: 'Materials',
      description: 'Structural steel and concrete',
      date: '2023-08-05',
      approvedBy: 'John Smith'
    },
    {
      id: '2',
      projectId: '1',
      projectName: 'Office Building Renovation',
      sectionId: '1',
      sectionName: 'Structural Repairs',
      amount: 15000,
      category: 'Labor',
      description: 'Foundation repair labor',
      date: '2023-08-08',
      approvedBy: 'John Smith'
    },
    {
      id: '3',
      projectId: '1',
      projectName: 'Office Building Renovation',
      sectionId: '2',
      sectionName: 'Electrical System Upgrade',
      amount: 45000,
      category: 'Materials',
      description: 'Electrical panels and wiring',
      date: '2023-08-20',
      approvedBy: 'John Smith'
    },
    {
      id: '5',
      projectId: '2',
      projectName: 'Residential Complex',
      sectionId: '4',
      sectionName: 'Foundation Work',
      amount: 120000,
      category: 'Materials',
      description: 'Concrete and rebar',
      date: '2023-06-10',
      approvedBy: 'Sarah Johnson'
    }
  ];
  
  const spendings = allSpendings.filter(s => s.projectId === req.params.projectId);
  
  res.status(200).json(spendings);
});

/**
 * @route GET /api/spendings/section/:sectionId
 * @desc Get spendings for a specific section
 * @access Private
 */
router.get('/section/:sectionId', authenticate, (req: Request, res: Response) => {
  // In a real app, this would fetch spendings for a section from database
  const allSpendings = [
    {
      id: '1',
      projectId: '1',
      projectName: 'Office Building Renovation',
      sectionId: '1',
      sectionName: 'Structural Repairs',
      amount: 72500,
      category: 'Materials',
      description: 'Structural steel and concrete',
      date: '2023-08-05',
      approvedBy: 'John Smith'
    },
    {
      id: '2',
      projectId: '1',
      projectName: 'Office Building Renovation',
      sectionId: '1',
      sectionName: 'Structural Repairs',
      amount: 15000,
      category: 'Labor',
      description: 'Foundation repair labor',
      date: '2023-08-08',
      approvedBy: 'John Smith'
    }
  ];
  
  const spendings = allSpendings.filter(s => s.sectionId === req.params.sectionId);
  
  res.status(200).json(spendings);
});

/**
 * @route POST /api/spendings
 * @desc Record a new spending
 * @access Private (admin only)
 */
router.post('/', authenticate, countryMiddleware, isAdmin, async (req: Request, res: Response) => {
  try {
    const spendingData = req.body;
    
    // Validate required fields
    if (!spendingData.amount || !spendingData.projectId || !spendingData.category) {
      return res.status(400).json({ 
        success: false, 
        message: 'Amount, project ID, and category are required' 
      });
    }
    
    // Country is automatically added by countryMiddleware
    const newSpending = await jsonStorage.createSpending(spendingData);
    res.status(201).json({
      success: true,
      data: newSpending,
      message: 'Spending recorded successfully'
    });
  } catch (error: any) {
    console.error('Error creating spending:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to record spending',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * @route PUT /api/spendings/:id
 * @desc Update a spending record
 * @access Private (admin only)
 */
router.put('/:id', authenticate, countryMiddleware, isAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    const userCountry = req.userCountry;
    
    // First, check if spending exists and belongs to user's country
    const spendings = await jsonStorage.getSpendings(userCountry);
    const existingSpending = spendings.find(s => s._id === id);
    
    if (!existingSpending) {
      return res.status(404).json({ 
        success: false, 
        message: 'Spending record not found in your branch' 
      });
    }
    
    const updatedSpending = await jsonStorage.updateSpending(id, updateData);
    
    res.status(200).json({
      success: true,
      data: updatedSpending,
      message: 'Spending record updated successfully'
    });
  } catch (error: any) {
    console.error('Error updating spending:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to update spending record',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * @route DELETE /api/spendings/:id
 * @desc Delete a spending record
 * @access Private (admin only)
 */
router.delete('/:id', authenticate, countryMiddleware, isAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userCountry = req.userCountry;
    
    // First, check if spending exists and belongs to user's country
    const spendings = await jsonStorage.getSpendings(userCountry);
    const existingSpending = spendings.find(s => s._id === id);
    
    if (!existingSpending) {
      return res.status(404).json({ 
        success: false, 
        message: 'Spending record not found in your branch' 
      });
    }
    
    const deleted = await jsonStorage.deleteSpending(id);
    
    res.status(200).json({ 
      success: true, 
      message: 'Spending record deleted successfully' 
    });
  } catch (error: any) {
    console.error('Error deleting spending:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to delete spending record',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

export default router; 