// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title, PointElement, LineElement } from 'chart.js';
import { Doughnut, Bar, Line } from 'react-chartjs-2';
import api from '../services/api';
import { mockGetDashboardData, mockGetSections, mockGetProjects, mockGetSpendings } from '../services/mockApi';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useCurrency } from '../contexts/CurrencyContext';
import { toast } from 'react-toastify';
import {
  BanknotesIcon,
  CalendarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ClipboardDocumentListIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  PlusCircleIcon,
  UserCircleIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  BuildingOffice2Icon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';

// Flag to use mock API for development
const USE_MOCK_API = false;

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



// Define types for our dashboard data
interface ProjectStats {
  total: number;
  active: number;
  completed: number;
  notStarted: number;
  percentChange: number;
}

interface FinancialStats {
  totalBudget: number;
  totalSpending: number;
  totalRemaining: number;
  monthlyTrend: number[];
  percentChange: number;
}

interface RecentProject {
  id: string;
  name: string;
  progress: number;
  deadline: string;
}

interface DashboardData {
  projectStats: ProjectStats;
  financialStats: FinancialStats;
  recentProjects: RecentProject[];
}

// Define chart option types
type ChartOptions = {
  responsive: boolean;
  maintainAspectRatio: boolean;
  cutout?: string;
  plugins: {
    legend: {
      position: 'top' | 'right' | 'bottom' | 'left';
      display?: boolean;
      labels?: {
        boxWidth?: number;
        padding?: number;
        usePointStyle?: boolean;
      };
    };
    title?: {
      display: boolean;
      text: string;
      font?: {
        size?: number;
      };
      padding?: number;
    };
    tooltip?: {
      callbacks?: {
        label?: (context: any) => string;
      };
    };
  };
  scales?: {
    x?: {
      grid?: {
        display?: boolean;
      };
    };
    y?: {
      beginAtZero: boolean;
      grid?: {
        display?: boolean;
        drawBorder?: boolean;
      };
      ticks: {
        callback: (value: number) => string;
      };
    };
  };
  borderRadius?: number;
  elements?: {
    line?: {
      tension?: number;
    };
  };
};

// Circular Progress Component
const CircularProgress: React.FC<{ percentage: number; size: number; strokeWidth: number; color: string; bgColor?: string; label?: string }> = ({
  percentage,
  size,
  strokeWidth,
  color,
  bgColor = '#e5e7eb',
  label
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={bgColor}
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-300 ease-in-out"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center flex-col">
        <span className="text-xl font-bold text-gray-800">{Math.round(percentage)}%</span>
        {label && <span className="text-xs text-gray-500 mt-1">{label}</span>}
      </div>
    </div>
  );
};



const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { t, language, formatDate } = useLanguage();
  const { formatMoney } = useCurrency();
  const queryClient = useQueryClient();
  const [timeRange, setTimeRange] = useState<'1_month' | '3_months' | '6_months' | '1_year' | 'all_time'>('all_time');
  const [totalBudget, setTotalBudget] = useState(0);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  // Use mock API for development
  const {
    data: dashboardData,
    isLoading: isDataLoading,
    error: dataError
  } = useQuery(
    ['dashboard', timeRange],
    async () => {
      if (USE_MOCK_API) {
        return await mockGetDashboardData(timeRange);
      } else {
        const res = await api.get(`/dashboard?timeRange=${timeRange}`);
        return res.data;
      }
    },
    {
      onError: (err: any) => {
        console.error('Dashboard data error:', err);
        toast.error(err.message);
      },
      staleTime: 0, // CRITICAL: Always consider data stale for immediate updates
      refetchInterval: 3000, // CRITICAL: Auto-refresh every 3 seconds
      refetchOnWindowFocus: true, // Refetch when window gains focus
      refetchOnMount: 'always', // Always refetch on mount
      enabled: true, // Always enable the query
      retry: false, // Don't retry on failure
      placeholderData: {
        projectStats: {
          total: 0,
          active: 0,
          completed: 0,
          notStarted: 0,
          percentChange: 0
        },
        financialStats: {
          totalBudget: 0,
          totalSpending: 0,
          totalRemaining: 0,
          monthlyTrend: [0, 0, 0, 0, 0, 0],
          percentChange: 0
        },

      } as DashboardData
    }
  );

  // CRITICAL FIX: Fetch projects with better cache management - NO forceRefresh in key for consistent updates
  const { data: projects = [], isLoading: projectsLoading, dataUpdatedAt: projectsUpdatedAt } = useQuery(['projects'], async () => {
    console.log('🔄 Dashboard: Fetching projects data...');
    if (USE_MOCK_API) {
      const data = await mockGetProjects();
      console.log('📊 Dashboard: Received projects data:', data.length, 'projects');
      console.log('📊 Dashboard: Projects details:', data.map(p => ({ name: p.name, status: p.status, startDate: p.startDate, endDate: p.endDate })));
      return data;
    } else {
      const res = await api.get('/projects');
      console.log('📊 Dashboard: API returned projects:', res.data?.data?.length || 0);
      return res.data?.data || [];
    }
  }, {
    staleTime: 0, // CRITICAL: Always consider data stale for immediate updates
    cacheTime: 30000, // Keep cache for 30 seconds
    refetchInterval: 3000, // CRITICAL: Auto-refresh every 3 seconds
    refetchOnWindowFocus: true, // Refetch when window gains focus
    refetchOnMount: 'always', // Always refetch on mount
    enabled: true, // Always enable the query
    retry: false // Don't retry on failure
  });

  const { data: sections = [], isLoading: sectionsLoading, dataUpdatedAt: sectionsUpdatedAt } = useQuery(['sections'], async () => {
    console.log('🔄 Dashboard: Fetching sections data...');
    if (USE_MOCK_API) {
      const data = await mockGetSections();
      console.log('📊 Dashboard: Received sections data:', data.length, 'sections');
      return data;
    } else {
      const res = await api.get('/sections');
      return res.data?.data || [];
    }
  }, {
    staleTime: 0, // CRITICAL: Always consider data stale
    cacheTime: 30000, // Keep cache for 30 seconds
    refetchInterval: 3000, // CRITICAL: Auto-refresh every 3 seconds
    refetchOnWindowFocus: true,
    refetchOnMount: 'always', // Always refetch on mount
    enabled: true, // Always enable the query
    retry: false // Don't retry on failure
  });

  const { data: spendings = [], isLoading: spendingsLoading, dataUpdatedAt: spendingsUpdatedAt } = useQuery(['spendings'], async () => {
    console.log('🔄 Dashboard: Fetching spendings data...');
    if (USE_MOCK_API) {
      const data = await mockGetSpendings();
      console.log('📊 Dashboard: Received spendings data:', data.length, 'spendings');
      return data;
    } else {
      const res = await api.get('/spendings');
      return res.data?.data || [];
    }
  }, {
    staleTime: 0, // CRITICAL: Always consider data stale
    cacheTime: 30000, // Keep cache for 30 seconds
    refetchInterval: 3000, // CRITICAL: Auto-refresh every 3 seconds
    refetchOnWindowFocus: true,
    refetchOnMount: 'always', // Always refetch on mount
    enabled: true, // Always enable the query
    retry: false // Don't retry on failure
  });

  // Calculate total budget from all projects and sections
  useEffect(() => {
    if (projects.length > 0 || sections.length > 0) {
      const projectsBudget = projects.reduce((sum: any, project: any) => sum + (project.budget || 0), 0);
      const sectionsBudget = sections.reduce((sum: any, section: any) => sum + (section.budget || 0), 0);
      setTotalBudget(projectsBudget + sectionsBudget);
    }
  }, [projects, sections]);

  // Real-time update handling via React Query
  // We rely on the refetchInterval (3s) configured in useQuery above
  // This keeps the dashboard in sync without manual event listeners that cause race conditions
  useEffect(() => {
    setLastUpdated(new Date());
  }, [projectsUpdatedAt, sectionsUpdatedAt, spendingsUpdatedAt]);

  // Get filtered data based on time range
  const getFilteredData = () => {
    const now = new Date();
    let startDate: Date;

    switch (timeRange) {
      case '1_month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case '3_months':
        startDate = new Date(now.getFullYear(), now.getMonth() - 2, 1);
        break;
      case '6_months':
        startDate = new Date(now.getFullYear(), now.getMonth() - 5, 1);
        break;
      case '1_year':
        startDate = new Date(now.getFullYear() - 1, now.getMonth(), 1);
        break;
      case 'all_time':
        startDate = new Date(1900, 0, 1); // Start from 1900 to include all projects
        break;
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    }

    const endDate = timeRange === 'all_time'
      ? new Date(new Date().getFullYear() + 10, 11, 31) // Include future projects (up to 10 years ahead)
      : new Date(now.getFullYear(), now.getMonth() + 1, 0);

    // Filter projects based on time range
    const filteredProjects = projects.filter(p => {
      const projectStartDate = new Date(p.startDate || p.createdAt);
      // For filtering purposes, if no end date, assume it's ongoing (use view end date)
      const projectEndDate = p.endDate ? new Date(p.endDate) : endDate;
      const isInRange = (projectStartDate <= endDate && projectEndDate >= startDate);

      // Debug filtering
      if (!isInRange) {
        console.log('📊 Dashboard: Project filtered out:', p.name, 'Start:', projectStartDate, 'End:', projectEndDate, 'Range:', startDate, 'to', endDate);
      }

      return isInRange;
    });

    console.log('📊 Dashboard: Time range filtering - Original projects:', projects.length, 'Filtered projects:', filteredProjects.length, 'Time range:', timeRange);

    // Filter spendings based on time range
    const filteredSpendings = spendings.filter(s => {
      const spendingDate = new Date(s.date || s.createdAt);
      return spendingDate >= startDate && spendingDate <= endDate;
    });

    // Filter sections based on time range
    const filteredSections = sections.filter(s => {
      const sectionDate = new Date(s.createdAt);
      return sectionDate >= startDate && sectionDate <= endDate;
    });

    return {
      projects: filteredProjects,
      spendings: filteredSpendings,
      sections: filteredSections,
      startDate,
      endDate
    };
  };

  // Generate progress timeline data based on real project data
  const generateProgressTimelineData = () => {
    const filteredData = getFilteredData();
    const { startDate, endDate } = filteredData;

    // Create time period labels based on time range
    const labels = [];
    const dataPoints = [];

    if (timeRange === 'all_time') {
      // For all time, show yearly data
      const startYear = startDate.getFullYear();
      const endYear = endDate.getFullYear();

      for (let year = startYear; year <= endYear; year++) {
        labels.push(year.toString());

        const yearProjects = filteredData.projects.filter(p => {
          const projectDate = new Date(p.startDate || p.createdAt);
          return projectDate.getFullYear() === year;
        });

        const avgProgress = yearProjects.length > 0
          ? yearProjects.reduce((sum, p) => sum + p.progress, 0) / yearProjects.length
          : 0;

        dataPoints.push(Math.round(avgProgress));
      }
    } else {
      // For other ranges, show monthly data
      const currentDate = new Date(startDate);

      while (currentDate <= endDate) {
        const monthLabel = currentDate.toLocaleDateString('ar-EG', { month: 'short', year: 'numeric' });
        labels.push(monthLabel);

        // Calculate average progress for projects in this month
        const monthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        const monthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

        const monthProjects = filteredData.projects.filter(p => {
          const projectDate = new Date(p.startDate || p.createdAt);
          return projectDate >= monthStart && projectDate <= monthEnd;
        });

        const avgProgress = monthProjects.length > 0
          ? monthProjects.reduce((sum, p) => sum + p.progress, 0) / monthProjects.length
          : 0;

        dataPoints.push(Math.round(avgProgress));
        currentDate.setMonth(currentDate.getMonth() + 1);
      }
    }

    return { labels, dataPoints };
  };

  // Recalculate dashboard data based on real data
  const calculateRealDashboardData = () => {
    console.log('🧮 Dashboard: Calculating real dashboard data...');
    console.log('📊 Dashboard: Raw data - Projects:', projects.length, 'Sections:', sections.length, 'Spendings:', spendings.length);

    const filteredData = getFilteredData();
    console.log('📊 Dashboard: Filtered data - Projects:', filteredData.projects.length, 'Sections:', filteredData.sections.length, 'Spendings:', filteredData.spendings.length);

    const totalProjects = filteredData.projects.length;
    const activeProjects = filteredData.projects.filter(p => p.status === 'in_progress' || p.status === 'active').length;
    const completedProjects = filteredData.projects.filter(p => p.status === 'completed').length;
    const notStartedProjects = filteredData.projects.filter(p => p.status === 'not_started' || p.status === 'pending').length;

    // Debug project statuses
    const projectStatusDebug = filteredData.projects.map(p => ({ name: p.name, status: p.status }));
    console.log('📊 Dashboard: Project statuses breakdown:', projectStatusDebug);
    console.log('📊 Dashboard: Status counts - Total:', totalProjects, 'Active:', activeProjects, 'Completed:', completedProjects, 'Not Started:', notStartedProjects);

    const totalSpending = filteredData.spendings.reduce((sum, s) => sum + (s.amount || 0), 0);
    const projectsBudget = filteredData.projects.reduce((sum, p) => sum + (p.budget || 0), 0);
    const sectionsBudget = filteredData.sections.reduce((sum, s) => sum + (s.budget || 0), 0);
    const totalBudget = projectsBudget + sectionsBudget;
    const totalRemaining = totalBudget - totalSpending;

    console.log('📊 Dashboard: Calculated stats - Total:', totalProjects, 'Active:', activeProjects, 'Completed:', completedProjects, 'Budget:', totalBudget, 'Spending:', totalSpending);

    return {
      projectStats: {
        total: totalProjects,
        active: activeProjects,
        completed: completedProjects,
        notStarted: notStartedProjects,
        percentChange: 0
      },
      financialStats: {
        totalBudget,
        totalSpending,
        totalRemaining,
        monthlyTrend: [0, 0, 0, 0, 0, 0],
        percentChange: 0
      },

    };
  };

  const realDashboardData = calculateRealDashboardData();

  // Debug: Log when dashboard data changes
  console.log('🎯 Dashboard: Displaying stats - Total projects:', realDashboardData.projectStats.total, 'Active:', realDashboardData.projectStats.active, 'Completed:', realDashboardData.projectStats.completed, 'Not Started:', realDashboardData.projectStats.notStarted, 'Updated at:', new Date().toLocaleTimeString());



  // Calculate completion percentage
  const completionPercentage = realDashboardData.projectStats.total > 0
    ? (realDashboardData.projectStats.completed / realDashboardData.projectStats.total) * 100
    : 0;

  // Calculate budget utilization percentage
  const budgetUtilization = totalBudget > 0
    ? (realDashboardData.financialStats.totalSpending / totalBudget) * 100
    : 0;

  // Project status chart data using real data
  const projectStatusData = {
    labels: ['مكتمل', 'قيد التنفيذ', 'لم يبدأ'],
    datasets: [
      {
        label: 'نظرة عامة على المشاريع',
        data: [
          realDashboardData.projectStats.completed,
          realDashboardData.projectStats.active,
          realDashboardData.projectStats.notStarted
        ],
        backgroundColor: ['#10B981', '#3B82F6', '#6B7280'],
        borderWidth: 0,
        hoverOffset: 4
      },
    ],
  };



  // Progress chart data using real project data
  const timelineData = generateProgressTimelineData();
  const progressData = {
    labels: timelineData.labels,
    datasets: [
      {
        label: 'اكتمال المشروع',
        data: timelineData.dataPoints,
        borderColor: '#10B981',
        backgroundColor: 'rgba(16, 185, 129, 0.2)',
        tension: 0.4,
        fill: true
      }
    ],
  };

  // Chart options
  const projectStatusOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '70%',
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          usePointStyle: true,
          boxWidth: 8,
          padding: 15
        }
      }
    }
  };



  const progressOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        grid: {
          display: false
        }
      },
      y: {
        beginAtZero: true,
        ticks: {
          callback: (value) => `${value}%`
        }
      }
    },
    plugins: {
      legend: {
        display: false
      }
    },
    elements: {
      line: {
        tension: 0.4
      }
    }
  };



  // Extract data for the view


  if (isDataLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  if (dataError) {
    return (
      <div className="bg-red-50 border-l-4 border-red-500 p-4 my-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <ExclamationCircleIcon className="h-5 w-5 text-red-500" />
          </div>
          <div className="ml-3">
            <p className="text-sm text-red-700">
              {dataError.message}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 p-2 sm:p-4 lg:p-6">
      {/* Header Section - Responsive */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">لوحة التحكم</h1>
          <p className="text-sm text-gray-500 mt-1">مرحباً {user?.name}, إليك نظرة عامة على أداء النظام</p>
          <div className="flex items-center mt-2 text-xs text-gray-400">
            <div className="flex items-center">
              <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
              <span>التحديث الآني مفعل</span>
            </div>
            <span className="mx-2">•</span>
            <span>آخر تحديث: {lastUpdated.toLocaleTimeString('ar-SA')}</span>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <select
            className="px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as any)}
          >
            <option value="1_month">1 شهر</option>
            <option value="3_months">3 شهور</option>
            <option value="6_months">6 شهور</option>
            <option value="1_year">سنة واحدة</option>
            <option value="all_time">كل الأوقات</option>
          </select>
        </div>
      </div>

      {/* Key Metrics Grid - Enhanced Responsive */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        {/* Total Projects Card */}
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden border border-blue-200">
          <div className="p-4 lg:p-6">
            <div className="flex items-center justify-between mb-3">
              <div className="flex-shrink-0 rounded-full bg-blue-100 p-2 border border-blue-200">
                <ClipboardDocumentListIcon className="h-5 w-5 text-blue-600" />
              </div>
              <div className="text-right">
                <div className="text-2xl lg:text-3xl font-bold text-gray-900">
                  {realDashboardData.projectStats.total}
                </div>
                <div className="text-xs lg:text-sm font-medium text-gray-600">
                  إجمالي المشاريع
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <Link to="/projects" className="text-xs lg:text-sm font-medium text-blue-600 hover:text-blue-800">
                عرض الكل ←
              </Link>
              <div className="flex space-x-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <div className="w-2 h-2 bg-blue-300 rounded-full"></div>
                <div className="w-2 h-2 bg-blue-200 rounded-full"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Active Projects Card */}
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden border border-green-200">
          <div className="p-4 lg:p-6">
            <div className="flex items-center justify-between mb-3">
              <div className="flex-shrink-0 rounded-full bg-green-100 p-2 border border-green-200">
                <ArrowRightIcon className="h-5 w-5 text-green-600" />
              </div>
              <div className="text-right">
                <div className="text-2xl lg:text-3xl font-bold text-gray-900">
                  {realDashboardData.projectStats.active}
                </div>
                <div className="text-xs lg:text-sm font-medium text-gray-600">
                  مشاريع نشطة
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <Link to="/projects" className="text-xs lg:text-sm font-medium text-green-600 hover:text-green-800">
                قيد التنفيذ ←
              </Link>
              <div className="flex space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <div className="w-2 h-2 bg-green-300 rounded-full"></div>
                <div className="w-2 h-2 bg-green-200 rounded-full"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Completed Projects Card */}
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden border border-purple-200">
          <div className="p-4 lg:p-6">
            <div className="flex items-center justify-between mb-3">
              <div className="flex-shrink-0 rounded-full bg-purple-100 p-2 border border-purple-200">
                <CheckCircleIcon className="h-5 w-5 text-purple-600" />
              </div>
              <div className="text-right">
                <div className="text-2xl lg:text-3xl font-bold text-gray-900">
                  {realDashboardData.projectStats.completed}
                </div>
                <div className="text-xs lg:text-sm font-medium text-gray-600">
                  مشاريع مكتملة
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs lg:text-sm font-medium text-purple-600">
                {completionPercentage.toFixed(1)}% معدل الإنجاز
              </span>
              <div className="flex space-x-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <div className="w-2 h-2 bg-purple-300 rounded-full"></div>
                <div className="w-2 h-2 bg-purple-200 rounded-full"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Budget Card */}
        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden border border-orange-200">
          <div className="p-4 lg:p-6">
            <div className="flex items-center justify-between mb-3">
              <div className="flex-shrink-0 rounded-full bg-orange-100 p-2 border border-orange-200">
                <CurrencyDollarIcon className="h-5 w-5 text-orange-600" />
              </div>
              <div className="text-right">
                <div className="text-lg lg:text-xl font-bold text-gray-900">
                  {formatMoney(totalBudget)}
                </div>
                <div className="text-xs lg:text-sm font-medium text-gray-600">
                  إجمالي الميزانية
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs lg:text-sm font-medium text-orange-600">
                {formatMoney(realDashboardData.financialStats.totalSpending)} تم الإنفاق
              </span>
              <div className="text-xs text-gray-500">
                {budgetUtilization.toFixed(1)}%
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Advanced Analytics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">

        {/* Project Completion Circle */}
        <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 p-4 lg:p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">معدل الإنجاز</h3>
            <ChartBarIcon className="h-5 w-5 text-gray-400" />
          </div>
          <div className="flex items-center justify-center">
            <CircularProgress
              percentage={completionPercentage}
              size={120}
              strokeWidth={8}
              color="#10B981"
              label="مكتمل"
            />
          </div>
          <div className="mt-4 grid grid-cols-3 gap-2 text-center">
            <div>
              <div className="text-sm font-medium text-green-600">{realDashboardData.projectStats.completed}</div>
              <div className="text-xs text-gray-500">مكتمل</div>
            </div>
            <div>
              <div className="text-sm font-medium text-blue-600">{realDashboardData.projectStats.active}</div>
              <div className="text-xs text-gray-500">نشط</div>
            </div>
            <div>
              <div className="text-sm font-medium text-gray-600">{realDashboardData.projectStats.notStarted}</div>
              <div className="text-xs text-gray-500">لم يبدأ</div>
            </div>
          </div>
        </div>

        {/* Budget Utilization Circle */}
        <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 p-4 lg:p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">استخدام الميزانية</h3>
            <ArrowTrendingUpIcon className="h-5 w-5 text-gray-400" />
          </div>
          <div className="flex items-center justify-center">
            <CircularProgress
              percentage={budgetUtilization}
              size={120}
              strokeWidth={8}
              color={budgetUtilization > 80 ? "#EF4444" : budgetUtilization > 60 ? "#F59E0B" : "#10B981"}
              label="مستخدم"
            />
          </div>
          <div className="mt-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">المتبقي:</span>
              <span className="font-medium">{formatMoney(totalBudget - realDashboardData.financialStats.totalSpending)}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all duration-500 ${budgetUtilization > 80 ? 'bg-red-500' : budgetUtilization > 60 ? 'bg-yellow-500' : 'bg-green-500'
                  }`}
                style={{ width: `${Math.min(budgetUtilization, 100)}%` }}
              ></div>
            </div>
          </div>
        </div>


      </div>

      {/* Charts Section - Enhanced Responsive */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
        {/* Project Status Chart */}
        <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 p-4 lg:p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">توزيع المشاريع</h3>
            <div className="flex space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
            </div>
          </div>
          <div className="h-64 lg:h-80 relative">
            <Doughnut data={projectStatusData} options={projectStatusOptions} />
            <div className="absolute inset-0 flex items-center justify-center flex-col">
              <span className="text-2xl lg:text-3xl font-bold text-gray-800">{realDashboardData.projectStats.total}</span>
              <span className="text-xs lg:text-sm text-gray-500">إجمالي المشاريع</span>
            </div>
          </div>
        </div>

        {/* Progress Timeline Chart */}
        <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 p-4 lg:p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">مخطط التقدم الزمني</h3>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-1 bg-green-500 rounded"></div>
              <span className="text-xs text-gray-500">نسبة الإنجاز</span>
            </div>
          </div>
          <div className="h-64 lg:h-80">
            <Line options={progressOptions} data={progressData} />
          </div>
        </div>
      </div>

      {/* Quick Actions Section */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 lg:p-6 border border-blue-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">إجراءات سريعة</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 lg:gap-4">
          <Link to="/projects" className="flex flex-col items-center p-3 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 border border-gray-200">
            <PlusCircleIcon className="h-8 w-8 text-blue-600 mb-2" />
            <span className="text-sm font-medium text-gray-900">مشروع جديد</span>
          </Link>
          <Link to="/reports" className="flex flex-col items-center p-3 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 border border-gray-200">
            <ChartBarIcon className="h-8 w-8 text-green-600 mb-2" />
            <span className="text-sm font-medium text-gray-900">التقارير</span>
          </Link>
          <Link to="/users" className="flex flex-col items-center p-3 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 border border-gray-200">
            <UserCircleIcon className="h-8 w-8 text-purple-600 mb-2" />
            <span className="text-sm font-medium text-gray-900">إدارة المستخدمين</span>
          </Link>
          <Link to="/sections" className="flex flex-col items-center p-3 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 border border-gray-200">
            <BuildingOffice2Icon className="h-8 w-8 text-orange-600 mb-2" />
            <span className="text-sm font-medium text-gray-900">الأقسام</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 