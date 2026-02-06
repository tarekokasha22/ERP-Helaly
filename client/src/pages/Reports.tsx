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
import api from '../services/apiService';
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
  const [filterBy, setFilterBy] = useState<'date' | 'project'>('date');
  const { t, language, dir, formatDate } = useLanguage();
  const { formatMoney } = useCurrency();
  const { country } = useCountry();
  const chartRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();
  const isRtl = language === 'ar';

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
    const res = await api.get('projects');
    return Array.isArray(res.data) ? res.data : [];
  }, {
    staleTime: 1000,
    refetchInterval: reportType === 'financial' ? 5000 : false,
    refetchOnWindowFocus: true,
    refetchOnMount: true
  });

  const { data: sections = [], isLoading: sectionsLoading } = useQuery(['sections'], async () => {
    const res = await api.get('sections');
    return Array.isArray(res.data) ? res.data : [];
  }, {
    staleTime: 1000,
    refetchInterval: reportType === 'financial' ? 5000 : false,
    refetchOnWindowFocus: true,
    refetchOnMount: true
  });

  const { data: spendings = [], isLoading: spendingsLoading } = useQuery(['spendings'], async () => {
    // Spendings not implemented in apiService yet, return empty
    return [];
  }, {
    staleTime: 1000,
    refetchInterval: reportType === 'financial' ? 5000 : false,
    refetchOnWindowFocus: true,
    refetchOnMount: true
  });

  const { data: inventory = [], isLoading: inventoryLoading } = useQuery(['inventory'], async () => {
    return []; // No mock inventory yet, return empty array
  });

  const { data: employees = [], isLoading: employeesLoading } = useQuery(['employees', country], async () => {
    if (!country) return [];
    const res = await api.get('employees');
    return Array.isArray(res.data) ? res.data : [];
  }, {
    enabled: !!country,
    staleTime: 30000,
    refetchOnWindowFocus: true,
    refetchOnMount: true
  });

  const { data: payments = [], isLoading: paymentsLoading } = useQuery(['payments', country], async () => {
    if (!country) return [];
    const res = await api.get('payments');
    return Array.isArray(res.data) ? res.data : [];
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
        title: 'إجمالي الميزانية',
        value: formatMoney(stats.budget.total),
        change: `${stats.budget.utilizationRate.toFixed(1)}% مستخدم`,
        changeType: stats.budget.utilizationRate > 80 ? 'warning' as const : 'neutral' as const,
        icon: CurrencyDollarIcon,
        color: 'green'
      },
      {
        title: 'إجمالي المصروفات',
        value: formatMoney(stats.budget.spending),
        change: `${formatMoney(stats.budget.remaining)} متبقي`,
        changeType: 'neutral' as const,
        icon: ArrowTrendingUpIcon,
        color: 'blue'
      },
      {
        title: 'إجمالي المشاريع',
        value: stats.projects.total.toString(),
        change: `${stats.projects.completed} مكتمل`,
        changeType: 'increase' as const,
        icon: BuildingOfficeIcon,
        color: 'orange'
      },
      {
        title: 'إجمالي الأقسام',
        value: stats.sections.total.toString(),
        change: `${stats.sections.active} نشط`,
        changeType: 'increase' as const,
        icon: DocumentTextIcon,
        color: 'purple'
      },
      {
        title: 'عدد الموظفين',
        value: stats.employees.total.toString(),
        change: `${stats.employees.active || 0} نشط | ${formatMoney(stats.employees.estimatedMonthlyCost || 0)} شهريا`,
        changeType: 'neutral' as const,
        icon: UsersIcon,
        color: 'pink'
      },
      {
        title: 'قيمة المخزون',
        value: formatMoney(stats.inventory.totalValue),
        change: `${stats.inventory.itemsCount || 0} عنصر | ${stats.inventory.lowStockItems || 0} منخفض`,
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
        'مكتمل',
        'جاري العمل',
        'لم يبدأ'
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
      labels: ['المصروفات', 'المتبقي'],
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
        'المواد',
        'العمالة',
        'المعدات',
        'الاستشارات',
        'أخرى'
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
        label: 'التقدم',
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
        'مواد',
        'معدات',
        'أدوات',
        'مواد استهلاكية'
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
      labels: ['متوفر', 'مخزون منخفض', 'غير متوفر'],
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {getDashboardCards().map((card, index) => (
          <div key={index} className={`bg-white overflow-hidden shadow-sm rounded-lg border-l-4 ${borderColors[index % borderColors.length]} hover:shadow-md transition-shadow duration-200`}>
            <div className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">{card.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{card.value}</p>
                  {card.change && (
                    <div className={`mt-2 flex items-center text-sm font-medium ${card.changeType === 'increase' ? 'text-green-600' :
                      card.changeType === 'warning' ? 'text-yellow-600' : 'text-gray-500'
                      }`}>
                      {card.changeType === 'increase' && (
                        <ArrowTrendingUpIcon className="h-4 w-4 mr-1" />
                      )}
                      {card.changeType === 'warning' && (
                        <ArrowTrendingDownIcon className="h-4 w-4 mr-1" />
                      )}
                      {card.change}
                    </div>
                  )}
                </div>
                <div className={`p-3 rounded-full bg-${card.color}-100`}>
                  <card.icon className={`h-6 w-6 text-${card.color}-600`} aria-hidden="true" />
                </div>
              </div>
            </div>
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
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              حالة المشاريع
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

          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              استخدام الميزانية
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

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            ملخص المشاريع
          </h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    اسم المشروع
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    الحالة
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    التقدم
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    الميزانية
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredData.projects.map((project) => (
                  <tr key={project._id || project.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {project.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${project.status === 'completed' ? 'bg-green-100 text-green-800' :
                        project.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                        {project.status === 'completed' ? 'مكتمل' :
                          project.status === 'in_progress' ? 'قيد التنفيذ' : 'لم يبدأ'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {project.progress}%
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
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
              📊 التحديث التلقائي مفعل - آخر تحديث: {new Date().toLocaleTimeString('ar-SA')}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              المصروفات حسب الفئة
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

          <div className="bg-white p-6 rounded-lg shadow border-t-4 border-blue-500">
            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
              💰 الملخص المالي الشامل
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-blue-600">إجمالي الميزانية المخططة</p>
                    <p className="text-2xl font-bold text-blue-700">{formatMoney(stats.budget.total)}</p>
                  </div>
                  <div className="text-3xl text-blue-500">💰</div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-red-50 to-red-100 p-4 rounded-lg border border-red-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-red-600">إجمالي المصروفات الفعلية</p>
                    <p className="text-2xl font-bold text-red-700">{formatMoney(stats.budget.spending)}</p>
                  </div>
                  <div className="text-3xl text-red-500">💸</div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-green-600">المبلغ المتبقي</p>
                    <p className="text-2xl font-bold text-green-700">{formatMoney(stats.budget.remaining)}</p>
                  </div>
                  <div className="text-3xl text-green-500">💵</div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-4 rounded-lg border border-purple-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-purple-600">نسبة الاستخدام</p>
                    <p className="text-2xl font-bold text-purple-700">{stats.budget.utilizationRate.toFixed(1)}%</p>
                  </div>
                  <div className="text-3xl text-purple-500">📊</div>
                </div>
              </div>
            </div>

            {/* Financial Health Indicator */}
            <div className="mt-6 p-4 rounded-lg bg-gray-50 border">
              <h4 className="text-lg font-semibold text-gray-800 mb-3">🏥 مؤشر الصحة المالية</h4>
              <div className="flex items-center">
                <div className="flex-1 bg-gray-200 rounded-full h-3">
                  <div
                    className={`h-3 rounded-full transition-all duration-500 ${stats.budget.utilizationRate < 70 ? 'bg-green-500' :
                      stats.budget.utilizationRate < 85 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                    style={{ width: `${Math.min(stats.budget.utilizationRate, 100)}%` }}
                  ></div>
                </div>
                <span className="ml-3 text-sm font-medium text-gray-700">
                  {stats.budget.utilizationRate < 70 ? 'ممتاز 🟢' :
                    stats.budget.utilizationRate < 85 ? 'جيد 🟡' : 'تحذير 🔴'}
                </span>
              </div>
              <p className="text-xs text-gray-600 mt-2">
                {stats.budget.utilizationRate < 70 ? 'الميزانية تحت السيطرة وهناك مرونة مالية جيدة' :
                  stats.budget.utilizationRate < 85 ? 'الميزانية في نطاق طبيعي، مراقبة مستمرة مطلوبة' :
                    'تجاوز الحد الآمن للميزانية، يلزم مراجعة فورية'}
              </p>
            </div>
          </div>
        </div>

        {/* Enhanced spending breakdown */}
        <div className="bg-white p-6 rounded-lg shadow border-t-4 border-indigo-500">
          <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
            📋 سجل المصروفات التفصيلي
          </h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    تاريخ المصروف
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    اسم المشروع
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    القسم المختص
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    نوع المصروف
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    وصف المصروف
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    المبلغ المدفوع
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredData.spendings.slice(0, 20).map((spending) => (
                  <tr key={spending._id || spending.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(spending.date || spending.createdAt).toLocaleDateString('ar-SA')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {spending.projectName || 'غير محدد'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {spending.sectionName || 'غير محدد'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${spending.category === 'materials' ? 'bg-blue-100 text-blue-800' :
                        spending.category === 'labor' ? 'bg-green-100 text-green-800' :
                          spending.category === 'equipment' ? 'bg-purple-100 text-purple-800' :
                            spending.category === 'consulting' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-gray-100 text-gray-800'
                        }`}>
                        {spending.category === 'materials' ? '🧱 مواد' :
                          spending.category === 'labor' ? '👷 عمالة' :
                            spending.category === 'equipment' ? '🔧 معدات' :
                              spending.category === 'consulting' ? '💼 استشارات' :
                                '📦 أخرى'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                      {spending.description}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
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
                عرض أول 20 مصروف من إجمالي {filteredData.spendings.length} مصروف
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
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            تقدم الأقسام
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

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            تفاصيل الأقسام
          </h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    اسم القسم
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    المدير
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    عدد الموظفين
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    التقدم
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    الميزانية
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredData.sections.map((section) => (
                  <tr key={section._id || section.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {section.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {section.manager}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {section.employees || 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {section.progress}%
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatMoney(section.budget)}
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

  const renderInventoryReport = () => {
    const { inventoryByCategory, inventoryStatus } = getInventoryCharts();

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              المخزون حسب الفئة
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

          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              حالة المخزون
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

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            ملخص المخزون
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {filteredData.inventory.length}
              </div>
              <div className="text-sm text-gray-600">
                إجمالي العناصر
              </div>
            </div>

            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {formatMoney(stats.inventory.totalValue)}
              </div>
              <div className="text-sm text-gray-600">
                إجمالي القيمة
              </div>
            </div>

            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">
                {stats.inventory.lowStockItems}
              </div>
              <div className="text-sm text-gray-600">
                مخزون منخفض
              </div>
            </div>

            <div className="text-center p-4 bg-red-50 rounded-lg">
              <div className="text-2xl font-bold text-red-600">
                {filteredData.inventory.filter(item => item.status === 'out_of_stock').length}
              </div>
              <div className="text-sm text-gray-600">
                غير متوفر
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    اسم العنصر
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    الفئة
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    الكمية المتوفرة
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    القيمة الإجمالية
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    حالة المخزون
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
                      {item.category === 'materials' ? 'مواد' :
                        item.category === 'equipment' ? 'معدات' :
                          item.category === 'tools' ? 'أدوات' :
                            item.category === 'consumables' ? 'مواد استهلاكية' : item.category}
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
                        {item.status === 'in_stock' ? 'متوفر' :
                          item.status === 'low_stock' ? 'مخزون منخفض' : 'غير متوفر'}
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
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              توزيع العاملين حسب النوع
            </h3>
            <div className="h-64">
              <Pie data={{
                labels: ['موظفين شهريين', 'عمال يومية'],
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

          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              حالة العاملين
            </h3>
            <div className="h-64">
              <Pie data={{
                labels: ['نشط', 'غير نشط'],
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

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            ملخص العاملين
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {employeeList.length}
              </div>
              <div className="text-sm text-gray-600">
                إجمالي العاملين
              </div>
            </div>

            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {activeEmployees.length}
              </div>
              <div className="text-sm text-gray-600">
                العاملين النشطين
              </div>
            </div>

            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {monthlyEmployees.length}
              </div>
              <div className="text-sm text-gray-600">
                الموظفين الشهريين
              </div>
            </div>

            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">
                {formatMoney(totalMonthlySalary)}
              </div>
              <div className="text-sm text-gray-600">
                إجمالي الرواتب الشهرية
              </div>
            </div>

            <div className="text-center p-4 bg-teal-50 rounded-lg">
              <div className="text-2xl font-bold text-teal-600">
                {formatMoney(totalPayments)}
              </div>
              <div className="text-sm text-gray-600">
                إجمالي المدفوعات
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    الاسم
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    المنصب
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    النوع
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    الراتب/السعر
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    إجمالي المدفوعات
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    الحالة
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
                        {employee.employeeType === 'monthly' ? 'شهري' :
                          employee.employeeType === 'daily' ? 'يومي' : 'باليومية'}
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
                        {formatMoney(empPaymentTotal)} ج.م
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${employee.active
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                          }`}>
                          {employee.active ? 'نشط' : 'غير نشط'}
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
      return employee?.name || 'غير معروف';
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
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              المدفوعات حسب النوع
            </h3>
            <div className="h-64">
              <Pie data={{
                labels: ['رواتب', 'سلف', 'يومية', 'عهد', 'تحت الحساب'],
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

          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              المدفوعات حسب العملة
            </h3>
            <div className="h-64">
              <Pie data={{
                labels: ['جنيه مصري', 'دولار أمريكي'],
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

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            ملخص المدفوعات
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {paymentList.length}
              </div>
              <div className="text-sm text-gray-600">
                عدد المدفوعات
              </div>
            </div>

            <div className="text-center p-4 bg-teal-50 rounded-lg">
              <div className="text-2xl font-bold text-teal-600">
                {formatMoney(totalAmount)}
              </div>
              <div className="text-sm text-gray-600">
                إجمالي المدفوعات
              </div>
            </div>

            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {formatMoney(totalAmountEGP)} EGP
              </div>
              <div className="text-sm text-gray-600">
                إجمالي المبلغ (جنيه)
              </div>
            </div>

            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {formatMoney(totalAmountUSD)} USD
              </div>
              <div className="text-sm text-gray-600">
                إجمالي المبلغ (دولار)
              </div>
            </div>

            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">
                {salaryPayments.length}
              </div>
              <div className="text-sm text-gray-600">
                مدفوعات الرواتب
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    الموظف
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    نوع الدفعة
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    المبلغ
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    طريقة الدفع
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    تاريخ الدفع
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paymentList.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                      لا توجد مدفوعات
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
                          {payment.paymentType === 'salary' ? 'راتب' :
                            payment.paymentType === 'advance' ? 'سلفة' :
                              payment.paymentType === 'daily' ? 'يومية' :
                                payment.paymentType === 'loan' ? 'عهدة' : 'تحت الحساب'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                        {formatMoney(payment.amount || 0)} {payment.currency}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                        {payment.paymentMethod === 'cash' ? 'نقداً' :
                          payment.paymentMethod === 'bank_transfer' ? 'تحويل بنكي' :
                            payment.paymentMethod === 'check' ? 'شيك' : 'أخرى'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                        {new Date(payment.paymentDate || payment.createdAt).toLocaleDateString('ar-EG')}
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
      toast.info('جاري إنشاء التقرير كصورة...');

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
        link.download = `الهلالي-${getReportTitle()}-${new Date().toISOString().split('T')[0]}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();

        toast.success('تم إنشاء التقرير كصورة بنجاح! (يحتفظ بالنصوص العربية كما تراها)');
      }
    } catch (error) {
      console.error('Error exporting as image:', error);
      toast.error('خطأ في إنشاء التقرير كصورة');
    }
  };

  const handleExportAsHTML = async () => {
    try {
      toast.info('جاري إنشاء التقرير كصفحة ويب...');

      if (chartRef.current) {
        // Create full HTML content
        const htmlContent = `
<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>تقرير شركة الهلالي للمقاولات - ${getReportTitle()}</title>
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
            <h1>شركة الهلالي للمقاولات والبناء</h1>
            <p>قسم الطرق والبنية التحتية</p>
            <h2>${getReportTitle()}</h2>
            <p>تاريخ إنشاء التقرير: ${new Date().toLocaleDateString('ar-SA')}</p>
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
        link.download = `الهلالي-${getReportTitle()}-${new Date().toISOString().split('T')[0]}.html`;
        link.click();

        toast.success('تم إنشاء التقرير كصفحة ويب بنجاح! (يمكن طباعته من المتصفح مع النصوص العربية)');
      }
    } catch (error) {
      console.error('Error exporting as HTML:', error);
      toast.error('خطأ في إنشاء التقرير كصفحة ويب');
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

      toast.info('جاري إنشاء التقرير...');

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

      toast.success('تم إنشاء ملف PDF بنجاح! (النصوص بالإنجليزية لتجنب مشاكل الترميز)');
    } catch (error) {
      console.error('Error exporting report:', error);
      toast.error('خطأ في إنشاء التقرير');
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
      case 'overview':
        return 'نظرة عامة';
      case 'financial':
        return 'التقرير المالي';
      case 'projects':
        return 'تقرير المشاريع';
      case 'sections':
        return 'تقرير الأقسام';
      case 'inventory':
        return 'تقرير المخزون';
      case 'employees':
        return 'تقرير العاملين';
      case 'payments':
        return 'تقرير المدفوعات';
      default:
        return '';
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
        <p className="text-gray-600 font-medium">جاري تحميل التقارير...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <PresentationChartLineIcon className="h-8 w-8 text-blue-600 mr-3" />
          <h1 className="text-2xl font-bold text-gray-900">تقارير النظام</h1>
        </div>
        <button
          type="button"
          onClick={handleExportReport}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <ArrowDownTrayIcon className="mr-2 h-5 w-5" aria-hidden="true" />
          تحميل التقرير PDF
        </button>
      </div>

      {/* Report Settings */}
      <div className="bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
          إعدادات التقرير
        </h3>

        {/* Filter Options */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">نوع التصفية</label>
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
                <span className="ml-2 text-sm text-gray-700">حسب التاريخ</span>
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
                <span className="ml-2 text-sm text-gray-700">حسب المشروع</span>
              </label>
            </div>
          </div>

          {filterBy === 'date' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">الفترة الزمنية</label>
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value as any)}
                className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
              >
                <option value="month">شهر واحد</option>
                <option value="quarter">3 شهور</option>
                <option value="half_year">6 شهور</option>
                <option value="year">سنة كاملة</option>
              </select>
            </div>
          )}

          {filterBy === 'project' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">المشروع</label>
              <select
                value={selectedProject}
                onChange={(e) => setSelectedProject(e.target.value)}
                className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
              >
                <option value="all">جميع المشاريع</option>
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
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[
            { key: 'overview', label: 'نظرة عامة', icon: ChartBarIcon },
            { key: 'financial', label: 'التقرير المالي', icon: CurrencyDollarIcon },
            { key: 'projects', label: 'تقرير المشاريع', icon: BuildingOfficeIcon },
            { key: 'sections', label: 'تقرير الأقسام', icon: DocumentTextIcon },
            { key: 'inventory', label: 'تقرير المخزون', icon: ArrowTrendingUpIcon },
            { key: 'employees', label: 'تقرير العاملين', icon: UsersIcon },
            { key: 'payments', label: 'تقرير المدفوعات', icon: CurrencyDollarIcon }
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

      {/* Report Content */}
      <div ref={chartRef}>
        <div className="mb-4">
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            {getReportTitle()}
          </h2>
        </div>
        {renderReportContent()}
      </div>

      {/* Enhanced Footer */}
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-6 sm:rounded-lg border border-gray-200">
        <div className="text-center">
          <div className="flex items-center justify-center mb-4">
            <div className="h-1 w-16 bg-blue-500 rounded-full mr-3"></div>
            <h3 className="text-lg font-semibold text-gray-800">شركة الهلالي للمقاولات</h3>
            <div className="h-1 w-16 bg-blue-500 rounded-full ml-3"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm text-gray-600">
            <div className="text-center">
              <p className="font-medium text-gray-700 mb-2">📊 إحصائيات التقرير</p>
              <div className="space-y-1">
                <p>📁 {filteredData.projects.length} مشروع نشط</p>
                <p>🏗️ {filteredData.sections.length} قسم تنفيذي</p>
                <p>💰 {filteredData.spendings.length} عملية مصروف</p>
                <p>📦 {filteredData.inventory.length} عنصر مخزون</p>
              </div>
            </div>

            <div className="text-center">
              <p className="font-medium text-gray-700 mb-2">🕐 معلومات التوقيت</p>
              <div className="space-y-1">
                <p>آخر تحديث: {new Date().toLocaleDateString('ar-SA')}</p>
                <p>الوقت: {new Date().toLocaleTimeString('ar-SA')}</p>
                {filterBy === 'project' && selectedProject !== 'all' && (
                  <p className="text-blue-600 font-medium">
                    🎯 مصفى حسب: {projects.find(p => p.id === selectedProject)?.name}
                  </p>
                )}
              </div>
            </div>

            <div className="text-center">
              <p className="font-medium text-gray-700 mb-2">🎯 نوع التقرير</p>
              <div className="space-y-1">
                <p className="text-blue-600 font-semibold">{getReportTitle()}</p>
                <p>📋 تقرير شامل ومفصل</p>
                <p>✅ معتمد للطباعة والمشاركة</p>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-gray-300">
            <p className="text-xs text-gray-500">
              نظام إدارة المشاريع والتقارير - شركة الهلالي للمقاولات والبناء © {new Date().getFullYear()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports; 