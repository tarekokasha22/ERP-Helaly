import express, { Request, Response } from 'express';
import { authenticate, isAdmin } from '../middlewares/auth.middleware';
import { countryMiddleware } from '../middlewares/country.middleware';
import jsonStorage from '../storage/jsonStorage';

const router = express.Router();

/**
 * @route GET /api/projects
 * @desc Get all projects
 * @access Private
 */
router.get('/', authenticate, countryMiddleware, async (req: Request, res: Response) => {
  try {
    const userCountry = req.userCountry;
    const projects = await jsonStorage.getProjects(userCountry);
    res.status(200).json({
      success: true,
      data: projects,
      count: projects.length
    });
  } catch (error: any) {
    console.error('Error fetching projects:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch projects',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * @route GET /api/projects/:id
 * @desc Get project by ID
 * @access Private
 */
router.get('/:id', authenticate, countryMiddleware, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userCountry = req.userCountry;
    
    // الحصول على جميع المشاريع الخاصة بالدولة
    const projects = await jsonStorage.getProjects(userCountry);
    const project = projects.find(p => p._id === id);
    
    if (!project) {
      return res.status(404).json({ 
        success: false, 
        message: 'المشروع غير موجود أو غير متاح لهذه الدولة' 
      });
    }
    
    // الحصول على أقسام المشروع
    const sections = await jsonStorage.getSections(userCountry, id);
    
    // الحصول على مصروفات المشروع
    const spendings = await jsonStorage.getSpendings(userCountry, id);
    
    // حساب إجمالي المصروفات
    const totalSpent = spendings.reduce((sum, spending) => sum + (spending.amount || 0), 0);
    
    // حساب متوسط التقدم من الأقسام
    const avgProgress = sections.length > 0 
      ? Math.round(sections.reduce((sum, section) => sum + (section.progress || 0), 0) / sections.length)
      : project.progress || 0;
    
    // إعداد الاستجابة مع بيانات مفصلة
    const projectDetails = {
      ...project,
      sections,
      spendings,
      totalSpent,
      remainingBudget: project.budget - totalSpent,
      actualProgress: avgProgress,
      sectionsCount: sections.length,
      spendingsCount: spendings.length
    };
    
    res.status(200).json({
      success: true,
      data: projectDetails
    });
  } catch (error: any) {
    console.error('خطأ في جلب تفاصيل المشروع:', error);
    res.status(500).json({ 
      success: false, 
      message: 'خطأ في جلب تفاصيل المشروع',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * @route POST /api/projects
 * @desc Create a new project
 * @access Private (admin only)
 */
router.post('/', authenticate, countryMiddleware, isAdmin, async (req: Request, res: Response) => {
  try {
    const projectData = req.body;
    
    // Validate required fields
    if (!projectData.name) {
      return res.status(400).json({ 
        success: false, 
        message: 'Project name is required' 
      });
    }
    
    // Country is automatically added by countryMiddleware
    const newProject = await jsonStorage.createProject(projectData);
    res.status(201).json({
      success: true,
      data: newProject,
      message: 'Project created successfully'
    });
  } catch (error: any) {
    console.error('Error creating project:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to create project',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * @route PUT /api/projects/:id
 * @desc Update a project
 * @access Private (admin only)
 */
router.put('/:id', authenticate, countryMiddleware, isAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    const userCountry = req.userCountry;
    
    // First, check if project exists and belongs to user's country
    const projects = await jsonStorage.getProjects(userCountry);
    const existingProject = projects.find(p => p._id === id);
    
    if (!existingProject) {
      return res.status(404).json({ 
        success: false, 
        message: 'Project not found in your branch' 
      });
    }
    
    const updatedProject = await jsonStorage.updateProject(id, updateData);
    
    res.status(200).json({
      success: true,
      data: updatedProject,
      message: 'Project updated successfully'
    });
  } catch (error: any) {
    console.error('Error updating project:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to update project',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * @route DELETE /api/projects/:id
 * @desc Delete a project
 * @access Private (admin only)
 */
router.delete('/:id', authenticate, countryMiddleware, isAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userCountry = req.userCountry;
    
    // First, check if project exists and belongs to user's country
    const projects = await jsonStorage.getProjects(userCountry);
    const existingProject = projects.find(p => p._id === id);
    
    if (!existingProject) {
      return res.status(404).json({ 
        success: false, 
        message: 'Project not found in your branch' 
      });
    }
    
    const deleted = await jsonStorage.deleteProject(id);
    
    res.status(200).json({ 
      success: true, 
      message: 'Project deleted successfully' 
    });
  } catch (error: any) {
    console.error('Error deleting project:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to delete project',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

export default router; 