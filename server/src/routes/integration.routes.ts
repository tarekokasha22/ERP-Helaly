import express, { Request, Response } from 'express';
import { authenticate } from '../middlewares/auth.middleware';
import jsonStorage from '../storage/jsonStorage';

const router = express.Router();

/**
 * @route GET /api/integration/project/:projectId/full-expenses
 * @desc Get comprehensive project expenses including inventory, payments, and salaries
 * @access Private
 */
router.get('/project/:projectId/full-expenses', authenticate, async (req: Request, res: Response) => {
    try {
        const userCountry = (req.user as any)?.country || 'egypt';
        const { projectId } = req.params;

        // Get the project first
        const projects = await jsonStorage.getProjects(userCountry);
        const project = projects.find(p => p._id === projectId);

        if (!project) {
            return res.status(404).json({
                success: false,
                error: 'Project not found'
            });
        }

        // Get full expenses using the integrated method
        const expenses = await jsonStorage.getProjectFullExpenses(userCountry, projectId);

        res.status(200).json({
            success: true,
            data: {
                project: {
                    id: project._id,
                    name: project.name,
                    budget: project.budget,
                    status: project.status
                },
                expenses: {
                    directSpendings: expenses.directSpendings,
                    inventoryCosts: expenses.inventoryCosts,
                    paymentsCosts: expenses.projectPayments,
                    salaryCosts: expenses.salaryCosts,
                    totalExpenses: expenses.totalExpenses,
                    remainingBudget: project.budget - expenses.totalExpenses,
                    budgetUtilization: project.budget > 0
                        ? ((expenses.totalExpenses / project.budget) * 100).toFixed(1)
                        : 0
                },
                breakdown: {
                    spendingsCount: expenses.details.spendings.length,
                    inventoryItemsCount: expenses.details.inventory.length,
                    paymentsCount: expenses.details.payments.length,
                    employeesCount: expenses.details.employees.length
                },
                details: expenses.details
            }
        });
    } catch (error) {
        console.error('Error fetching project full expenses:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch project expenses'
        });
    }
});

/**
 * @route GET /api/integration/project/:projectId/inventory
 * @desc Get all inventory items for a specific project
 * @access Private
 */
router.get('/project/:projectId/inventory', authenticate, async (req: Request, res: Response) => {
    try {
        const userCountry = (req.user as any)?.country || 'egypt';
        const { projectId } = req.params;

        const inventory = await jsonStorage.getInventoryByProject(userCountry, projectId);
        const totalValue = inventory.reduce((sum, item) => sum + (item.totalValue || 0), 0);

        res.status(200).json({
            success: true,
            data: {
                items: inventory,
                count: inventory.length,
                totalValue
            }
        });
    } catch (error) {
        console.error('Error fetching project inventory:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch project inventory'
        });
    }
});

/**
 * @route GET /api/integration/section/:sectionId/costs
 * @desc Get comprehensive section costs including employees and spendings
 * @access Private
 */
router.get('/section/:sectionId/costs', authenticate, async (req: Request, res: Response) => {
    try {
        const userCountry = (req.user as any)?.country || 'egypt';
        const { sectionId } = req.params;

        // Get section first
        const sections = await jsonStorage.getSections(userCountry);
        const section = sections.find(s => s._id === sectionId);

        if (!section) {
            return res.status(404).json({
                success: false,
                error: 'Section not found'
            });
        }

        // Get full costs
        const costs = await jsonStorage.getSectionFullCosts(userCountry, sectionId);

        res.status(200).json({
            success: true,
            data: {
                section: {
                    id: section._id,
                    name: section.name,
                    projectId: section.projectId,
                    budget: section.budget,
                    progress: section.progress
                },
                costs: {
                    spendings: costs.spendings,
                    salaryCosts: costs.salaryCosts,
                    totalCosts: costs.totalCosts,
                    remainingBudget: (section.budget || 0) - costs.totalCosts
                },
                employees: costs.employees.map(emp => ({
                    id: emp._id,
                    name: emp.name,
                    position: emp.position,
                    employeeType: emp.employeeType,
                    salary: emp.employeeType === 'monthly' ? emp.monthlySalary : emp.dailyRate
                }))
            }
        });
    } catch (error) {
        console.error('Error fetching section costs:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch section costs'
        });
    }
});

