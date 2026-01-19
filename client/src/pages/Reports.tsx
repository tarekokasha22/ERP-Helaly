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
import api from '../services/api';
import { mockGetProjects, mockGetSections, mockGetSpendings } from '../services/mockApi';
import { useLanguage } from '../contexts/LanguageContext';
import { useCurrency } from '../contexts/CurrencyContext';
import { toast } from 'react-toastify';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import html2canvas from 'html2canvas';

// Mock inventory API call
const mockGetInventoryItems = async () => {
  await new Promise(resolve => setTimeout(resolve, 300));
  return [
    { id: '1', name: 'أسمنت بورتلاند', category: 'materials', quantity: 500, totalValue: 32500, status: 'in_stock', projectId: '1', lastUpdated: new Date().toISOString() },
    { id: '2', name: 'حديد التسليح 12mm', category: 'materials', quantity: 15, totalValue: 277500, status: 'in_stock', projectId: '2', lastUpdated: new Date().toISOString() },
    { id: '3', name: 'خرطوم مياه 2 بوصة', category: 'equipment', quantity: 2, totalValue: 50, status: 'low_stock', projectId: '1', lastUpdated: new Date().toISOString() },
    { id: '4', name: 'مثقاب كهربائي', category: 'tools', quantity: 8, totalValue: 3600, status: 'in_stock', projectId: '3', lastUpdated: new Date().toISOString() },
    { id: '5', name: 'زيت هيدروليك', category: 'consumables', quantity: 0, totalValue: 0, status: 'out_of_stock', projectId: '2', lastUpdated: new Date().toISOString() }
  ];
};

// Mock employees API call
const mockGetEmployees = async () => {
  await new Promise(resolve => setTimeout(resolve, 300));
  return [
    { id: '1', name: 'أحمد محمد علي', employeeType: 'monthly', position: 'مهندس موقع', monthlySalary: 15000, currency: 'EGP', active: true, hireDate: '2023-01-15' },
    { id: '2', name: 'محمد حسن إبراهيم', employeeType: 'monthly', position: 'مدير مشروع', monthlySalary: 25000, currency: 'EGP', active: true, hireDate: '2022-06-01' },
    { id: '3', name: 'علي محمود أحمد', employeeType: 'piecework', position: 'عامل بناء', pieceworkRate: 150, currency: 'EGP', active: true, hireDate: '2023-03-10' },
    { id: '4', name: 'سعد عبد الرحمن', employeeType: 'piecework', position: 'عامل حفر', pieceworkRate: 200, currency: 'EGP', active: true, hireDate: '2023-05-20' },
    { id: '5', name: 'عمر خالد محمد', employeeType: 'monthly', position: 'مهندس موقع', monthlySalary: 800, currency: 'USD', active: true, hireDate: '2023-02-01' }
  ];
};

// Mock payments API call
const mockGetPayments = async () => {
  await new Promise(resolve => setTimeout(resolve, 300));
  return [
    { id: '1', employeeId: '1', employeeName: 'أحمد محمد علي', paymentType: 'salary', amount: 15000, currency: 'EGP', paymentMethod: 'bank_transfer', paymentDate: '2024-01-01', description: 'راتب شهر يناير' },
    { id: '2', employeeId: '2', employeeName: 'محمد حسن إبراهيم', paymentType: 'salary', amount: 25000, currency: 'EGP', paymentMethod: 'bank_transfer', paymentDate: '2024-01-01', description: 'راتب شهر يناير' },
    { id: '3', employeeId: '1', employeeName: 'أحمد محمد علي', paymentType: 'advance', amount: 5000, currency: 'EGP', paymentMethod: 'cash', paymentDate: '2024-01-15', description: 'سلفة مالية' },
    { id: '4', employeeId: '3', employeeName: 'علي محمود أحمد', paymentType: 'piecework', amount: 3000, currency: 'EGP', paymentMethod: 'cash', paymentDate: '2024-01-20', description: 'دفعة عمل بالقطعة' },
    { id: '5', employeeId: '5', employeeName: 'عمر خالد محمد', paymentType: 'salary', amount: 800, currency: 'USD', paymentMethod: 'bank_transfer', paymentDate: '2024-01-01', description: 'راتب شهر يناير' }
  ];
};

