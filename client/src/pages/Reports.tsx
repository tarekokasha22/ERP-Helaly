import React, { useState, useRef, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  PointElement,
  LineElement
} from 'chart.js';
import { Bar, Pie, Line } from 'react-chartjs-2';
import {
  ArrowDownTrayIcon,
  ChartBarIcon,
  PresentationChartLineIcon,
  DocumentTextIcon,
  BuildingOfficeIcon,
  CurrencyDollarIcon,
  UsersIcon,
  CalendarDaysIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import { mockGetProjects, mockGetSections, mockGetSpendings, mockGetEmployees, mockGetPayments, mockGetInventoryItems } from '../services/mockApi';
import { useLanguage } from '../contexts/LanguageContext';
import { useCurrency } from '../contexts/CurrencyContext';
import { useCountry } from '../contexts/CountryContext';
import { toast } from 'react-toastify';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import html2canvas from 'html2canvas';

// Register ChartJS components
ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  PointElement,
  LineElement
);

type ReportType = 'overview' | 'financial' | 'projects' | 'sections' | 'inventory' | 'employees' | 'payments';

const Reports: React.FC = () => {
  const [reportType, setReportType] = useState<ReportType>('overview');
  const [dateRange, setDateRange] = useState<'month' | 'quarter' | 'half_year' | 'year'>('month');
  const [selectedProject, setSelectedProject] = useState<string>('all');
  const [filterBy, setFilterBy] = useState<'date' | 'project'>('project');
  const { t, language, dir, formatDate } = useLanguage();
  const { formatMoney } = useCurrency();
  const { country } = useCountry();
  const chartRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();
  const isRtl = language === 'ar';

  // Translation dictionary for all UI strings
  const tr = {
    pageTitle: isRtl ? 'تقارير النظام' : 'System Reports',
    pageSubtitle: isRtl ? 'تحليلات وإحصائيات شاملة' : 'Comprehensive analytics and statistics',
    downloadPdf: isRtl ? 'تحميل PDF' : 'Download PDF',
    loadingReports: isRtl ? 'جارٍ تحميل التقارير...' : 'Loading reports...',
    reportSettings: isRtl ? 'إعدادات التقرير' : 'Report Settings',
    filterBy: isRtl ? 'تصفية حسب' : 'Filter By',
    byDate: isRtl ? 'حسب التاريخ' : 'By Date',
    byProject: isRtl ? 'حسب المشروع' : 'By Project',
    timePeriod: isRtl ? 'الفترة الزمنية' : 'Time Period',
    oneMonth: isRtl ? 'شهر واحد' : 'One Month',
    threeMonths: isRtl ? '3 أشهر' : '3 Months',
    sixMonths: isRtl ? '6 أشهر' : '6 Months',
    fullYear: isRtl ? 'سنة كاملة' : 'Full Year',
    projectLabel: isRtl ? 'المشروع' : 'Project',
    allProjects: isRtl ? 'جميع المشاريع' : 'All Projects',
    overviewTab: isRtl ? 'نظرة عامة' : 'Overview',
    financialTab: isRtl ? 'التقرير المالي' : 'Financial Report',
    projectsTab: isRtl ? 'تقرير المشاريع' : 'Projects Report',
    sectionsTab: isRtl ? 'تقرير الأقسام' : 'Sections Report',
    inventoryTab: isRtl ? 'تقرير المخزون' : 'Inventory Report',
    employeesTab: isRtl ? 'تقرير الموظفين' : 'Employees Report',
    paymentsTab: isRtl ? 'تقرير المدفوعات' : 'Payments Report',
    // Dashboard cards
    totalBudget: isRtl ? 'إجمالي الميزانية' : 'Total Budget',
    totalExpenses: isRtl ? 'إجمالي المصروفات' : 'Total Expenses',
    totalProjects: isRtl ? 'إجمالي المشاريع' : 'Total Projects',
    totalSections: isRtl ? 'إجمالي الأقسام' : 'Total Sections',
    employeesCard: isRtl ? 'الموظفون' : 'Employees',
    inventoryValue: isRtl ? 'قيمة المخزون' : 'Inventory Value',
    // Status
    completedStatus: isRtl ? 'مكتمل' : 'Completed',
    inProgressStatus: isRtl ? 'قيد التنفيذ' : 'In Progress',
    notStartedStatus: isRtl ? 'لم يبدأ' : 'Not Started',
    activeLabel: isRtl ? 'نشط' : 'active',
    completedLabel: isRtl ? 'مكتمل' : 'completed',
    itemsLabel: isRtl ? 'عنصر' : 'items',
    lowLabel: isRtl ? 'منخفض' : 'low',
    remainingLabel: isRtl ? 'متبقي' : 'remaining',
    monthlyLabel: isRtl ? 'شهري' : 'monthly',
    // Charts
    expenses: isRtl ? 'المصروفات' : 'Expenses',
    remaining: isRtl ? 'المتبقي' : 'Remaining',
    materials: isRtl ? 'مواد' : 'Materials',
    labor: isRtl ? 'عمالة' : 'Labor',
    equipment: isRtl ? 'معدات' : 'Equipment',
    consulting: isRtl ? 'استشارات' : 'Consulting',
    other: isRtl ? 'أخرى' : 'Other',
    progressChart: isRtl ? 'التقدم' : 'Progress',
    tools: isRtl ? 'أدوات' : 'Tools',
    consumables: isRtl ? 'مستهلكات' : 'Consumables',
    inStock: isRtl ? 'متوفر' : 'In Stock',
    lowStock: isRtl ? 'مخزون منخفض' : 'Low Stock',
    outOfStock: isRtl ? 'نفد المخزون' : 'Out of Stock',
    // Project report
    projectStatusTitle: isRtl ? 'حالة المشاريع' : 'Project Status',
    budgetUtilization: isRtl ? 'استخدام الميزانية' : 'Budget Utilization',
    projectsSummary: isRtl ? 'ملخص المشاريع' : 'Projects Summary',
    projectNameHeader: isRtl ? 'اسم المشروع' : 'Project Name',
    statusHeader: isRtl ? 'الحالة' : 'Status',
    progressHeader: isRtl ? 'التقدم' : 'Progress',
    budgetHeader: isRtl ? 'الميزانية' : 'Budget',
    // Financial report
    expensesByCategory: isRtl ? 'المصروفات حسب الفئة' : 'Expenses by Category',
    comprehensiveFinancial: isRtl ? 'ملخص مالي شامل' : 'Comprehensive Financial Summary',
    remainingAmount: isRtl ? 'المبلغ المتبقي' : 'Remaining Amount',
    utilizationRate: isRtl ? 'نسبة الاستخدام' : 'Utilization Rate',
    financialHealth: isRtl ? 'مؤشر الصحة المالية' : 'Financial Health Indicator',
    excellent: isRtl ? 'ممتاز' : 'Excellent',
    good: isRtl ? 'جيد' : 'Good',
    warningLabel: isRtl ? 'تحذير' : 'Warning',
    healthExcellent: isRtl ? 'الميزانية تحت السيطرة ومرونة مالية جيدة' : 'Budget is under control with good financial flexibility',
    healthGood: isRtl ? 'الميزانية ضمن النطاق الطبيعي، مراقبة مستمرة مطلوبة' : 'Budget is within normal range, continuous monitoring required',
    healthWarning: isRtl ? 'تجاوزت الميزانية الحد الآمن، مراجعة فورية مطلوبة' : 'Budget has exceeded safe limit, immediate review required',
    detailedLog: isRtl ? 'سجل المصروفات التفصيلي' : 'Detailed Expenses Log',
    expenseDate: isRtl ? 'تاريخ المصروف' : 'Expense Date',
    sectionHeader: isRtl ? 'القسم' : 'Section',
    categoryHeader: isRtl ? 'الفئة' : 'Category',
    descriptionHeader: isRtl ? 'الوصف' : 'Description',
    amountPaid: isRtl ? 'المبلغ المدفوع' : 'Amount Paid',
    unspecified: isRtl ? 'غير محدد' : 'Unspecified',
    showingFirst20: (total: number) => isRtl ? `عرض أول ٢٠ من ${total} مصروف` : `Showing first 20 of ${total} expenses`,
    autoRefresh: isRtl ? '📊 تحديث تلقائي نشط · آخر تحديث:' : '📊 Auto-refresh active · Last update:',
    // Section report
    sectionsProgressTitle: isRtl ? 'تقدم الأقسام' : 'Sections Progress',
    sectionsDetails: isRtl ? 'تفاصيل الأقسام' : 'Sections Details',
    sectionNameHeader: isRtl ? 'اسم القسم' : 'Section Name',
    managerHeader: isRtl ? 'المسؤول' : 'Manager',
    employeesHeader: isRtl ? 'الموظفون' : 'Employees',
    // Inventory report
    inventoryByCategoryTitle: isRtl ? 'المخزون حسب الفئة' : 'Inventory by Category',
    inventoryStatusTitle: isRtl ? 'حالة المخزون' : 'Inventory Status',
    inventorySummary: isRtl ? 'ملخص المخزون' : 'Inventory Summary',
    totalItems: isRtl ? 'إجمالي العناصر' : 'Total Items',
    totalValue: isRtl ? 'إجمالي القيمة' : 'Total Value',
    itemNameHeader: isRtl ? 'اسم العنصر' : 'Item Name',
    availableQuantity: isRtl ? 'الكمية المتاحة' : 'Available Quantity',
    inventoryStatusHeader: isRtl ? 'حالة المخزون' : 'Inventory Status',
    // Employees report
    employeesByType: isRtl ? 'الموظفون حسب النوع' : 'Employees by Type',
    monthlyEmployeesChart: isRtl ? 'موظفون شهريون' : 'Monthly Employees',
    dailyWorkersChart: isRtl ? 'عمال يومية' : 'Daily Workers',
    employeesStatusTitle: isRtl ? 'حالة الموظفين' : 'Employees Status',
    activeChartLabel: isRtl ? 'نشط' : 'Active',
    inactiveChartLabel: isRtl ? 'غير نشط' : 'Inactive',
    employeesSummary: isRtl ? 'ملخص الموظفين' : 'Employees Summary',
    totalEmployees: isRtl ? 'إجمالي الموظفين' : 'Total Employees',
    activeEmployees: isRtl ? 'الموظفون النشطون' : 'Active Employees',
    monthlyEmployeesLabel: isRtl ? 'موظفون شهريون' : 'Monthly Employees',
    totalMonthlySalaries: isRtl ? 'إجمالي الرواتب الشهرية' : 'Total Monthly Salaries',
    totalPaymentsLabel: isRtl ? 'إجمالي المدفوعات' : 'Total Payments',
    nameHeader: isRtl ? 'الاسم' : 'Name',
    positionHeader: isRtl ? 'المنصب' : 'Position',
    typeHeader: isRtl ? 'النوع' : 'Type',
    salaryRateHeader: isRtl ? 'الراتب / المعدل' : 'Salary/Rate',
    totalPaymentsHeader: isRtl ? 'إجمالي المدفوعات' : 'Total Payments',
    statusTh: isRtl ? 'الحالة' : 'Status',
    monthlyType: isRtl ? 'شهري' : 'Monthly',
    dailyType: isRtl ? 'يومي' : 'Daily',
    activeEmployee: isRtl ? 'نشط' : 'Active',
    inactiveEmployee: isRtl ? 'غير نشط' : 'Inactive',
    // Payments report
    paymentsByType: isRtl ? 'المدفوعات حسب النوع' : 'Payments by Type',
    salariesChart: isRtl ? 'رواتب' : 'Salaries',
    advancesChart: isRtl ? 'سلف' : 'Advances',
    dailyChart: isRtl ? 'يومية' : 'Daily',
    loansChart: isRtl ? 'عهد' : 'Loans',
    onAccountChart: isRtl ? 'تحت الحساب' : 'On Account',
    paymentsByCurrency: isRtl ? 'المدفوعات حسب العملة' : 'Payments by Currency',
    egyptianPound: isRtl ? 'الجنيه المصري' : 'Egyptian Pound',
    usDollar: isRtl ? 'الدولار الأمريكي' : 'US Dollar',
    paymentsSummary: isRtl ? 'ملخص المدفوعات' : 'Payments Summary',
    numberOfPayments: isRtl ? 'عدد المدفوعات' : 'Number of Payments',
    totalAmountEGP: isRtl ? 'الإجمالي (جنيه مصري)' : 'Total Amount (EGP)',
    totalAmountUSD: isRtl ? 'الإجمالي (دولار)' : 'Total Amount (USD)',
    salaryPayments: isRtl ? 'مدفوعات الرواتب' : 'Salary Payments',
    employeeHeader: isRtl ? 'الموظف' : 'Employee',
    paymentTypeHeader: isRtl ? 'نوع الدفع' : 'Payment Type',
    amountHeader: isRtl ? 'المبلغ' : 'Amount',
    paymentMethodHeader: isRtl ? 'طريقة الدفع' : 'Payment Method',
    paymentDateHeader: isRtl ? 'تاريخ الدفع' : 'Payment Date',
    salaryType: isRtl ? 'راتب' : 'Salary',
    advanceType: isRtl ? 'سلفة' : 'Advance',
    dailyPayment: isRtl ? 'يومية' : 'Daily',
    loanType: isRtl ? 'عهدة' : 'Loan',
    onAccountType: isRtl ? 'تحت الحساب' : 'On Account',
    cashMethod: isRtl ? 'نقداً' : 'Cash',
    bankTransfer: isRtl ? 'تحويل بنكي' : 'Bank Transfer',
    checkMethod: isRtl ? 'شيك' : 'Check',
    otherMethod: isRtl ? 'أخرى' : 'Other',
    noPayments: isRtl ? 'لا توجد مدفوعات' : 'No payments found',
    unknownEmployee: isRtl ? 'غير معروف' : 'Unknown',
  };

  // Auto-refresh for financial reports
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (reportType === 'financial') {
      interval = setInterval(() => {
        queryClient.invalidateQueries(['projects']);
        queryClient.invalidateQueries(['sections']);
        queryClient.invalidateQueries(['spendings']);
      }, 5000);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [reportType, queryClient]);

  // Fetch real data from API
  const { data: projects = [], isLoading: projectsLoading } = useQuery(['projects'], async () => {
    return await mockGetProjects() as any;
  }, {
    staleTime: 1000,
    refetchInterval: reportType === 'financial' ? 5000 : false,
    refetchOnWindowFocus: true,
    refetchOnMount: true
  });

  const { data: sections = [], isLoading: sectionsLoading } = useQuery(['sections'], async () => {
    return await mockGetSections() as any;
  }, {
    staleTime: 1000,
    refetchInterval: reportType === 'financial' ? 5000 : false,
    refetchOnWindowFocus: true,
    refetchOnMount: true
  });

  const { data: spendings = [], isLoading: spendingsLoading } = useQuery(['spendings'], async () => {
    return await mockGetSpendings() as any;
  }, {
    staleTime: 1000,
    refetchInterval: reportType === 'financial' ? 5000 : false,
    refetchOnWindowFocus: true,
    refetchOnMount: true
  });

  const { data: inventory = [], isLoading: inventoryLoading } = useQuery(['inventory'], async () => {
    return await mockGetInventoryItems() as any;
  }, {
    staleTime: 1000,
    refetchOnMount: true
  });

  const { data: employees = [], isLoading: employeesLoading } = useQuery(['employees', country], async () => {
    if (!country) return [];
    return await mockGetEmployees(country) as any;
  }, {
    enabled: !!country,
    staleTime: 30000,
    refetchOnWindowFocus: true,
    refetchOnMount: true
  });

  const { data: payments = [], isLoading: paymentsLoading } = useQuery(['payments', country], async () => {
    if (!country) return [];
    return await mockGetPayments(country) as any;
  }, {
    enabled: !!country,
    staleTime: 30000,
    refetchOnWindowFocus: true,
    refetchOnMount: true
  });


  const isLoading = projectsLoading || sectionsLoading || spendingsLoading || inventoryLoading || employeesLoading || paymentsLoading;

  // Filter data based on selected criteria
  const getFilteredData = () => {
    let filteredProjects = projects;
    let filteredSections = sections;
    let filteredSpendings = spendings;
    let filteredInventory = inventory;
    let filteredEmployees = employees;
    let filteredPayments = payments;

    // Apply project filter
    if (filterBy === 'project' && selectedProject !== 'all') {
      filteredSpendings = spendings.filter(s => s.projectId === selectedProject);
      filteredSections = sections.filter(s => s.projectId === selectedProject);
      filteredProjects = projects.filter(p => (p._id || p.id) === selectedProject);
      filteredInventory = inventory.filter(i => i.projectId === selectedProject);

      // Filter employees by project or sections of this project
      const projectSectionIds = filteredSections.map(s => s._id || s.id);
      filteredEmployees = employees.filter(e =>
        e.projectId === selectedProject ||
        (e.sectionId && projectSectionIds.includes(e.sectionId))
      );

      // Filter payments by employees in this project or payments linked to project
      const projectEmployeeIds = filteredEmployees.map(e => e._id || e.id);
      filteredPayments = payments.filter(p =>
        p.projectId === selectedProject ||
        (p.employeeId && projectEmployeeIds.includes(p.employeeId))
      );
    }

    // Apply date filter with more accurate calculations
    if (filterBy === 'date') {
      const now = new Date();
      let startDate: Date;

      switch (dateRange) {
        case 'month':
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          break;
        case 'quarter':
          startDate = new Date(now.getFullYear(), now.getMonth() - 2, 1);
          break;
        case 'half_year':
          startDate = new Date(now.getFullYear(), now.getMonth() - 5, 1);
          break;
        case 'year':
          startDate = new Date(now.getFullYear(), 0, 1);
          break;
        default:
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      }

      const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);

      filteredSpendings = spendings.filter(s => {
        const spendingDate = new Date(s.date || s.createdAt);
        return spendingDate >= startDate && spendingDate <= endDate;
      });

      filteredProjects = projects.filter(p => {
        const projectStartDate = new Date(p.startDate || p.createdAt);
        const projectEndDate = p.endDate ? new Date(p.endDate) : new Date();
        return (projectStartDate <= endDate && projectEndDate >= startDate);
      });

      filteredSections = sections.filter(s => {
        const sectionDate = new Date(s.createdAt);
        return sectionDate >= startDate && sectionDate <= endDate;
      });

      filteredInventory = inventory.filter(i => {
        const inventoryDate = new Date(i.lastUpdated);
        return inventoryDate >= startDate && inventoryDate <= endDate;
      });

      // Filter payments by date
      filteredPayments = payments.filter(p => {
        const paymentDate = new Date(p.paymentDate || p.createdAt);
        return paymentDate >= startDate && paymentDate <= endDate;
      });

      // Filter employees by hire date (show employees hired on or before the end date)
      filteredEmployees = employees.filter(e => {
        const hireDate = new Date(e.hireDate || e.createdAt);
        return hireDate <= endDate;
      });
    }

    return {
      projects: filteredProjects,
      sections: filteredSections,
      spendings: filteredSpendings,
      inventory: filteredInventory,
      employees: filteredEmployees,
      payments: filteredPayments
    };
  };

  const filteredData = getFilteredData();

  // Calculate real statistics from actual data
  const calculateStats = () => {
    // Project statistics
    const totalProjects = filteredData.projects.length;
    const completedProjects = filteredData.projects.filter(p => p.status === 'completed').length;
    const inProgressProjects = filteredData.projects.filter(p => p.status === 'in_progress').length;
    const notStartedProjects = filteredData.projects.filter(p => p.status === 'not_started').length;

    // Budget statistics - COMPREHENSIVE including all sources
    const totalBudget = filteredData.projects.reduce((sum, p) => sum + (p.budget || 0), 0);
    const sectionsBudget = filteredData.sections.reduce((sum, s) => sum + (s.budget || 0), 0);
    const directSpending = filteredData.spendings.reduce((sum, s) => sum + (s.amount || 0), 0);

    // Inventory costs linked to projects (already included in spendings via auto-create)
    const totalInventoryValue = filteredData.inventory.reduce((sum, item) => sum + (item.totalValue || 0), 0);
    const inventoryLinkedToProjects = filteredData.inventory.filter(i => i.projectId).reduce((sum, item) => sum + (item.totalValue || 0), 0);

    // Payment totals
    const totalPayments = filteredData.payments.reduce((sum, p) => sum + (p.amount || 0), 0);
    const paymentsLinkedToProjects = filteredData.payments.filter(p => p.projectId).reduce((sum, p) => sum + (p.amount || 0), 0);

    // Total spending is from spendings table (which now includes auto-created inventory and payment entries)
    const totalSpending = directSpending;

    // Section statistics
    const totalSections = filteredData.sections.length;
    const activeSections = filteredData.sections.filter(s => s.status === 'in_progress').length;
    const averageProgress = filteredData.sections.length > 0
      ? filteredData.sections.reduce((sum, s) => sum + (s.progress || 0), 0) / filteredData.sections.length
      : 0;

    // REAL Employee statistics from actual employees data
    const totalEmployees = filteredData.employees.length;
    const activeEmployees = filteredData.employees.filter(e => e.active).length;
    const monthlyEmployees = filteredData.employees.filter(e => e.employeeType === 'monthly').length;
    const dailyEmployees = filteredData.employees.filter(e => e.employeeType === 'daily').length;

    // Calculate salary costs
    let totalMonthlySalaries = 0;
    let totalDailyRates = 0;
    filteredData.employees.forEach(emp => {
      if (emp.active) {
        if (emp.employeeType === 'monthly' && emp.monthlySalary) {
          totalMonthlySalaries += emp.monthlySalary;
        } else if (emp.employeeType === 'daily' && emp.dailyRate) {
          totalDailyRates += emp.dailyRate * 22; // Estimated monthly
        }
      }
    });

    // Category breakdown from spendings (includes auto-created entries)
    const categoryTotals = {
      materials: filteredData.spendings.filter(s => s.category === 'materials').reduce((sum, s) => sum + s.amount, 0),
      labor: filteredData.spendings.filter(s => s.category === 'labor').reduce((sum, s) => sum + s.amount, 0),
      equipment: filteredData.spendings.filter(s => s.category === 'equipment').reduce((sum, s) => sum + s.amount, 0),
      consulting: filteredData.spendings.filter(s => s.category === 'consulting').reduce((sum, s) => sum + s.amount, 0),
      other: filteredData.spendings.filter(s => !['materials', 'labor', 'equipment', 'consulting'].includes(s.category)).reduce((sum, s) => sum + s.amount, 0)
    };

    // Inventory statistics
    const lowStockItems = filteredData.inventory.filter(item => item.status === 'low_stock' || item.status === 'out_of_stock').length;
    const inventoryByCategory = {
      materials: filteredData.inventory.filter(item => item.category === 'materials').reduce((sum, item) => sum + (item.totalValue || 0), 0),
      equipment: filteredData.inventory.filter(item => item.category === 'equipment').reduce((sum, item) => sum + (item.totalValue || 0), 0),
      tools: filteredData.inventory.filter(item => item.category === 'tools').reduce((sum, item) => sum + (item.totalValue || 0), 0),
      consumables: filteredData.inventory.filter(item => item.category === 'consumables').reduce((sum, item) => sum + (item.totalValue || 0), 0)
    };

    return {
      projects: {
        total: totalProjects,
        completed: completedProjects,
        inProgress: inProgressProjects,
        notStarted: notStartedProjects,
        completionRate: totalProjects > 0 ? (completedProjects / totalProjects) * 100 : 0
      },
      budget: {
        total: totalBudget + sectionsBudget,
        spending: totalSpending,
        remaining: totalBudget + sectionsBudget - totalSpending,
        utilizationRate: totalBudget > 0 ? (totalSpending / totalBudget) * 100 : 0,
        inventoryLinkedToProjects,
        paymentsLinkedToProjects
      },
      sections: {
        total: totalSections,
        active: activeSections,
        averageProgress
      },
      employees: {
        total: totalEmployees,
        active: activeEmployees,
        monthly: monthlyEmployees,
        daily: dailyEmployees,
        totalMonthlySalaries,
        totalDailyRates,
        estimatedMonthlyCost: totalMonthlySalaries + totalDailyRates
      },
      payments: {
        total: filteredData.payments.length,
        totalAmount: totalPayments,
        linkedToProjects: paymentsLinkedToProjects
      },
      categories: categoryTotals,
      inventory: {
        totalValue: totalInventoryValue,
        lowStockItems,
        linkedToProjects: inventoryLinkedToProjects,
        itemsCount: filteredData.inventory.length,
        byCategory: inventoryByCategory
      }
    };
  };

  const stats = calculateStats();

  const getDashboardCards = () => {
    const cards = [
      {
        title: tr.totalBudget,
        value: formatMoney(stats.budget.total),
        change: `${stats.budget.utilizationRate.toFixed(1)}% ${isRtl ? 'مستخدم' : 'used'}`,
        changeType: stats.budget.utilizationRate > 80 ? 'warning' as const : 'neutral' as const,
        icon: CurrencyDollarIcon,
        color: 'green'
      },
      {
        title: tr.totalExpenses,
        value: formatMoney(stats.budget.spending),
        change: `${formatMoney(stats.budget.remaining)} ${tr.remainingLabel}`,
        changeType: 'neutral' as const,
        icon: ArrowTrendingUpIcon,
        color: 'blue'
      },
      {
        title: tr.totalProjects,
        value: stats.projects.total.toString(),
        change: `${stats.projects.completed} ${tr.completedLabel}`,
        changeType: 'increase' as const,
        icon: BuildingOfficeIcon,
        color: 'orange'
      },
      {
        title: tr.totalSections,
        value: stats.sections.total.toString(),
        change: `${stats.sections.active} ${tr.activeLabel}`,
        changeType: 'increase' as const,
        icon: DocumentTextIcon,
        color: 'purple'
      },
      {
        title: tr.employeesCard,
        value: stats.employees.total.toString(),
        change: `${stats.employees.active || 0} ${tr.activeLabel} | ${formatMoney(stats.employees.estimatedMonthlyCost || 0)} ${tr.monthlyLabel}`,
        changeType: 'neutral' as const,
        icon: UsersIcon,
        color: 'pink'
      },
      {
        title: tr.inventoryValue,
        value: formatMoney(stats.inventory.totalValue),
        change: `${stats.inventory.itemsCount || 0} ${tr.itemsLabel} | ${stats.inventory.lowStockItems || 0} ${tr.lowLabel}`,
        changeType: stats.inventory.lowStockItems > 0 ? 'warning' as const : 'neutral' as const,
        icon: DocumentTextIcon,
        color: 'teal'
      }
    ];

    return cards;
  };

  const getProjectCharts = () => {
    const projectStatus = {
      labels: [
        tr.completedStatus,
        tr.inProgressStatus,
        tr.notStartedStatus
      ],
      datasets: [{
        data: [stats.projects.completed, stats.projects.inProgress, stats.projects.notStarted],
        backgroundColor: [
          'rgba(34, 197, 94, 0.8)',
          'rgba(59, 130, 246, 0.8)',
          'rgba(156, 163, 175, 0.8)'
        ],
        borderWidth: 0
      }]
    };

    const budgetChart = {
      labels: [tr.expenses, tr.remaining],
      datasets: [{
        data: [stats.budget.spending, stats.budget.remaining],
        backgroundColor: [
          'rgba(239, 68, 68, 0.8)',
          'rgba(34, 197, 94, 0.8)'
        ],
        borderWidth: 0
      }]
    };

    return { projectStatus, budgetChart };
  };

  const getSpendingCharts = () => {
    const spendingByCategory = {
      labels: [
        tr.materials,
        tr.labor,
        tr.equipment,
        tr.consulting,
        tr.other
      ],
      datasets: [{
        data: Object.values(stats.categories),
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',
          'rgba(16, 185, 129, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(139, 92, 246, 0.8)',
          'rgba(156, 163, 175, 0.8)'
        ],
        borderWidth: 0
      }]
    };

    return { spendingByCategory };
  };

  const getSectionCharts = () => {
    const sectionProgress = {
      labels: filteredData.sections.map(s => s.name),
      datasets: [{
        label: tr.progressChart,
        data: filteredData.sections.map(s => s.progress || 0),
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 2,
      }]
    };

    return { sectionProgress };
  };

  const getInventoryCharts = () => {
    const inventoryByCategory = {
      labels: [
        tr.materials,
        tr.equipment,
        tr.tools,
        tr.consumables
      ],
      datasets: [{
        data: Object.values(stats.inventory.byCategory),
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',
          'rgba(16, 185, 129, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(139, 92, 246, 0.8)'
        ],
        borderWidth: 0
      }]
    };

    const inventoryStatus = {
      labels: [tr.inStock, tr.lowStock, tr.outOfStock],
      datasets: [{
        data: [
          filteredData.inventory.filter(item => item.status === 'in_stock').length,
          filteredData.inventory.filter(item => item.status === 'low_stock').length,
          filteredData.inventory.filter(item => item.status === 'out_of_stock').length
        ],
        backgroundColor: [
          'rgba(34, 197, 94, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(239, 68, 68, 0.8)'
        ],
        borderWidth: 0
      }]
    };

    return { inventoryByCategory, inventoryStatus };
  };

  const renderDashboardCards = () => {
    const borderColors = ['border-blue-500', 'border-green-500', 'border-purple-500', 'border-orange-500', 'border-teal-500', 'border-red-500'];

    return (
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
        {getDashboardCards().map((card, index) => (
          <div
            key={index}
            className="stat-card group animate-slide-up"
            style={{ animationDelay: `${index * 60}ms` }}
          >
            <div className="flex items-start justify-between mb-3">
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center shadow-sm
                            group-hover:scale-110 transition-transform duration-300
                            bg-${card.color}-500`}
                style={{ background: index % 3 === 0 ? 'linear-gradient(135deg,#f97316,#fb923c)' :
                         index % 3 === 1 ? 'linear-gradient(135deg,#10b981,#34d399)' :
                         'linear-gradient(135deg,#8b5cf6,#a78bfa)' }}
              >
                <card.icon className="h-4 w-4 text-white" />
              </div>
              {card.change && (
                <span className={`flex items-center gap-0.5 text-xs font-medium px-1.5 py-0.5 rounded-full
                  ${card.changeType === 'increase' ? 'bg-emerald-50 text-emerald-600' :
                    card.changeType === 'warning' ? 'bg-amber-50 text-amber-600' : 'bg-slate-100 text-slate-500'}`}>
                  {card.changeType === 'increase' && <ArrowTrendingUpIcon className="h-3 w-3" />}
                  {card.changeType === 'warning' && <ArrowTrendingDownIcon className="h-3 w-3" />}
                  {card.change}
                </span>
              )}
            </div>
            <p className="stat-value mb-1">{card.value}</p>
            <p className="text-xs text-slate-500">{card.title}</p>
          </div>
        ))}
      </div>
    );
  };

  const renderProjectReport = () => {
    const { projectStatus, budgetChart } = getProjectCharts();

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card p-6">
            <h3 className="section-title mb-4">
              {tr.projectStatusTitle}
            </h3>
            <div className="h-64">
              <Pie data={projectStatus} options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'bottom' as const,
                  }
                }
              }} />
            </div>
          </div>

          <div className="card p-6">
            <h3 className="section-title mb-4">
              {tr.budgetUtilization}
            </h3>
            <div className="h-64">
              <Pie data={budgetChart} options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'bottom' as const,
                  }
                }
              }} />
            </div>
          </div>
        </div>

        <div className="card overflow-hidden">
          <div className="px-6 py-4" style={{ borderBottom: '1px solid rgb(241 245 249)' }}>
            <h3 className="section-title">{tr.projectsSummary}</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr style={{ borderBottom: '1px solid rgb(241 245 249)' }}>
                  <th className="table-header">{tr.projectNameHeader}</th>
                  <th className="table-header">{tr.statusHeader}</th>
                  <th className="table-header">{tr.progressHeader}</th>
                  <th className="table-header">{tr.budgetHeader}</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.projects.map((project) => (
                  <tr key={project._id || project.id} className="table-row">
                    <td className="table-cell text-sm font-semibold text-slate-800">
                      {project.name}
                    </td>
                    <td className="table-cell">
                      <span className={`badge ${
                        project.status === 'completed'   ? 'badge-success' :
                        project.status === 'in_progress' ? 'badge-info' : 'badge-muted'
                      }`}>
                        {project.status === 'completed' ? tr.completedStatus :
                          project.status === 'in_progress' ? tr.inProgressStatus : tr.notStartedStatus}
                      </span>
                    </td>
                    <td className="table-cell text-sm text-slate-700 tabular-nums">
                      {project.progress}%
                    </td>
                    <td className="table-cell text-sm font-semibold text-slate-700 tabular-nums">
                      {formatMoney(project.budget)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  const renderFinancialReport = () => {
    const { spendingByCategory } = getSpendingCharts();

    return (
      <div className="space-y-6">
        {/* Auto-refresh indicator */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
          <div className="flex items-center">
            <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
            <span className="text-sm text-green-700 font-medium">
              {tr.autoRefresh} {new Date().toLocaleTimeString(isRtl ? 'ar-EG' : 'en-US')}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card p-6">
            <h3 className="section-title mb-4">
              {tr.expensesByCategory}
            </h3>
            <div className="h-64">
              <Pie data={spendingByCategory} options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'right' as const,
                  }
                }
              }} />
            </div>
          </div>

          <div className="card p-6">
            <h3 className="text-base font-bold text-slate-800 mb-5">{tr.comprehensiveFinancial}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { label: tr.totalBudget, value: formatMoney(stats.budget.total), color: 'rgba(59,130,246,0.08)', textColor: '#2563eb', borderColor: 'rgba(59,130,246,0.2)', icon: '💰' },
                { label: tr.totalExpenses, value: formatMoney(stats.budget.spending), color: 'rgba(239,68,68,0.06)', textColor: '#dc2626', borderColor: 'rgba(239,68,68,0.15)', icon: '💸' },
                { label: tr.remainingAmount, value: formatMoney(stats.budget.remaining), color: 'rgba(16,185,129,0.07)', textColor: '#059669', borderColor: 'rgba(16,185,129,0.18)', icon: '💵' },
                { label: tr.utilizationRate, value: `${stats.budget.utilizationRate.toFixed(1)}%`, color: 'rgba(139,92,246,0.07)', textColor: '#7c3aed', borderColor: 'rgba(139,92,246,0.18)', icon: '📊' },
              ].map((item, i) => (
                <div
                  key={i}
                  className="rounded-xl p-4 flex items-center justify-between"
                  style={{ background: item.color, border: `1px solid ${item.borderColor}` }}
                >
                  <div>
                    <p className="text-xs font-medium mb-1" style={{ color: item.textColor }}>{item.label}</p>
                    <p className="text-xl font-extrabold tabular-nums" style={{ color: item.textColor }}>{item.value}</p>
                  </div>
                  <span className="text-2xl">{item.icon}</span>
                </div>
              ))}
            </div>

            {/* Financial Health Bar */}
            <div className="mt-5 p-4 rounded-xl" style={{ background: 'rgb(248 250 252)', border: '1px solid rgb(226 232 240)' }}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-600">{tr.financialHealth}</span>
                <span className={`badge ${stats.budget.utilizationRate < 70 ? 'badge-success' : stats.budget.utilizationRate < 85 ? 'badge-warning' : 'badge-danger'}`}>
                  {stats.budget.utilizationRate < 70 ? tr.excellent : stats.budget.utilizationRate < 85 ? tr.good : tr.warningLabel}
                </span>
              </div>
              <div className="progress-bar">
                <div
                  className={`progress-fill ${stats.budget.utilizationRate < 70 ? 'gradient-success' : stats.budget.utilizationRate < 85 ? 'bg-amber-400' : 'gradient-danger'}`}
                  style={{ width: `${Math.min(stats.budget.utilizationRate, 100)}%`, transition: 'width 0.8s ease' }}
                />
              </div>
              <p className="text-xs text-slate-500 mt-2">
                {stats.budget.utilizationRate < 70 ? tr.healthExcellent :
                  stats.budget.utilizationRate < 85 ? tr.healthGood :
                    tr.healthWarning}
              </p>
            </div>
          </div>
        </div>

        {/* Enhanced spending breakdown */}
        <div className="bg-white p-6 rounded-lg shadow border-t-4 border-indigo-500">
          <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
            📋 {tr.detailedLog}
          </h3>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr style={{ borderBottom: '1px solid rgb(241 245 249)' }}>
                  <th className="table-header">{tr.expenseDate}</th>
                  <th className="table-header">{tr.projectNameHeader}</th>
                  <th className="table-header">{tr.sectionHeader}</th>
                  <th className="table-header">{tr.categoryHeader}</th>
                  <th className="table-header">{tr.descriptionHeader}</th>
                  <th className="table-header">{tr.amountPaid}</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.spendings.slice(0, 20).map((spending) => (
                  <tr key={spending._id || spending.id} className="table-row">
                    <td className="table-cell text-sm text-slate-700 tabular-nums">
                      {new Date(spending.date || spending.createdAt).toLocaleDateString(isRtl ? 'ar-EG' : 'en-US')}
                    </td>
                    <td className="table-cell text-sm text-slate-700">
                      {spending.projectName || tr.unspecified}
                    </td>
                    <td className="table-cell text-sm text-slate-700">
                      {spending.sectionName || tr.unspecified}
                    </td>
                    <td className="table-cell">
                      <span className={`badge ${
                        spending.category === 'materials'  ? 'badge-info' :
                        spending.category === 'labor'      ? 'badge-success' :
                        spending.category === 'equipment'  ? 'badge-brand' :
                        spending.category === 'consulting' ? 'badge-warning' : 'badge-muted'
                      }`}>
                        {spending.category === 'materials' ? tr.materials :
                          spending.category === 'labor' ? tr.labor :
                            spending.category === 'equipment' ? tr.equipment :
                              spending.category === 'consulting' ? tr.consulting : tr.other}
                      </span>
                    </td>
                    <td className="table-cell text-sm text-slate-700 max-w-xs truncate">
                      {spending.description}
                    </td>
                    <td className="table-cell text-sm font-bold text-slate-800 tabular-nums">
                      {formatMoney(spending.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredData.spendings.length > 20 && (
            <div className="mt-4 text-center">
              <p className="text-sm text-gray-500">
                {tr.showingFirst20(filteredData.spendings.length)}
              </p>
            </div>
          )}
        </div>


      </div>
    );
  };

  const renderSectionReport = () => {
    const { sectionProgress } = getSectionCharts();

    return (
      <div className="space-y-6">
        <div className="card p-6">
          <h3 className="section-title mb-4">
            {tr.sectionsProgressTitle}
          </h3>
          <div className="h-64">
            <Bar data={sectionProgress} options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  position: 'top' as const,
                }
              },
              scales: {
                y: {
                  beginAtZero: true,
                  max: 100
                }
              }
            }} />
          </div>
        </div>

        <div className="card overflow-hidden">
          <div className="px-6 py-4" style={{ borderBottom: '1px solid rgb(241 245 249)' }}>
            <h3 className="section-title">{tr.sectionsDetails}</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr style={{ borderBottom: '1px solid rgb(241 245 249)' }}>
                  <th className="table-header">{tr.sectionNameHeader}</th>
                  <th className="table-header">{tr.managerHeader}</th>
                  <th className="table-header">{tr.employeesHeader}</th>
                  <th className="table-header">{tr.progressHeader}</th>
                  <th className="table-header">{tr.budgetHeader}</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.sections.map((section) => (
                  <tr key={section._id || section.id} className="table-row">
                    <td className="table-cell text-sm font-semibold text-slate-800">{section.name}</td>
                    <td className="table-cell text-sm text-slate-700">{section.manager}</td>
                    <td className="table-cell text-sm text-slate-700 tabular-nums">{section.employees || 0}</td>
                    <td className="table-cell">
                      <div className="flex items-center gap-2">
                        <div className="progress-bar w-20">
                          <div
                            className="progress-fill gradient-brand"
                            style={{ width: `${section.progress || 0}%` }}
                          />
                        </div>
                        <span className="text-xs font-semibold text-slate-700 tabular-nums">{section.progress}%</span>
                      </div>
                    </td>
                    <td className="table-cell text-sm font-semibold text-slate-700 tabular-nums">{formatMoney(section.budget)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  const renderInventoryReport = () => {
    const { inventoryByCategory, inventoryStatus } = getInventoryCharts();

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card p-6">
            <h3 className="section-title mb-4">
              {tr.inventoryByCategoryTitle}
            </h3>
            <div className="h-64">
              <Pie data={inventoryByCategory} options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'right' as const,
                  }
                }
              }} />
            </div>
          </div>

          <div className="card p-6">
            <h3 className="section-title mb-4">
              {tr.inventoryStatusTitle}
            </h3>
            <div className="h-64">
              <Pie data={inventoryStatus} options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'bottom' as const,
                  }
                }
              }} />
            </div>
          </div>
        </div>

        <div className="card p-6">
          <h3 className="section-title mb-4">
            {tr.inventorySummary}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {filteredData.inventory.length}
              </div>
              <div className="text-sm text-gray-600">
                {tr.totalItems}
              </div>
            </div>

            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {formatMoney(stats.inventory.totalValue)}
              </div>
              <div className="text-sm text-gray-600">
                {tr.totalValue}
              </div>
            </div>

            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">
                {stats.inventory.lowStockItems}
              </div>
              <div className="text-sm text-gray-600">
                {tr.lowStock}
              </div>
            </div>

            <div className="text-center p-4 bg-red-50 rounded-lg">
              <div className="text-2xl font-bold text-red-600">
                {filteredData.inventory.filter(item => item.status === 'out_of_stock').length}
              </div>
              <div className="text-sm text-gray-600">
                {tr.outOfStock}
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {tr.itemNameHeader}
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {tr.categoryHeader}
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {tr.availableQuantity}
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {tr.totalValue}
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {tr.inventoryStatusHeader}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredData.inventory.map((item) => (
                  <tr key={item._id || item.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {item.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {item.category === 'materials' ? tr.materials :
                        item.category === 'equipment' ? tr.equipment :
                          item.category === 'tools' ? tr.tools :
                            item.category === 'consumables' ? tr.consumables : item.category}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {item.quantity}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatMoney(item.totalValue)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${item.status === 'in_stock' ? 'bg-green-100 text-green-800' :
                        item.status === 'low_stock' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                        {item.status === 'in_stock' ? tr.inStock :
                          item.status === 'low_stock' ? tr.lowStock : tr.outOfStock}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  const renderEmployeesReport = () => {
    const employeeList = filteredData.employees;
    const paymentList = filteredData.payments;

    const monthlyEmployees = employeeList.filter(emp => emp.employeeType === 'monthly');
    const dailyEmployees = employeeList.filter(emp => emp.employeeType === 'daily');

    const activeEmployees = employeeList.filter(emp => emp.active);

    // Calculate payment totals per employee
    const getEmployeePaymentTotal = (employeeId: string) => {
      return paymentList
        .filter(p => p.employeeId === employeeId)
        .reduce((sum, p) => sum + (p.amount || 0), 0);
    };

    const totalMonthlySalary = monthlyEmployees.reduce((sum, emp) => sum + (emp.monthlySalary || 0), 0);
    const totalPayments = paymentList.reduce((sum, p) => sum + (p.amount || 0), 0);

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card p-6">
            <h3 className="section-title mb-4">
              {tr.employeesByType}
            </h3>
            <div className="h-64">
              <Pie data={{
                labels: [tr.monthlyEmployeesChart, tr.dailyWorkersChart],
                datasets: [{
                  data: [monthlyEmployees.length, dailyEmployees.length],
                  backgroundColor: ['#3B82F6', '#10B981', '#8B5CF6'],
                  borderWidth: 2,
                  borderColor: '#fff'
                }]
              }} options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'right' as const,
                  }
                }
              }} />
            </div>
          </div>

          <div className="card p-6">
            <h3 className="section-title mb-4">
              {tr.employeesStatusTitle}
            </h3>
            <div className="h-64">
              <Pie data={{
                labels: [tr.activeChartLabel, tr.inactiveChartLabel],
                datasets: [{
                  data: [activeEmployees.length, employeeList.length - activeEmployees.length],
                  backgroundColor: ['#10B981', '#EF4444'],
                  borderWidth: 2,
                  borderColor: '#fff'
                }]
              }} options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'bottom' as const,
                  }
                }
              }} />
            </div>
          </div>
        </div>

        <div className="card p-6">
          <h3 className="section-title mb-4">
            {tr.employeesSummary}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {employeeList.length}
              </div>
              <div className="text-sm text-gray-600">
                {tr.totalEmployees}
              </div>
            </div>

            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {activeEmployees.length}
              </div>
              <div className="text-sm text-gray-600">
                {tr.activeEmployees}
              </div>
            </div>

            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {monthlyEmployees.length}
              </div>
              <div className="text-sm text-gray-600">
                {tr.monthlyEmployeesLabel}
              </div>
            </div>

            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">
                {formatMoney(totalMonthlySalary)}
              </div>
              <div className="text-sm text-gray-600">
                {tr.totalMonthlySalaries}
              </div>
            </div>

            <div className="text-center p-4 bg-teal-50 rounded-lg">
              <div className="text-2xl font-bold text-teal-600">
                {formatMoney(totalPayments)}
              </div>
              <div className="text-sm text-gray-600">
                {tr.totalPaymentsLabel}
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {tr.nameHeader}
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {tr.positionHeader}
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {tr.typeHeader}
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {tr.salaryRateHeader}
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {tr.totalPaymentsHeader}
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {tr.statusTh}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {employeeList.map((employee) => {
                  const empPaymentTotal = getEmployeePaymentTotal(employee._id || employee.id);
                  return (
                    <tr key={employee._id || employee.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {employee.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                        {employee.position}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                        {employee.employeeType === 'monthly' ? tr.monthlyType :
                          employee.employeeType === 'daily' ? tr.dailyType : tr.dailyType}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {employee.employeeType === 'monthly'
                          ? `${formatMoney(employee.monthlySalary || 0)} ${employee.currency}`
                          : employee.employeeType === 'daily'
                            ? `${formatMoney(employee.dailyRate || 0)} ${employee.currency}`
                            : `${formatMoney(employee.dailyRate || 0)} ${employee.currency}`
                        }
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-blue-600">
                        {formatMoney(empPaymentTotal)} EGP
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${employee.active
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                          }`}>
                          {employee.active ? tr.activeEmployee : tr.inactiveEmployee}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  const renderPaymentsReport = () => {
    const paymentList = filteredData.payments;
    const employeeList = filteredData.employees;

    // Helper to get employee name
    const getEmployeeName = (payment: any) => {
      if (payment.employeeName) return payment.employeeName;
      const employee = employeeList.find(emp => (emp._id || emp.id) === payment.employeeId);
      return employee?.name || tr.unknownEmployee;
    };

    const salaryPayments = paymentList.filter(p => p.paymentType === 'salary');
    const advancePayments = paymentList.filter(p => p.paymentType === 'advance');
    const dailyPayments = paymentList.filter(p => p.paymentType === 'daily');

    const totalAmountEGP = paymentList.filter(p => p.currency === 'EGP').reduce((sum, p) => sum + (p.amount || 0), 0);
    const totalAmountUSD = paymentList.filter(p => p.currency === 'USD').reduce((sum, p) => sum + (p.amount || 0), 0);
    const totalAmount = paymentList.reduce((sum, p) => sum + (p.amount || 0), 0);

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card p-6">
            <h3 className="section-title mb-4">
              {tr.paymentsByType}
            </h3>
            <div className="h-64">
              <Pie data={{
                labels: [tr.salariesChart, tr.advancesChart, tr.dailyChart, tr.loansChart, tr.onAccountChart],
                datasets: [{
                  data: [
                    salaryPayments.length,
                    advancePayments.length,
                    dailyPayments.length,
                    paymentList.filter(p => p.paymentType === 'loan').length,
                    paymentList.filter(p => p.paymentType === 'on_account').length
                  ],
                  backgroundColor: ['#10B981', '#F59E0B', '#8B5CF6', '#EF4444', '#6B7280'],
                  borderWidth: 2,
                  borderColor: '#fff'
                }]
              }} options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'right' as const,
                  }
                }
              }} />
            </div>
          </div>

          <div className="card p-6">
            <h3 className="section-title mb-4">
              {tr.paymentsByCurrency}
            </h3>
            <div className="h-64">
              <Pie data={{
                labels: [tr.egyptianPound, tr.usDollar],
                datasets: [{
                  data: [totalAmountEGP, totalAmountUSD],
                  backgroundColor: ['#3B82F6', '#10B981'],
                  borderWidth: 2,
                  borderColor: '#fff'
                }]
              }} options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'bottom' as const,
                  }
                }
              }} />
            </div>
          </div>
        </div>

        <div className="card p-6">
          <h3 className="section-title mb-4">
            {tr.paymentsSummary}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {paymentList.length}
              </div>
              <div className="text-sm text-gray-600">
                {tr.numberOfPayments}
              </div>
            </div>

            <div className="text-center p-4 bg-teal-50 rounded-lg">
              <div className="text-2xl font-bold text-teal-600">
                {formatMoney(totalAmount)}
              </div>
              <div className="text-sm text-gray-600">
                {tr.totalPaymentsLabel}
              </div>
            </div>

            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {formatMoney(totalAmountEGP)} EGP
              </div>
              <div className="text-sm text-gray-600">
                {tr.totalAmountEGP}
              </div>
            </div>

            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {formatMoney(totalAmountUSD)} USD
              </div>
              <div className="text-sm text-gray-600">
                {tr.totalAmountUSD}
              </div>
            </div>

            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">
                {salaryPayments.length}
              </div>
              <div className="text-sm text-gray-600">
                {tr.salaryPayments}
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {tr.employeeHeader}
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {tr.paymentTypeHeader}
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {tr.amountHeader}
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {tr.paymentMethodHeader}
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {tr.paymentDateHeader}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paymentList.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                      {tr.noPayments}
                    </td>
                  </tr>
                ) : (
                  paymentList.map((payment) => (
                    <tr key={payment._id || payment.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {getEmployeeName(payment)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${payment.paymentType === 'salary' ? 'bg-green-100 text-green-800' :
                          payment.paymentType === 'advance' ? 'bg-yellow-100 text-yellow-800' :
                            payment.paymentType === 'daily' ? 'bg-purple-100 text-purple-800' :
                              'bg-gray-100 text-gray-800'
                          }`}>
                          {payment.paymentType === 'salary' ? tr.salaryType :
                            payment.paymentType === 'advance' ? tr.advanceType :
                              payment.paymentType === 'daily' ? tr.dailyPayment :
                                payment.paymentType === 'loan' ? tr.loanType : tr.onAccountType}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                        {formatMoney(payment.amount || 0)} {payment.currency}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                        {payment.paymentMethod === 'cash' ? tr.cashMethod :
                          payment.paymentMethod === 'bank_transfer' ? tr.bankTransfer :
                            payment.paymentMethod === 'check' ? tr.checkMethod : tr.otherMethod}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                        {new Date(payment.paymentDate || payment.createdAt).toLocaleDateString(isRtl ? 'ar-EG' : 'en-US')}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  const handleExportAsImage = async () => {
    try {
      toast.info('Generating report as image...');

      if (chartRef.current) {
        const canvas = await html2canvas(chartRef.current, {
          scale: 2,
          logging: false,
          useCORS: true,
          backgroundColor: '#ffffff',
          width: chartRef.current.scrollWidth,
          height: chartRef.current.scrollHeight,
          allowTaint: true,
          foreignObjectRendering: true
        });

        // Create download link
        const link = document.createElement('a');
        link.download = `Al-Helaly-${getReportTitle()}-${new Date().toISOString().split('T')[0]}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();

        toast.success('Report image created successfully!');
      }
    } catch (error) {
      console.error('Error exporting as image:', error);
      toast.error('Error creating report image');
    }
  };

  const handleExportAsHTML = async () => {
    try {
      toast.info('Generating report as web page...');

      if (chartRef.current) {
        // Create full HTML content
        const htmlContent = `
<!DOCTYPE html>
<html dir="ltr" lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Al-Helaly Construction Company Report - ${getReportTitle()}</title>
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 20px; background: #f8f9fa; }
        .container { max-width: 1200px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .header { text-align: center; border-bottom: 3px solid #3b82f6; padding-bottom: 20px; margin-bottom: 30px; }
        .header h1 { color: #1f2937; margin: 0; font-size: 2.5em; }
        .header p { color: #6b7280; margin: 10px 0 0 0; font-size: 1.1em; }
        .report-content { font-size: 14px; line-height: 1.6; }
        @media print { body { background: white; } .container { box-shadow: none; } }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Al-Helaly Construction Company</h1>
            <p>Roads &amp; Infrastructure Division</p>
            <h2>${getReportTitle()}</h2>
            <p>Report Generated: ${new Date().toLocaleDateString('en-US')}</p>
        </div>
        <div class="report-content">
            ${chartRef.current.innerHTML}
        </div>
    </div>
</body>
</html>`;

        // Create and download HTML file
        const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `Al-Helaly-${getReportTitle()}-${new Date().toISOString().split('T')[0]}.html`;
        link.click();

        toast.success('Report web page created successfully!');
      }
    } catch (error) {
      console.error('Error exporting as HTML:', error);
      toast.error('Error creating report web page');
    }
  };

  const handleExportReport = async () => {
    try {
      const title = getReportTitle();
      const projectName = filterBy === 'project' && selectedProject !== 'all'
        ? projects.find(p => p.id === selectedProject)?.name
        : null;

      const dateRangeText = filterBy === 'date' ? {
        'month': 'One Month',
        'quarter': '3 Months',
        'half_year': '6 Months',
        'year': 'Full Year'
      }[dateRange] : null;

      toast.info('Generating report...');

      // Create PDF document with improved settings for Arabic text compatibility
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
        putOnlyUsedFonts: true,
        compress: false // Disable compression to avoid text encoding issues
      });

      // Set document properties to support better text rendering
      doc.setProperties({
        title: 'Al-Helaly Construction Company Report',
        subject: getReportTitleEn(),
        author: 'Al-Helaly ERP System',
        creator: 'Al-Helaly Construction Management System'
      });

      // Add title and date
      const currentDate = new Date();
      const formattedDate = currentDate.toLocaleDateString('en-GB');

      // Title with improved styling
      doc.setFontSize(22);
      doc.setFont(undefined, 'bold');
      const mainTitle = 'Al-Helaly Construction Company';
      doc.text(mainTitle, 105, 20, { align: 'center' });

      doc.setFontSize(16);
      doc.setFont(undefined, 'normal');
      const subtitle = 'Roads & Infrastructure Division';
      doc.text(subtitle, 105, 30, { align: 'center' });

      // Report type title  
      doc.setFontSize(18);
      doc.setFont(undefined, 'bold');
      let reportTitle = getReportTitleEn();
      if (projectName) {
        reportTitle += ` - ${convertArabicToEnglish(projectName)}`;
      }
      if (dateRangeText) {
        reportTitle += ` (${dateRangeText})`;
      }
      doc.text(reportTitle, 105, 45, { align: 'center' });

      // Date
      doc.setFontSize(12);
      doc.setFont(undefined, 'normal');
      const dateLabel = `Report Generated: ${formattedDate}`;
      doc.text(dateLabel, 105, 55, { align: 'center' });

      // Add filter information
      let yPosition = 65;
      if (filterBy === 'project' && projectName) {
        doc.setFontSize(10);
        const projectLabel = `Filtered by Project: ${convertArabicToEnglish(projectName)}`;
        doc.text(projectLabel, 105, yPosition, { align: 'center' });
        yPosition += 8;
      }
      if (filterBy === 'date' && dateRangeText) {
        doc.setFontSize(10);
        const periodLabel = `Time Period: ${dateRangeText}`;
        doc.text(periodLabel, 105, yPosition, { align: 'center' });
        yPosition += 8;
      }

      // Add data tables based on report type
      yPosition += 15;
      await addReportData(doc, yPosition);

      // Add chart image if available
      if (chartRef.current) {
        try {
          const canvas = await html2canvas(chartRef.current, {
            scale: 2,
            logging: false,
            useCORS: true,
            backgroundColor: '#ffffff'
          });

          const imgData = canvas.toDataURL('image/png');
          const imgWidth = 180;
          const imgHeight = Math.min(canvas.height * imgWidth / canvas.width, 150);

          // Add new page if needed
          if (yPosition + imgHeight > 250) {
            doc.addPage();
            yPosition = 20;
          }

          doc.addImage(imgData, 'PNG', 15, yPosition, imgWidth, imgHeight);
        } catch (err) {
          console.error('Error capturing chart:', err);
        }
      }

      // Save the PDF with descriptive filename
      const timestamp = currentDate.toISOString().split('T')[0];
      const safeProjectName = projectName ? convertArabicToEnglish(projectName).replace(/\s+/g, '-') : '';
      const fileName = `Al-Helaly-${reportType}${safeProjectName ? `-${safeProjectName}` : ''}${dateRangeText ? `-${dateRange}` : ''}-${timestamp}.pdf`;

      doc.save(fileName);

      toast.success('PDF report created successfully!');
    } catch (error) {
      console.error('Error exporting report:', error);
      toast.error('Error generating report');
    }
  };

  // Helper function to convert Arabic text to English for PDF compatibility
  const convertArabicToEnglish = (text: string): string => {
    if (!text) return '';

    // If text contains Arabic characters, replace with English equivalent or transliteration
    const arabicToEnglishMap: { [key: string]: string } = {
      // Project names
      'طريق القاهرة - الإسكندرية الصحراوي (المرحلة الأولى)': 'Cairo-Alexandria Desert Road (Phase 1)',
      'طريق الساحل الشمالي الجديد': 'New North Coast Road',
      'تطوير طريق أسوان - أبو سمبل': 'Aswan-Abu Simbel Road Development',
      'جسر النيل الجديد': 'New Nile Bridge',
      'طريق القاهرة الدائري الجديد': 'New Cairo Ring Road',
      'توسعة الطريق الدائري': 'Ring Road Expansion',
      'إنشاء طريق جديد': 'New Road Construction',
      // Manager names
      'أحمد محمد علي': 'Ahmed Mohamed Ali',
      'سارة أحمد حسن': 'Sara Ahmed Hassan',
      'محمد إبراهيم': 'Mohamed Ibrahim',
      'فاطمة محمود': 'Fatima Mahmoud',
      'عمر خالد': 'Omar Khaled',
      'محمد أحمد': 'Mohamed Ahmed',
      'سارة حسن': 'Sara Hassan',
      'أحمد محمد': 'Ahmed Mohamed',
      'فاطمة علي': 'Fatima Ali',
      // Section names
      'أساسات وخرسانة': 'Foundation & Concrete',
      'طبقة الأساس': 'Base Layer',
      'طبقة الأسفلت': 'Asphalt Layer',
      'اللمسة الأخيرة': 'Final Touches',
      'أعمال المياه والصرف': 'Water & Drainage',
      'تركيب الإشارات': 'Traffic Signals Installation',
      'أعمال الإنارة': 'Lighting Works',
      'التشطيبات النهائية': 'Final Finishes',
      'إعداد الموقع': 'Site Preparation',
      'أعمال التسوية': 'Leveling Works',
      // Generic terms
      'مشروع': 'Project',
      'قسم': 'Section',
      'مدير': 'Manager',
      'مهندس': 'Engineer'
    };

    // Check if we have a direct mapping
    if (arabicToEnglishMap[text]) {
      return arabicToEnglishMap[text];
    }

    // If it contains Arabic characters, try to transliterate or use a generic name
    if (/[\u0600-\u06FF]/.test(text)) {
      // Generate a consistent hash-based ID instead of random for consistency
      const hash = text.split('').reduce((a, b) => {
        a = ((a << 5) - a) + b.charCodeAt(0);
        return a & a;
      }, 0);
      const id = Math.abs(hash).toString(36).substr(0, 5).toUpperCase();

      // Generate a generic English name based on the type
      if (text.includes('طريق') || text.includes('مشروع')) {
        return `Road Project ${id}`;
      }
      if (text.includes('قسم') || text.includes('أساس') || text.includes('أسفلت') || text.includes('أعمال')) {
        return `Section ${id}`;
      }
      if (text.includes('أحمد') || text.includes('محمد') || text.includes('سارة') || text.includes('فاطمة') || text.includes('عمر') || text.includes('مدير') || text.includes('مهندس')) {
        return `Manager ${id}`;
      }
      // Generic fallback
      return `Item ${id}`;
    }

    // Return as-is if no Arabic characters
    return text;
  };

  const addReportData = async (doc: jsPDF, startY: number) => {
    const margin = 15;
    let yPosition = startY;

    try {
      switch (reportType) {
        case 'projects':
          // Add projects table
          const projectsTableData = projects.map(project => [
            convertArabicToEnglish(project.name),
            project.status === 'completed' ? 'Completed' :
              project.status === 'in_progress' ? 'In Progress' : 'Not Started',
            `${project.progress || 0}%`,
            formatMoney(project.budget),
            convertArabicToEnglish(project.manager)
          ]);

          (doc as any).autoTable({
            head: [['Project Name', 'Status', 'Progress', 'Budget', 'Manager']],
            body: projectsTableData,
            startY: yPosition,
            margin: { left: margin, right: margin },
            styles: {
              fontSize: 10,
              cellPadding: 3,
              halign: 'left'
            },
            headStyles: {
              fillColor: [59, 130, 246],
              textColor: 255,
              halign: 'center'
            }
          });
          break;

        case 'sections':
          // Add sections table with road construction details
          const sectionsTableData = sections.map(section => {
            const project = projects.find(p => p.id === section.projectId);
            const unit = project?.unit === 'km' ? 'km' :
              project?.unit === 'm' ? 'm' :
                project?.unit === 'sq_m' ? 'm²' : 'unit';

            return [
              convertArabicToEnglish(section.name),
              convertArabicToEnglish(project?.name || ''),
              section.status === 'completed' ? 'Completed' :
                section.status === 'in_progress' ? 'In Progress' : 'Not Started',
              `${section.progress || 0}%`,
              `${section.completedQuantity || 0} ${unit}`,
              `${section.targetQuantity || 0} ${unit}`,
              convertArabicToEnglish(section.manager || '')
            ];
          });

          (doc as any).autoTable({
            head: [['Section Name', 'Project', 'Status', 'Progress', 'Completed Quantity', 'Target Quantity', 'Manager']],
            body: sectionsTableData,
            startY: yPosition,
            margin: { left: margin, right: margin },
            styles: {
              fontSize: 8,
              cellPadding: 2,
              halign: 'left'
            },
            headStyles: {
              fillColor: [59, 130, 246],
              textColor: 255,
              halign: 'center',
              fontSize: 9
            }
          });
          break;

        case 'financial':
          // Add financial summary
          const totalBudget = projects.reduce((sum, p) => sum + p.budget, 0);
          const totalSpent = spendings.reduce((sum, s) => sum + s.amount, 0);
          const remaining = totalBudget - totalSpent;

          const financialData = [
            ['Total Budget', formatMoney(totalBudget)],
            ['Total Spending', formatMoney(totalSpent)],
            ['Remaining Amount', formatMoney(remaining)],
            ['Spending Percentage', `${totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0}%`]
          ];

          (doc as any).autoTable({
            head: [['Description', 'Amount']],
            body: financialData,
            startY: yPosition,
            margin: { left: margin, right: margin },
            styles: {
              fontSize: 12,
              cellPadding: 4,
              halign: 'left'
            },
            headStyles: {
              fillColor: [59, 130, 246],
              textColor: 255,
              halign: 'center'
            }
          });
          break;

        default:
          // Overview data with road construction metrics
          const totalLength = projects.reduce((sum, p) => sum + (p.totalLength || 0), 0);
          const completedSections = sections.filter(s => s.status === 'completed').length;
          const totalQuantityCompleted = sections.reduce((sum, s) => sum + (s.completedQuantity || 0), 0);
          const totalQuantityTarget = sections.reduce((sum, s) => sum + (s.targetQuantity || 0), 0);
          const avgProgress = sections.length > 0 ? Math.round(sections.reduce((sum, s) => sum + (s.progress || 0), 0) / sections.length) : 0;

          const overviewData = [
            ['Total Projects', projects.length.toString()],
            ['Completed Projects', projects.filter(p => p.status === 'completed').length.toString()],
            ['In Progress Projects', projects.filter(p => p.status === 'in_progress').length.toString()],
            ['Total Roads Length', `${totalLength} km`],
            ['Total Sections', sections.length.toString()],
            ['Completed Sections', completedSections.toString()],
            ['Total Completed Quantity', `${totalQuantityCompleted} km`],
            ['Total Target Quantity', `${totalQuantityTarget} km`],
            ['Average Progress', `${avgProgress}%`],
            ['Total Budget', formatMoney(projects.reduce((sum, p) => sum + p.budget, 0))]
          ];

          (doc as any).autoTable({
            head: [['Description', 'Value']],
            body: overviewData,
            startY: yPosition,
            margin: { left: margin, right: margin },
            styles: {
              fontSize: 11,
              cellPadding: 4,
              halign: 'left'
            },
            headStyles: {
              fillColor: [59, 130, 246],
              textColor: 255,
              halign: 'center'
            },
            alternateRowStyles: {
              fillColor: [248, 250, 252]
            }
          });
          break;
      }
    } catch (error) {
      console.error('Error adding report data:', error);
    }
  };

  const getReportTitle = () => {
    switch (reportType) {
      case 'overview':   return tr.overviewTab;
      case 'financial':  return tr.financialTab;
      case 'projects':   return tr.projectsTab;
      case 'sections':   return tr.sectionsTab;
      case 'inventory':  return tr.inventoryTab;
      case 'employees':  return tr.employeesTab;
      case 'payments':   return tr.paymentsTab;
      default:           return '';
    }
  };

  const getReportTitleEn = () => {
    switch (reportType) {
      case 'overview':
        return 'Overview Report';
      case 'financial':
        return 'Financial Report';
      case 'projects':
        return 'Projects Report';
      case 'sections':
        return 'Sections Report';
      case 'inventory':
        return t('reports', 'inventory');
      case 'employees':
        return 'Employees Report';
      case 'payments':
        return 'Payments Report';
      default:
        return 'Report';
    }
  };

  const renderReportContent = () => {
    switch (reportType) {
      case 'overview':
        return renderDashboardCards();
      case 'financial':
        return renderFinancialReport();
      case 'projects':
        return renderProjectReport();
      case 'sections':
        return renderSectionReport();
      case 'inventory':
        return renderInventoryReport();
      case 'employees':
        return renderEmployeesReport();
      case 'payments':
        return renderPaymentsReport();
      default:
        return renderDashboardCards();
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col justify-center items-center h-64 bg-white rounded-lg shadow-sm">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
        <p className="text-gray-600 font-medium">{isRtl ? 'جارٍ تحميل التقارير...' : 'Loading reports...'}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">{tr.pageTitle}</h1>
          <p className="page-subtitle">{tr.pageSubtitle}</p>
        </div>
        <button
          type="button"
          onClick={handleExportReport}
          className="btn-primary"
        >
          <ArrowDownTrayIcon className="h-4 w-4" aria-hidden="true" />
          {tr.downloadPdf}
        </button>
      </div>

      {/* Report Settings */}
      <div className="card px-5 py-5">
        <h3 className="section-title mb-4">{tr.reportSettings}</h3>

        {/* Filter Options */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{tr.filterBy}</label>
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="filterBy"
                  value="date"
                  checked={filterBy === 'date'}
                  onChange={(e) => setFilterBy(e.target.value as 'date' | 'project')}
                  className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300"
                />
                <span className="ml-2 text-sm text-gray-700">{tr.byDate}</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="filterBy"
                  value="project"
                  checked={filterBy === 'project'}
                  onChange={(e) => setFilterBy(e.target.value as 'date' | 'project')}
                  className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300"
                />
                <span className="ml-2 text-sm text-gray-700">{tr.byProject}</span>
              </label>
            </div>
          </div>

          {filterBy === 'date' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{tr.timePeriod}</label>
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value as any)}
                className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
              >
                <option value="month">{tr.oneMonth}</option>
                <option value="quarter">{tr.threeMonths}</option>
                <option value="half_year">{tr.sixMonths}</option>
                <option value="year">{tr.fullYear}</option>
              </select>
            </div>
          )}

          {filterBy === 'project' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{tr.projectLabel}</label>
              <select
                value={selectedProject}
                onChange={(e) => setSelectedProject(e.target.value)}
                className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
              >
                <option value="all">{tr.allProjects}</option>
                {projects.map((project) => (
                  <option key={project._id || project.id} value={project._id || project.id}>
                    {project.name}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Report Type Selector */}
        <div className="overflow-x-auto pb-1">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 min-w-[480px]">
          {[
            { key: 'overview', label: tr.overviewTab, icon: ChartBarIcon },
            { key: 'financial', label: tr.financialTab, icon: CurrencyDollarIcon },
            { key: 'projects', label: tr.projectsTab, icon: BuildingOfficeIcon },
            { key: 'sections', label: tr.sectionsTab, icon: DocumentTextIcon },
            { key: 'inventory', label: tr.inventoryTab, icon: ArrowTrendingUpIcon },
            { key: 'employees', label: tr.employeesTab, icon: UsersIcon },
            { key: 'payments', label: tr.paymentsTab, icon: CurrencyDollarIcon }
          ].map((report) => (
            <button
              key={report.key}
              onClick={() => setReportType(report.key as ReportType)}
              className={`p-4 rounded-lg border-2 text-center transition-colors ${reportType === report.key
                ? 'border-blue-500 bg-blue-50 text-blue-700'
                : 'border-gray-200 hover:border-gray-300 text-gray-700'
                }`}
            >
              <report.icon className="h-6 w-6 mx-auto mb-2" />
              <div className="text-sm font-medium">{report.label}</div>
            </button>
          ))}
        </div>
        </div>
      </div>

      {/* Report Content */}
      <div ref={chartRef}>
        <div className="mb-4">
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            {getReportTitle()}
          </h2>
        </div>
        {renderReportContent()}
      </div>

    </div>
  );
};

export default Reports; 