/**
 * @route GET /api/integration/section/:sectionId/employees
 * @desc Get all employees assigned to a section
 * @access Private
 */
router.get('/section/:sectionId/employees', authenticate, async (req: Request, res: Response) => {
    try {
        const userCountry = (req.user as any)?.country || 'egypt';
        const { sectionId } = req.params;

        const employees = await jsonStorage.getEmployeesBySection(userCountry, sectionId);

        res.status(200).json({
            success: true,
            data: employees,
            count: employees.length
        });
    } catch (error) {
        console.error('Error fetching section employees:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch section employees'
        });
    }
});

/**
 * @route GET /api/integration/dashboard
 * @desc Get comprehensive dashboard data with all integrations
 * @access Private
 */
router.get('/dashboard', authenticate, async (req: Request, res: Response) => {
    try {
        const userCountry = (req.user as any)?.country || 'egypt';

        // Get all data
        const projects = await jsonStorage.getProjects(userCountry);
        const sections = await jsonStorage.getSections(userCountry);
        const spendings = await jsonStorage.getSpendings(userCountry);
        const employees = await jsonStorage.getEmployees(userCountry);
        const payments = await jsonStorage.getPayments(userCountry);
        const inventory = await jsonStorage.getInventory(userCountry);

        // Calculate comprehensive totals
        const totalBudget = projects.reduce((sum, p) => sum + (p.budget || 0), 0);
        const directSpendings = spendings.reduce((sum, s) => sum + (s.amount || 0), 0);
        const inventoryCosts = inventory.reduce((sum, i) => sum + (i.totalValue || 0), 0);
        const paymentsCosts = payments.reduce((sum, p) => sum + (p.amount || 0), 0);

        // Calculate salary costs
        let salaryCosts = 0;
        for (const emp of employees) {
            if (emp.active) {
                if (emp.employeeType === 'monthly' && emp.monthlySalary) {
                    salaryCosts += emp.monthlySalary;
                } else if (emp.employeeType === 'daily' && emp.dailyRate) {
                    salaryCosts += emp.dailyRate * 22;
                }
            }
        }

        // Total comprehensive expenses
        const totalExpenses = directSpendings + inventoryCosts + paymentsCosts;

        res.status(200).json({
            success: true,
            data: {
                overview: {
                    totalBudget,
                    totalExpenses,
                    remainingBudget: totalBudget - totalExpenses,
                    budgetUtilization: totalBudget > 0 ? ((totalExpenses / totalBudget) * 100).toFixed(1) : 0
                },
                projects: {
                    total: projects.length,
                    completed: projects.filter(p => p.status === 'completed').length,
                    inProgress: projects.filter(p => p.status === 'in_progress').length,
                    notStarted: projects.filter(p => p.status === 'planning').length
                },
                sections: {
                    total: sections.length,
                    avgProgress: sections.length > 0
                        ? (sections.reduce((sum, s) => sum + (s.progress || 0), 0) / sections.length).toFixed(1)
                        : 0
                },
                employees: {
                    total: employees.length,
                    active: employees.filter(e => e.active).length,
                    monthlySalaryCosts: salaryCosts
                },
                inventory: {
                    totalItems: inventory.length,
                    totalValue: inventoryCosts,
                    lowStock: inventory.filter(i => i.status === 'low_stock').length,
                    outOfStock: inventory.filter(i => i.status === 'out_of_stock').length
                },
                payments: {
                    total: payments.length,
                    totalAmount: paymentsCosts
                },
                expenseBreakdown: {
                    directSpendings,
                    inventoryCosts,
                    paymentsCosts,
                    salaryCosts
                }
            },
            generatedAt: new Date().toISOString()
        });
    } catch (error) {
        console.error('Error fetching dashboard data:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch dashboard data'
        });
    }
});

export default router;
