import express, { Request, Response } from 'express';
import { authenticate, isAdmin } from '../middlewares/auth.middleware';
import { countryMiddleware } from '../middlewares/country.middleware';
import jsonStorage from '../storage/jsonStorage';

const router = express.Router();

/**
 * @route GET /api/sections
 * @desc Get all sections
 * @access Private
 */
router.get('/', authenticate, countryMiddleware, async (req: Request, res: Response) => {
  try {
    const userCountry = req.userCountry;
    const { projectId } = req.query;
    const sections = await jsonStorage.getSections(userCountry, projectId as string);

    // Map _id to id for frontend compatibility
    const sectionsWithId = sections.map(s => ({
      ...s,
      id: s._id  // Add id field for frontend
    }));

    res.status(200).json({
      success: true,
      data: sectionsWithId,
      count: sections.length
    });
  } catch (error: any) {
    console.error('Error fetching sections:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch sections',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * @route GET /api/sections/mock
 * @desc Get mock sections data
 * @access Private
 */
router.get('/mock', authenticate, (req: Request, res: Response) => {
  // Mock data for development
  const sections = [
    {
      id: '1',
      name: 'أعمال الحفر والتسوية',
      description: 'حفر وتسوية الأرض للطريق وإزالة العوائق',
      projectId: '1',
      projectName: 'طريق القاهرة - الإسكندرية الصحراوي',
      status: 'in_progress',
      assignedTo: 'أحمد محمد علي',
      targetQuantity: 30,
      completedQuantity: 18,
      progress: 60
    },
    {
      id: '2',
      name: 'أعمال الردم والضغط',
      description: 'ردم الطريق بالمواد المناسبة وضغطها حسب المواصفات',
      projectId: '1',
      projectName: 'طريق القاهرة - الإسكندرية الصحراوي',
      status: 'in_progress',
      assignedTo: 'محمود السيد',
      targetQuantity: 25,
      completedQuantity: 7,
      progress: 28
    },
    {
      id: '3',
      name: 'أعمال الحفر والتنقيب',
      description: 'حفر وتنقيب الطريق الساحلي مع مراعاة الظروف الجيولوجية',
      projectId: '2',
      projectName: 'طريق الساحل الشمالي الجديد',
      status: 'in_progress',
      assignedTo: 'سارة أحمد حسن',
      targetQuantity: 60,
      completedQuantity: 18,
      progress: 30
    },
    {
      id: '4',
      name: 'أعمال الطبقة الأساسية',
      description: 'ردم وإنشاء الطبقة الأساسية للطريق الساحلي',
      projectId: '2',
      projectName: 'طريق الساحل الشمالي الجديد',
      status: 'in_progress',
      assignedTo: 'علي حسن',
      targetQuantity: 60,
      completedQuantity: 18,
      progress: 30
    },
    {
      id: '5',
      name: 'أعمال الحفر الأساسية',
      description: 'حفر وإعداد الطرق الداخلية لمدينة العبور',
      projectId: '4',
      projectName: 'طريق مدينة العبور الداخلي',
      status: 'completed',
      assignedTo: 'فاطمة الزهراء',
      targetQuantity: 25,
      completedQuantity: 25,
      progress: 100
    },
    {
      id: '6',
      name: 'Site Preparation',
      description: 'Clearing and preparing the shopping center site',
      projectId: '3',
      projectName: 'Shopping Center',
      status: 'completed',
      assignedTo: 'Linda Anderson',
      progress: 100
    },
    {
      id: '7',
      name: 'Excavation',
      description: 'Excavation work for the shopping center foundation',
      projectId: '3',
      projectName: 'Shopping Center',
      status: 'in_progress',
      assignedTo: 'Richard White',
      progress: 85
    }
  ];

  res.status(200).json(sections);
});

/**
 * @route GET /api/sections/:id
 * @desc Get section by ID
 * @access Private
 */
router.get('/:id', authenticate, countryMiddleware, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userCountry = req.userCountry;

    // الحصول على جميع الأقسام الخاصة بالدولة
    const sections = await jsonStorage.getSections(userCountry);
    const section = sections.find(s => s._id === id);

    if (!section) {
      return res.status(404).json({
        success: false,
        message: 'القسم غير موجود أو غير متاح لهذه الدولة'
      });
    }

    // الحصول على بيانات المشروع الخاص بهذا القسم
    const projects = await jsonStorage.getProjects(userCountry);
    const project = projects.find(p => p._id === section.projectId);

    // الحصول على مصروفات هذا القسم
    const allSpendings = await jsonStorage.getSpendings(userCountry);
    const sectionSpendings = allSpendings.filter(s => s.sectionId === id);

    // حساب إجمالي المصروفات
    const totalSpent = sectionSpendings.reduce((sum, spending) => sum + (spending.amount || 0), 0);

    // إعداد الاستجابة مع بيانات مفصلة
    const spendingsWithId = sectionSpendings.map(s => ({ ...s, id: s._id }));

    const sectionDetails = {
      ...section,
      id: section._id,  // Add id field for frontend
      projectName: project?.name || 'غير محدد',
      spendings: spendingsWithId,
      totalSpent,
      remainingBudget: (section.budget || 0) - totalSpent,
      spendingsCount: sectionSpendings.length
    };

    res.status(200).json({
      success: true,
      data: sectionDetails
    });
  } catch (error: any) {
    console.error('خطأ في جلب تفاصيل القسم:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في جلب تفاصيل القسم',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * @route GET /api/sections/project/:projectId
 * @desc Get sections by project ID
 * @access Private
 */
router.get('/project/:projectId', authenticate, (req: Request, res: Response) => {
  // In a real app, this would fetch sections for a project from database
  const allSections = [
    {
      id: '1',
      name: 'Structural Repairs',
      description: 'Repair damaged foundation and structural elements',
      projectId: '1',
      projectName: 'Office Building Renovation',
      status: 'completed',
      assignedTo: 'Michael Johnson',
      progress: 100
    },
    {
      id: '2',
      name: 'Electrical System Upgrade',
      description: 'Modernize electrical systems and wiring',
      projectId: '1',
      projectName: 'Office Building Renovation',
      status: 'in_progress',
      assignedTo: 'Sarah Davis',
      progress: 65
    },
    {
      id: '3',
      name: 'Plumbing Modernization',
      description: 'Replace old plumbing with new efficient systems',
      projectId: '1',
      projectName: 'Office Building Renovation',
      status: 'in_progress',
      assignedTo: 'Robert Wilson',
      progress: 40
    },
    {
      id: '4',
      name: 'Foundation Work',
      description: 'Laying foundation for the residential complex',
      projectId: '2',
      projectName: 'Residential Complex',
      status: 'completed',
      assignedTo: 'David Thompson',
      progress: 100
    },
    {
      id: '5',
      name: 'Steel Framework',
      description: 'Erecting steel framework for the residential complex',
      projectId: '2',
      projectName: 'Residential Complex',
      status: 'in_progress',
      assignedTo: 'James Miller',
      progress: 60
    }
  ];

  const sections = allSections.filter(s => s.projectId === req.params.projectId);

  res.status(200).json(sections);
});

/**
 * @route POST /api/sections
 * @desc Create a new section
 * @access Private (admin only)
 */
router.post('/', authenticate, countryMiddleware, isAdmin, async (req: Request, res: Response) => {
  try {
    const sectionData = req.body;

    // Validate required fields
    if (!sectionData.name || !sectionData.projectId) {
      return res.status(400).json({
        success: false,
        message: 'Section name and project ID are required'
      });
    }

    // Country is automatically added by countryMiddleware
    const newSection = await jsonStorage.createSection(sectionData);
    res.status(201).json({
      success: true,
      data: newSection,
      message: 'Section created successfully'
    });
  } catch (error: any) {
    console.error('Error creating section:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create section',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * @route PUT /api/sections/:id
 * @desc Update a section
 * @access Private (admin only)
 */
router.put('/:id', authenticate, countryMiddleware, isAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    const userCountry = req.userCountry;

    // First, check if section exists and belongs to user's country
    const sections = await jsonStorage.getSections(userCountry);
    const existingSection = sections.find(s => s._id === id);

    if (!existingSection) {
      return res.status(404).json({
        success: false,
        message: 'Section not found in your branch'
      });
    }

    const updatedSection = await jsonStorage.updateSection(id, updateData);

    res.status(200).json({
      success: true,
      data: updatedSection,
      message: 'Section updated successfully'
    });
  } catch (error: any) {
    console.error('Error updating section:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update section',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * @route DELETE /api/sections/:id
 * @desc Delete a section
 * @access Private (admin only)
 */
router.delete('/:id', authenticate, countryMiddleware, isAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userCountry = req.userCountry;

    // First, check if section exists and belongs to user's country
    const sections = await jsonStorage.getSections(userCountry);
    const existingSection = sections.find(s => s._id === id);

    if (!existingSection) {
      return res.status(404).json({
        success: false,
        message: 'Section not found in your branch'
      });
    }

    const deleted = await jsonStorage.deleteSection(id);

    res.status(200).json({
      success: true,
      message: 'Section deleted successfully'
    });
  } catch (error: any) {
    console.error('Error deleting section:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete section',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

export default router; 