import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeftIcon,
  PencilIcon,
  TrashIcon,
  PlusIcon
} from '@heroicons/react/24/outline';
import api from '../services/api';
import { mockGetProjectById, mockDeleteSection, mockCreateSpending, mockDeleteSpending, mockDeleteProject } from '../services/mockApi';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useCurrency } from '../contexts/CurrencyContext';
import { toast } from 'react-toastify';
import useDashboardState from '../hooks/useDashboardState';

// Flag to use mock API for development
const USE_MOCK_API = true;

type Section = {
  id: string;
  name: string;
  description: string;
  status: 'not_started' | 'in_progress' | 'completed';
  manager: string; // Changed from assignedTo to manager to match mock data
  // New fields for road construction
  targetQuantity: number;
  completedQuantity: number;
  progress: number; // Auto-calculated
  budget?: number;
  employees?: number;
  details?: string;
};

type Spending = {
  id: string;
  date: string;
  amount: number;
  category: string;
  description: string;
};

type Project = {
  id: string;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  status: 'not_started' | 'in_progress' | 'completed';
  budget: number;
  manager: string;
  // New fields for road construction
  totalLength: number;
  unit: 'km' | 'm' | 'sq_m' | 'units';
  progress?: number;
  sections: Section[];
  spendings: Spending[];
};

const ProjectDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t, language } = useLanguage();
  const { formatMoney } = useCurrency();
  const queryClient = useQueryClient();
  const isAdmin = user?.role === 'admin';

  // SENIOR DEVELOPER PATTERN: Centralized state management
  const { spendingOperations, sectionOperations, debugLog, healthCheck } = useDashboardState({
    enableDebugging: true,
    enableOptimisticUpdates: false, // Project details don't need optimistic updates
    refetchDelay: 0
  });
  const [activeTab, setActiveTab] = useState<'overview' | 'sections' | 'spendings'>('overview');

  const [showAddSpendingModal, setShowAddSpendingModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);



  const [newSpending, setNewSpending] = useState({
    date: new Date().toISOString().split('T')[0],
    amount: 0,
    category: '',
    description: ''
  });



  // Fetch project data with proper error handling
  const { data: project, isLoading, error } = useQuery<Project>(
    ['project', id],
    async () => {
      if (!id) throw new Error('Project ID is required');

      try {
        if (USE_MOCK_API) {
          return await mockGetProjectById(id);
        } else {
          const res = await api.get(`/projects/${id}`);
          // Backend returns { success: true, data: { ...project } }
          return res.data.data || res.data;
        }
      } catch (error) {
        console.error('Error fetching project:', error);
        throw new Error(t('messages', 'networkError'));
      }
    },
    {
      enabled: !!id,
      retry: 1,
      onError: (error: Error) => {
        toast.error(error.message);
      }
    }
  );

  const calculateTotalSpending = (spendings: Spending[]) => {
    return spendings.reduce((total, spending) => total + spending.amount, 0);
  };

  const calculateOverallProgress = (sections: Section[]) => {
    if (sections.length === 0) return 0;
    const totalProgress = sections.reduce((total, section) => total + section.progress, 0);
    return Math.round(totalProgress / sections.length);
  };

  const getStatusBadgeClass = (status: Project['status'] | Section['status']) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'not_started':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatStatusText = (status: Project['status'] | Section['status']) => {
    switch (status) {
      case 'completed':
        return t('projects', 'completed');
      case 'in_progress':
        return t('projects', 'inProgress');
      case 'not_started':
        return t('projects', 'notStarted');
      default:
        return status;
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setNewSpending(prev => ({
      ...prev,
      [name]: name === 'amount' ? parseFloat(value) : value
    }));
  };



  // Create spending mutation - يستخدم مسار /api/spendings مع projectId لربط المصروف بالمشروع والتقارير
  const addSpendingMutation = useMutation(
    async (spendingData: any) => {
      if (!id) throw new Error('Project ID is required');

      const spendingWithProjectId = {
        ...spendingData,
        projectId: id
      };

      if (USE_MOCK_API) {
        return await mockCreateSpending(spendingWithProjectId);
      } else {
        const response = await api.post('/spendings', spendingWithProjectId);
        const data = response.data?.data || response.data;
        return { ...data, id: data?._id ?? data?.id };
      }
    },
    {
      onSuccess: async (newSpending) => {
        debugLog('💰 Spending creation success - executing professional state management...');

        // Execute centralized state management
        await spendingOperations.onCreate(newSpending);

        // Special handling for project-specific invalidation
        queryClient.invalidateQueries(['project', id]);
        queryClient.refetchQueries(['project', id]);

        // Verify system health
        healthCheck();

        toast.success(t('projectDetails', 'spendingAddedSuccess'));
        setShowAddSpendingModal(false);
        setNewSpending({
          date: new Date().toISOString().split('T')[0],
          amount: 0,
          category: '',
          description: ''
        });
      },
      onError: (error) => {
        console.error('Add spending error:', error);
        toast.error(t('projectDetails', 'spendingAddedError'));
      },
      onSettled: () => {
        setIsSubmitting(false);
      }
    }
  );

  const handleAddSpending = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form
    if (!newSpending.date) {
      toast.error(t('validation', 'dateRequired') || 'Date is required');
      return;
    }

    if (newSpending.amount <= 0) {
      toast.error(t('validation', 'amountMustBePositive') || 'Amount must be a positive number');
      return;
    }

    if (newSpending.category.trim() === '') {
      toast.error(t('validation', 'categoryRequired') || 'Category is required');
      return;
    }

    setIsSubmitting(true);
    addSpendingMutation.mutate(newSpending);
  };

  // Delete section mutation
  const deleteSectionMutation = useMutation(
    async (sectionId: string) => {
      if (!id) throw new Error('Project ID is required');

      if (USE_MOCK_API) {
        return await mockDeleteSection(sectionId);
      } else {
        return await api.delete(`/projects/${id}/sections/${sectionId}`);
      }
    },
    {
      onSuccess: async (_, sectionId) => {
        debugLog('🗑️ Section deletion from project - executing professional state management...');

        // Execute centralized state management
        await sectionOperations.onDelete(sectionId);

        // Special handling for project-specific invalidation
        queryClient.invalidateQueries(['project', id]);
        queryClient.refetchQueries(['project', id]);

        // Verify system health
        healthCheck();

        toast.success(t('messages', 'successfulOperation'));
      },
      onError: (error) => {
        console.error('Delete section error:', error);
        toast.error(t('messages', 'errorOperation'));
      }
    }
  );

  const handleDeleteSection = async (sectionId: string) => {
    if (window.confirm(t('messages', 'confirmDelete'))) {
      deleteSectionMutation.mutate(sectionId);
    }
  };

  // Delete spending mutation - يستخدم مسار /api/spendings/:id
  const deleteSpendingMutation = useMutation(
    async (spendingId: string) => {
      if (!id) throw new Error('Project ID is required');

      if (USE_MOCK_API) {
        return await mockDeleteSpending(spendingId);
      } else {
        return await api.delete(`/spendings/${spendingId}`);
      }
    },
    {
      onSuccess: async (_, spendingId) => {
        debugLog('🗑️ Spending deletion from project - executing professional state management...');

        // Execute centralized state management
        await spendingOperations.onDelete(spendingId);

        // Special handling for project-specific invalidation
        queryClient.invalidateQueries(['project', id]);
        queryClient.refetchQueries(['project', id]);

        // Verify system health
        healthCheck();

        toast.success(t('messages', 'successfulOperation'));
      },
      onError: (error) => {
        console.error('Delete spending error:', error);
        toast.error(t('messages', 'errorOperation'));
      }
    }
  );

  const handleDeleteSpending = async (spendingId: string) => {
    if (window.confirm(t('messages', 'confirmDelete'))) {
      deleteSpendingMutation.mutate(spendingId);
    }
  };

  // Delete project mutation
  const deleteProjectMutation = useMutation(
    async () => {
      if (!id) throw new Error('Project ID is required');

      if (USE_MOCK_API) {
        return await mockDeleteProject(id);
      } else {
        return await api.delete(`/projects/${id}`);
      }
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['projects']);
        toast.success(t('projectDetails', 'deleteProjectSuccess'));
        navigate('/projects');
      },
      onError: (error) => {
        console.error('Delete project error:', error);
        toast.error(t('projectDetails', 'deleteProjectError'));
      }
    }
  );

  const handleDeleteProject = async () => {
    if (window.confirm(t('projectDetails', 'deleteProjectConfirm'))) {
      deleteProjectMutation.mutate();
    }
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-64">{t('common', 'loading') || 'Loading...'}</div>;
  }

  if (error || !project) {
    return (
      <div className="text-center py-12">
        <p className="text-xl text-gray-500">{t('projects', 'notFound') || 'Project not found'}</p>
        <Link
          to="/projects"
          className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
        >
          {t('projectDetails', 'backToProjects')}
        </Link>
      </div>
    );
  }

  const totalSpending = calculateTotalSpending(project.spendings);
  const remainingBudget = project.budget - totalSpending;
  const overallProgress = calculateOverallProgress(project.sections);

  return (
    <div className="space-y-6" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      {/* Header with back button and project title */}
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Link
            to="/projects"
            className={`${language === 'ar' ? 'ml-4' : 'mr-4'} text-gray-400 hover:text-gray-500`}
          >
            <ArrowLeftIcon className="h-5 w-5" aria-hidden="true" />
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">{project.name}</h1>
        </div>
        {isAdmin && (
          <div className="flex">
            <Link
              to={`/projects/${id}/edit`}
              className={`${language === 'ar' ? 'ml-2' : 'mr-2'} inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500`}
            >
              <PencilIcon className={`${language === 'ar' ? 'ml-2' : 'mr-2'} -ml-0.5 h-4 w-4`} aria-hidden="true" />
              {t('projectDetails', 'editProject')}
            </Link>
            <button
              onClick={handleDeleteProject}
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              <TrashIcon className={`${language === 'ar' ? 'ml-2' : 'mr-2'} -ml-0.5 h-4 w-4`} aria-hidden="true" />
              {t('projectDetails', 'deleteProject')}
            </button>
          </div>
        )}
      </div>

      {/* Project description */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md p-4 sm:p-6">
        <p className="text-gray-600">{project.description}</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex" aria-label="Tabs">
          <button
            onClick={() => setActiveTab('overview')}
            className={`${activeTab === 'overview'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } w-1/3 py-4 px-1 text-center border-b-2 font-medium text-sm`}
          >
            {t('projectDetails', 'overview')}
          </button>
          <button
            onClick={() => setActiveTab('sections')}
            className={`${activeTab === 'sections'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } w-1/3 py-4 px-1 text-center border-b-2 font-medium text-sm`}
          >
            {t('projectDetails', 'sections')}
          </button>
          <button
            onClick={() => setActiveTab('spendings')}
            className={`${activeTab === 'spendings'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } w-1/3 py-4 px-1 text-center border-b-2 font-medium text-sm`}
          >
            {t('projectDetails', 'spendings')}
          </button>
        </nav>
      </div>

      {/* Tab content */}
      <div>
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-4">
            {/* Overview cards */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {/* Budget Card */}
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    {t('projectDetails', 'totalBudget')}
                  </dt>
                  <dd className="mt-1 text-3xl font-semibold text-gray-900">
                    {formatMoney(project.budget)}
                  </dd>
                </div>
              </div>

              {/* Spent Card */}
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    {t('projectDetails', 'spentSoFar')}
                  </dt>
                  <dd className="mt-1 text-3xl font-semibold text-gray-900">
                    {formatMoney(totalSpending)}
                  </dd>
                </div>
              </div>

              {/* Remaining Card */}
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    {t('projectDetails', 'remaining')}
                  </dt>
                  <dd className={`mt-1 text-3xl font-semibold ${remainingBudget < 0 ? 'text-red-600' : 'text-green-600'}`}>
                    {formatMoney(remainingBudget)}
                  </dd>
                </div>
              </div>

              {/* Progress Card */}
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    {t('projectDetails', 'overallProgress')}
                  </dt>
                  <dd className="mt-1 text-3xl font-semibold text-gray-900">
                    {overallProgress}%
                  </dd>
                </div>
              </div>
            </div>

            {/* Project details */}
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
              <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2 p-6">
                <div>
                  <dt className="text-sm font-medium text-gray-500">{t('projectDetails', 'startDate')}</dt>
                  <dd className="mt-1 text-sm text-gray-900">{new Date(project.startDate).toLocaleDateString()}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">{t('projectDetails', 'endDate')}</dt>
                  <dd className="mt-1 text-sm text-gray-900">{new Date(project.endDate).toLocaleDateString()}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">{t('projectDetails', 'manager')}</dt>
                  <dd className="mt-1 text-sm text-gray-900">{project.manager}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">{t('projects', 'status')}</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(project.status)}`}>
                      {formatStatusText(project.status)}
                    </span>
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        )}

        {/* Sections Tab */}
        {activeTab === 'sections' && (
          <div className="space-y-4">
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
              {project.sections && project.sections.length > 0 ? (
                <ul className="divide-y divide-gray-200">
                  {project.sections.map((section) => (
                    <li key={section.id} className="px-4 py-4 sm:px-6">
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-blue-600 truncate">
                            {section.name}
                          </p>
                          <p className="mt-1 text-sm text-gray-500 truncate">
                            {section.description}
                          </p>
                        </div>
                        <div className={`${language === 'ar' ? 'mr-4' : 'ml-4'} flex-shrink-0 flex`}>
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(section.status)}`}>
                            {formatStatusText(section.status)}
                          </span>
                          {isAdmin && (
                            <button
                              onClick={() => handleDeleteSection(section.id)}
                              className={`${language === 'ar' ? 'mr-2' : 'ml-2'} text-red-400 hover:text-red-500`}
                            >
                              <TrashIcon className="h-5 w-5" aria-hidden="true" />
                            </button>
                          )}
                        </div>
                      </div>
                      <div className="mt-2 sm:flex sm:justify-between">
                        <div className="sm:flex flex-wrap">
                          <p className="flex items-center text-sm text-gray-500 mr-4 mb-2">
                            {t('projects', 'manager')}: {section.manager}
                          </p>
                          <p className="flex items-center text-sm text-gray-500 mr-4 mb-2">
                            {t('projects', 'targetQuantity')}: {section.targetQuantity}
                            {project.unit === 'km' ? ' كم' : project.unit === 'm' ? ' م' : project.unit === 'sq_m' ? ' م²' : ' وحدة'}
                          </p>
                          <p className="flex items-center text-sm text-gray-500 mb-2">
                            {t('projects', 'completedQuantity')}: {section.completedQuantity}
                            {project.unit === 'km' ? ' كم' : project.unit === 'm' ? ' م' : project.unit === 'sq_m' ? ' م²' : ' وحدة'}
                          </p>
                        </div>
                        <div className={`${language === 'ar' ? 'mr-4' : 'ml-4'} mt-2 flex items-center text-sm text-gray-500 sm:mt-0`}>
                          <p className="flex items-center mr-2">
                            {t('projects', 'progressAutoCalculated')}: {section.progress}%
                          </p>
                          <div className="w-24 bg-gray-200 rounded-full h-2.5">
                            <div
                              className="bg-blue-500 h-2.5 rounded-full"
                              style={{ width: `${section.progress}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="p-6 text-center text-gray-500">
                  {t('common', 'noData')}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Spendings Tab */}
        {activeTab === 'spendings' && (
          <div className="space-y-4">
            {isAdmin && (
              <div className="text-right">
                <button
                  onClick={() => setShowAddSpendingModal(true)}
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <PlusIcon className={`${language === 'ar' ? 'ml-2' : 'mr-2'} -ml-0.5 h-4 w-4`} aria-hidden="true" />
                  {t('projectDetails', 'addSpending')}
                </button>
              </div>
            )}
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
              {project.spendings && project.spendings.length > 0 ? (
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {t('projectDetails', 'date')}
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {t('projectDetails', 'amount')}
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {t('projectDetails', 'category')}
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {t('projectDetails', 'description')}
                      </th>
                      {isAdmin && (
                        <th scope="col" className="relative px-6 py-3">
                          <span className="sr-only">Actions</span>
                        </th>
                      )}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {project.spendings.map((spending) => (
                      <tr key={spending.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(spending.date).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatMoney(spending.amount)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {spending.category}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {spending.description}
                        </td>
                        {isAdmin && (
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button
                              onClick={() => handleDeleteSpending(spending.id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              <TrashIcon className="h-5 w-5" aria-hidden="true" />
                            </button>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="bg-gray-50">
                      <th scope="row" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {t('projectDetails', 'total')}
                      </th>
                      <td className="px-6 py-3 text-left text-xs font-medium text-gray-900">
                        {formatMoney(totalSpending)}
                      </td>
                      <td colSpan={isAdmin ? 3 : 2}></td>
                    </tr>
                  </tfoot>
                </table>
              ) : (
                <div className="p-6 text-center text-gray-500">
                  {t('common', 'noData')}
                </div>
              )}
            </div>
          </div>
        )}
      </div>



      {/* Add Spending Modal */}
      {showAddSpendingModal && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

            <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
              <div>
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  {t('projectDetails', 'createSpending')}
                </h3>
                <form onSubmit={handleAddSpending} className="mt-4">
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="date" className="block text-sm font-medium text-gray-700">
                        {t('projectDetails', 'date')}
                      </label>
                      <input
                        type="date"
                        name="date"
                        id="date"
                        required
                        value={newSpending.date}
                        onChange={handleInputChange}
                        className="mt-1 focus:ring-orange-500 focus:border-orange-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                      />
                    </div>

                    <div>
                      <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
                        {t('projectDetails', 'amount')}
                      </label>
                      <input
                        type="number"
                        name="amount"
                        id="amount"
                        required
                        min="0"
                        step="0.01"
                        value={newSpending.amount}
                        onChange={handleInputChange}
                        className="mt-1 focus:ring-orange-500 focus:border-orange-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                      />
                    </div>

                    <div>
                      <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                        {t('projectDetails', 'category')}
                      </label>
                      <input
                        type="text"
                        name="category"
                        id="category"
                        required
                        value={newSpending.category}
                        onChange={handleInputChange}
                        className="mt-1 focus:ring-orange-500 focus:border-orange-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                      />
                    </div>

                    <div>
                      <label htmlFor="spendingDescription" className="block text-sm font-medium text-gray-700">
                        {t('projectDetails', 'description')}
                      </label>
                      <textarea
                        name="description"
                        id="spendingDescription"
                        rows={3}
                        value={newSpending.description}
                        onChange={handleInputChange}
                        className="mt-1 focus:ring-orange-500 focus:border-orange-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                      />
                    </div>
                  </div>

                  <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-orange-600 text-base font-medium text-white hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:bg-orange-300 sm:col-start-2 sm:text-sm"
                    >
                      {isSubmitting ? t('common', 'loading') : t('projectDetails', 'save')}
                    </button>
                    <button
                      type="button"
                      disabled={isSubmitting}
                      onClick={() => setShowAddSpendingModal(false)}
                      className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:bg-gray-100 sm:mt-0 sm:col-start-1 sm:text-sm"
                    >
                      {t('projectDetails', 'cancel')}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectDetails; 