// Flag to use mock API
const USE_MOCK_API = true;

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
  const chartRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();
  const isRtl = language === 'ar';

  // CRITICAL FIX: Auto-refresh for financial reports
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (reportType === 'financial') {
      console.log('🔄 Auto-refresh activated for financial reports');
      interval = setInterval(() => {
        queryClient.invalidateQueries(['projects']);
        queryClient.invalidateQueries(['sections']);
        queryClient.invalidateQueries(['spendings']);
        console.log('💰 Financial data refreshed at:', new Date().toLocaleTimeString());
      }, 5000); // Refresh every 5 seconds
    }

    return () => {
      if (interval) {
        clearInterval(interval);
        console.log('🛑 Auto-refresh stopped');
      }
    };
  }, [reportType, queryClient]);
  
  // CRITICAL FIX: Fetch real data with auto-refresh for financial reports
  const { data: projects = [], isLoading: projectsLoading } = useQuery(['projects'], async () => {
        if (USE_MOCK_API) {
      return await mockGetProjects();
        } else {
      const res = await api.get('/projects');
          return res.data?.data || [];
        }
  }, {
    staleTime: 1000, // 1 second for instant financial updates
    refetchInterval: reportType === 'financial' ? 5000 : false, // Auto-refresh every 5 seconds for financial reports
    refetchOnWindowFocus: true,
    refetchOnMount: true
  });

  const { data: sections = [], isLoading: sectionsLoading } = useQuery(['sections'], async () => {
    if (USE_MOCK_API) {
      return await mockGetSections();
    } else {
      const res = await api.get('/sections');
      return res.data?.data || [];
    }
  }, {
    staleTime: 1000,
    refetchInterval: reportType === 'financial' ? 5000 : false,
    refetchOnWindowFocus: true,
    refetchOnMount: true
  });

  const { data: spendings = [], isLoading: spendingsLoading } = useQuery(['spendings'], async () => {
    if (USE_MOCK_API) {
      return await mockGetSpendings();
    } else {
      const res = await api.get('/spendings');
      return res.data?.data || [];
    }
  }, {
    staleTime: 1000,
    refetchInterval: reportType === 'financial' ? 5000 : false,
    refetchOnWindowFocus: true,
    refetchOnMount: true
  });

  const { data: inventory = [], isLoading: inventoryLoading } = useQuery(['inventory'], async () => {
    if (USE_MOCK_API) {
      return await mockGetInventoryItems();
    } else {
      const res = await api.get('/inventory');
      return res.data?.data || [];
    }
  });

  const { data: employees = [], isLoading: employeesLoading } = useQuery(['employees'], async () => {
    if (USE_MOCK_API) {
      return await mockGetEmployees();
    } else {
      const res = await api.get('/employees');
      return res.data?.data || [];
    }
  });

  const { data: payments = [], isLoading: paymentsLoading } = useQuery(['payments'], async () => {
    if (USE_MOCK_API) {
      return await mockGetPayments();
    } else {
      const res = await api.get('/payments');
      return res.data?.data || [];
    }
  });

  const isLoading = projectsLoading || sectionsLoading || spendingsLoading || inventoryLoading || employeesLoading || paymentsLoading;

  // Filter data based on selected criteria
  const getFilteredData = () => {
    let filteredProjects = projects;
    let filteredSections = sections;
    let filteredSpendings = spendings;
    let filteredInventory = inventory;

    // Apply project filter
    if (filterBy === 'project' && selectedProject !== 'all') {
      filteredSpendings = spendings.filter(s => s.projectId === selectedProject);
      filteredSections = sections.filter(s => s.projectId === selectedProject);
      filteredProjects = projects.filter(p => p.id === selectedProject);
      filteredInventory = inventory.filter(i => i.projectId === selectedProject);
    }

    // Apply date filter with more accurate calculations
    if (filterBy === 'date') {
      const now = new Date();
      let startDate: Date;

      switch (dateRange) {
        case 'month':
          // Current month only
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          break;
        case 'quarter':
          // Last 3 months including current month
          startDate = new Date(now.getFullYear(), now.getMonth() - 2, 1);
          break;
        case 'half_year':
          // Last 6 months including current month
          startDate = new Date(now.getFullYear(), now.getMonth() - 5, 1);
          break;
        case 'year':
          // Current year from January 1st
          startDate = new Date(now.getFullYear(), 0, 1);
          break;
        default:
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      }

      const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0); // End of current month

      // Filter by date range - more accurate filtering
      filteredSpendings = spendings.filter(s => {
        const spendingDate = new Date(s.date || s.createdAt);
        return spendingDate >= startDate && spendingDate <= endDate;
      });

      filteredProjects = projects.filter(p => {
        const projectStartDate = new Date(p.startDate || p.createdAt);
        const projectEndDate = p.endDate ? new Date(p.endDate) : new Date();
        // Include projects that overlap with the selected date range
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
    }
    
    return {
      projects: filteredProjects,
      sections: filteredSections,
      spendings: filteredSpendings,
      inventory: filteredInventory
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
    
    // Budget statistics
    const totalBudget = filteredData.projects.reduce((sum, p) => sum + (p.budget || 0), 0);
    const sectionsBudget = filteredData.sections.reduce((sum, s) => sum + (s.budget || 0), 0);
    const totalSpending = filteredData.spendings.reduce((sum, s) => sum + (s.amount || 0), 0);
    
    // Section statistics
    const totalSections = filteredData.sections.length;
    const activeSections = filteredData.sections.filter(s => s.status === 'in_progress').length;
    const averageProgress = filteredData.sections.length > 0 
      ? filteredData.sections.reduce((sum, s) => sum + (s.progress || 0), 0) / filteredData.sections.length 
      : 0;
    
    // Employee statistics
    const totalEmployees = filteredData.sections.reduce((sum, s) => sum + (s.employees || 0), 0);
    
    // Category breakdown
    const categoryTotals = {
      materials: filteredData.spendings.filter(s => s.category === 'materials').reduce((sum, s) => sum + s.amount, 0),
      labor: filteredData.spendings.filter(s => s.category === 'labor').reduce((sum, s) => sum + s.amount, 0),
      equipment: filteredData.spendings.filter(s => s.category === 'equipment').reduce((sum, s) => sum + s.amount, 0),
      consulting: filteredData.spendings.filter(s => s.category === 'consulting').reduce((sum, s) => sum + s.amount, 0),
      other: filteredData.spendings.filter(s => !['materials', 'labor', 'equipment', 'consulting'].includes(s.category)).reduce((sum, s) => sum + s.amount, 0)
    };

    // Inventory statistics
    const totalInventoryValue = filteredData.inventory.reduce((sum, item) => sum + (item.totalValue || 0), 0);
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
        utilizationRate: totalBudget > 0 ? (totalSpending / totalBudget) * 100 : 0
      },
      sections: {
        total: totalSections,
        active: activeSections,
        averageProgress
      },
      employees: {
        total: totalEmployees
      },
      categories: categoryTotals,
      inventory: {
        totalValue: totalInventoryValue,
        lowStockItems,
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
        change: 'موزعين على الأقسام',
        changeType: 'neutral' as const,
        icon: UsersIcon,
        color: 'pink'
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
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {getDashboardCards().map((card, index) => (
          <div key={index} className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <card.icon 
                    className={`h-6 w-6 text-${card.color}-600`} 
                    aria-hidden="true" 
                  />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      {card.title}
                    </dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-gray-900">
                        {card.value}
                      </div>
                      <div className={`ml-2 flex items-baseline text-sm font-semibold ${
                        card.changeType === 'increase' ? 'text-green-600' : 
                        card.changeType === 'warning' ? 'text-yellow-600' : 'text-gray-600'
                      }`}>
                        {card.changeType === 'increase' && (
                          <ArrowTrendingUpIcon className="self-center flex-shrink-0 h-4 w-4 text-green-500" aria-hidden="true" />
                        )}
                        {card.changeType === 'warning' && (
                          <ArrowTrendingDownIcon className="self-center flex-shrink-0 h-4 w-4 text-yellow-500" aria-hidden="true" />
                        )}
                        <span className="sr-only">
                          {card.changeType === 'increase' ? 'زيادة' : card.changeType === 'warning' ? 'تحذير' : ''}
                        </span>
                        {card.change}
                      </div>
                    </dd>
                  </dl>
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
                  <tr key={project.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {project.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        project.status === 'completed' ? 'bg-green-100 text-green-800' :
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
                  className={`h-3 rounded-full transition-all duration-500 ${
                    stats.budget.utilizationRate < 70 ? 'bg-green-500' :
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
                  <tr key={spending.id} className="hover:bg-gray-50">
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
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        spending.category === 'materials' ? 'bg-blue-100 text-blue-800' :
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
                  <tr key={section.id}>
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
                  <tr key={item.id}>
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
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        item.status === 'in_stock' ? 'bg-green-100 text-green-800' :
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
    const monthlyEmployees = employees.filter(emp => emp.employeeType === 'monthly');
    const pieceworkEmployees = employees.filter(emp => emp.employeeType === 'piecework');
    const activeEmployees = employees.filter(emp => emp.active);
    
    const totalMonthlySalary = monthlyEmployees.reduce((sum, emp) => sum + (emp.monthlySalary || 0), 0);
    
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              توزيع العاملين حسب النوع
            </h3>
            <div className="h-64">
              <Pie data={{
                labels: ['موظفين شهريين', 'عمال بالقطعة'],
                datasets: [{
                  data: [monthlyEmployees.length, pieceworkEmployees.length],
                  backgroundColor: ['#3B82F6', '#8B5CF6'],
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
                  data: [activeEmployees.length, employees.length - activeEmployees.length],
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
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {employees.length}
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
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    الحالة
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {employees.map((employee) => (
                  <tr key={employee.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {employee.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {employee.position}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {employee.employeeType === 'monthly' ? 'شهري' : 'بالقطعة'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {employee.employeeType === 'monthly' 
                        ? `${formatMoney(employee.monthlySalary || 0)} ${employee.currency}`
                        : `${formatMoney(employee.pieceworkRate || 0)} ${employee.currency}`
                      }
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        employee.active 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {employee.active ? 'نشط' : 'غير نشط'}
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

  const renderPaymentsReport = () => {
    const salaryPayments = payments.filter(p => p.paymentType === 'salary');
    const advancePayments = payments.filter(p => p.paymentType === 'advance');
    const pieceworkPayments = payments.filter(p => p.paymentType === 'piecework');
    
    const totalAmountEGP = payments.filter(p => p.currency === 'EGP').reduce((sum, p) => sum + p.amount, 0);
    const totalAmountUSD = payments.filter(p => p.currency === 'USD').reduce((sum, p) => sum + p.amount, 0);
    
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              المدفوعات حسب النوع
            </h3>
            <div className="h-64">
              <Pie data={{
                labels: ['رواتب', 'سلف', 'قطعة', 'عهد', 'تحت الحساب'],
                datasets: [{
                  data: [
                    salaryPayments.length,
                    advancePayments.length,
                    pieceworkPayments.length,
                    payments.filter(p => p.paymentType === 'loan').length,
                    payments.filter(p => p.paymentType === 'on_account').length
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
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {payments.length}
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
                {payments.map((payment) => (
                  <tr key={payment.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {payment.employeeName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {payment.paymentType === 'salary' ? 'راتب' :
                       payment.paymentType === 'advance' ? 'سلف' :
                       payment.paymentType === 'piecework' ? 'قطعة' :
                       payment.paymentType === 'loan' ? 'عهد' : 'تحت الحساب'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatMoney(payment.amount)} {payment.currency}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {payment.paymentMethod === 'cash' ? 'نقداً' :
                       payment.paymentMethod === 'bank_transfer' ? 'تحويل بنكي' :
                       payment.paymentMethod === 'check' ? 'شيك' : 'أخرى'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(payment.paymentDate).toLocaleDateString()}
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
    return <div className="flex justify-center items-center h-64">جاري تحميل التقارير...</div>;
  }

  return (
    <div className="space-y-6" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <PresentationChartLineIcon className="h-8 w-8 text-blue-600 mr-3" />
          <h1 className="text-2xl font-bold text-gray-900">تقارير النظام</h1>
        </div>
        <div className="flex flex-col items-end">
          <div className="flex space-x-2 flex-wrap">
            <button
              type="button"
              onClick={handleExportReport}
              className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <ArrowDownTrayIcon className="mr-2 h-4 w-4" aria-hidden="true" />
              PDF
            </button>
            <button
              type="button"
              onClick={handleExportAsImage}
              className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              📸 صورة
            </button>
            <button
              type="button"
              onClick={handleExportAsHTML}
              className="inline-flex items-center px-3 py-2 border border-green-300 text-sm font-medium rounded-md shadow-sm text-green-700 bg-green-50 hover:bg-green-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              🌐 ويب
            </button>
          </div>
          <div className="text-xs text-gray-500 mt-2 text-right max-w-md">
            <p>📄 <strong>PDF:</strong> نصوص إنجليزية للتوافق</p>
            <p>📸 <strong>صورة:</strong> نصوص عربية عالية الجودة</p>
            <p>🌐 <strong>ويب:</strong> صفحة HTML قابلة للطباعة بالعربية</p>
          </div>
        </div>
      </div>

      {/* Export Options Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <div className="text-2xl">ℹ️</div>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">حل مشكلة الرموز الغريبة في PDF - خيارات التصدير البديلة</h3>
            <div className="mt-2 text-sm text-blue-700 space-y-1">
              <p>📄 <strong>PDF:</strong> ملف PDF بنصوص إنجليزية للتوافق مع جميع البرامج وضمان عدم ظهور رموز غريبة</p>
              <p>📸 <strong>صورة:</strong> صورة عالية الجودة تحتفظ بالنصوص العربية والتنسيق الأصلي كما تراه</p>
              <p>🌐 <strong>صفحة ويب:</strong> ملف HTML يمكن فتحه في المتصفح وطباعته مع النصوص العربية الكاملة</p>
            </div>
          </div>
        </div>
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
                  <option key={project.id} value={project.id}>
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
              className={`p-4 rounded-lg border-2 text-center transition-colors ${
                reportType === report.key
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