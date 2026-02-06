import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import api from '../services/api';
import { mockGetProjects, mockCreateProject, mockDeleteProject } from '../services/mockApi';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useCurrency } from '../contexts/CurrencyContext';
import { toast } from 'react-toastify';
import useDashboardState from '../hooks/useDashboardState';

// Flag to use mock API for development
const USE_MOCK_API = true;

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
  totalLength: number; // Total project length/quantity
  unit: 'km' | 'm' | 'sq_m' | 'units'; // Unit of measurement
  progress?: number; // Auto-calculated from sections average
};

const Projects: React.FC = () => {
  const { user } = useAuth();
  const { t, language } = useLanguage();
  const { formatMoney } = useCurrency();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // SENIOR DEVELOPER PATTERN: Centralized state management
  const { projectOperations, debugLog, healthCheck } = useDashboardState({
    enableDebugging: true,
    enableOptimisticUpdates: true,
    refetchDelay: 0 // Immediate updates for professional UX
  });

  const isAdmin = user?.role === 'admin';
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newProject, setNewProject] = useState({
    name: '',
    description: '',
    startDate: '',
    endDate: '',
    status: 'not_started' as const,
    budget: 0,
    manager: '',
    totalLength: 0,
    unit: 'km' as const
  });

  // Fetch projects with proper error handling
  const { data: projects = [], isLoading } = useQuery<Project[]>(
    ['projects'],
    async () => {
      try {
        if (USE_MOCK_API) {
          return await mockGetProjects();
        } else {
          const res = await api.get('/projects');
          return res.data?.data || [];
        }
      } catch (error) {
        console.error('Error fetching projects:', error);
        toast.error(t('messages', 'networkError'));
        return [];
      }
    },
    {
      staleTime: 30000 // 30 seconds
    }
  );

  // Create project mutation
  const createProjectMutation = useMutation(
    async (projectData: any) => {
      if (USE_MOCK_API) {
        return await mockCreateProject(projectData);
      } else {
        const response = await api.post('/projects', projectData);
        return response.data;
      }
    },
    {
      onSuccess: async (newProject) => {
        debugLog('🚀 Project creation success - executing professional state management...');

        // Execute centralized state management
        await projectOperations.onCreate(newProject);

        // Verify system health
        healthCheck();

        // Professional user feedback
        toast.success('تم إنشاء المشروع بنجاح وتحديث لوحة التحكم!');
        setShowCreateModal(false);
        setNewProject({
          name: '',
          description: '',
          startDate: '',
          endDate: '',
          status: 'not_started',
          budget: 0,
          manager: '',
          totalLength: 0,
          unit: 'km'
        });
      },
      onError: (error: any) => {
        console.error('❌ Project creation failed:', error);
        console.log('🔍 Error details for debugging:', {
          message: error?.message || 'Unknown error',
          stack: error?.stack || 'No stack trace',
          timestamp: new Date().toISOString()
        });
        toast.error(t('projects', 'createError') || 'فشل في إنشاء المشروع - يرجى المحاولة مرة أخرى');
      },
      onSettled: () => {
        setIsSubmitting(false);
        console.log('🏁 Project creation mutation settled');
      }
    }
  );

  // Delete project mutation
  const deleteProjectMutation = useMutation(
    async (id: string) => {
      if (USE_MOCK_API) {
        return await mockDeleteProject(id);
      } else {
        return await api.delete(`/projects/${id}`);
      }
    },
    {
      onSuccess: async (_, projectId) => {
        debugLog('🗑️ Project deletion success - executing professional state management...');

        // Execute centralized state management
        await projectOperations.onDelete(projectId);

        // Verify system health
        healthCheck();

        toast.success('تم حذف المشروع بنجاح وتحديث لوحة التحكم!');
      },
      onError: (error) => {
        console.error('Delete project error:', error);
        toast.error(t('projects', 'deleteError'));
      }
    }
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewProject(prev => ({
      ...prev,
      [name]: name === 'budget' || name === 'totalLength' ? parseFloat(value) || 0 : value
    }));
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form
    if (newProject.name.trim() === '') {
      toast.error(t('validation', 'nameRequired'));
      return;
    }

    if (newProject.startDate === '') {
      toast.error(t('validation', 'startDateRequired'));
      return;
    }

    if (newProject.endDate === '') {
      toast.error(t('validation', 'endDateRequired'));
      return;
    }

    if (new Date(newProject.startDate) > new Date(newProject.endDate)) {
      toast.error(t('validation', 'endDateMustBeAfterStartDate'));
      return;
    }

    if (newProject.budget <= 0) {
      toast.error(t('validation', 'budgetMustBePositive'));
      return;
    }

    if (newProject.manager.trim() === '') {
      toast.error(t('validation', 'managerRequired'));
      return;
    }

    if (newProject.totalLength <= 0) {
      toast.error(t('validation', 'totalLengthRequired'));
      return;
    }

    setIsSubmitting(true);
    createProjectMutation.mutate(newProject);
  };

  const handleEditProject = (id: string) => {
    navigate(`/projects/${id}/edit`);
  };

  const handleDeleteProject = async (id: string) => {
    if (window.confirm(t('projects', 'deleteConfirm'))) {
      deleteProjectMutation.mutate(id);
    }
  };

  const getStatusBadgeClass = (status: Project['status']) => {
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

  const formatStatusText = (status: Project['status']) => {
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

  if (isLoading) {
    return <div className="flex justify-center items-center h-64">{t('projects', 'loadingProjects')}</div>;
  }

  return (
    <div className="space-y-6" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">{t('projects', 'title')}</h1>
        {isAdmin && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <PlusIcon className={`${language === 'ar' ? '-mr-1 ml-2' : '-ml-1 mr-2'} h-5 w-5`} aria-hidden="true" />
            {t('projects', 'newProject')}
          </button>
        )}
      </div>

      {/* Projects Table */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        {projects.length === 0 ? (
          <div className="py-10 text-center">
            <p className="text-gray-500">{t('common', 'noData')}</p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {projects.map((project) => (
              <li key={project.id}>
                <div className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <Link
                        to={`/projects/${project.id}`}
                        className="text-lg font-medium text-blue-600 truncate hover:underline"
                      >
                        {project.name}
                      </Link>
                      <p className="mt-1 text-sm text-gray-500 truncate">{project.description}</p>
                    </div>
                    <div className={`${language === 'ar' ? 'mr-4' : 'ml-4'} flex-shrink-0 flex`}>
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(project.status)}`}>
                        {formatStatusText(project.status)}
                      </span>
                    </div>
                  </div>
                  <div className="mt-2 sm:flex sm:justify-between">
                    <div className="sm:flex">
                      <p className="flex items-center text-sm text-gray-500">
                        {t('projects', 'manager')}: {project.manager}
                      </p>
                    </div>
                    <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                      <p>
                        {t('projects', 'budget')}: {formatMoney(project.budget)}
                      </p>
                      <p className={`${language === 'ar' ? 'mr-4' : 'ml-4'}`}>
                        {t('projects', 'timeline')}: {new Date(project.startDate).toLocaleDateString()} - {new Date(project.endDate).toLocaleDateString()}
                      </p>
                      <p className={`${language === 'ar' ? 'mr-4' : 'ml-4'}`}>
                        {t('projects', 'totalLength')}: {project.totalLength} {project.unit === 'km' ? t('projects', 'unitKm') : project.unit === 'm' ? t('projects', 'unitM') : project.unit === 'sq_m' ? t('projects', 'unitSqM') : t('projects', 'unitUnits')}
                      </p>
                      {project.progress !== undefined && (
                        <div className={`${language === 'ar' ? 'mr-4' : 'ml-4'} flex items-center`}>
                          <span className="text-sm text-gray-500 mr-2">{t('projectDetails', 'progress')}: {project.progress}%</span>
                          <div className="w-20 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full"
                              style={{ width: `${project.progress}%` }}
                            ></div>
                          </div>
                        </div>
                      )}
                      {isAdmin && (
                        <div className={`${language === 'ar' ? 'mr-4' : 'ml-4'} flex`}>
                          <button
                            onClick={() => handleEditProject(project.id)}
                            className={`text-gray-400 hover:text-gray-500 ${language === 'ar' ? 'ml-3' : 'mr-3'}`}
                          >
                            <PencilIcon className="h-5 w-5" aria-hidden="true" />
                          </button>
                          <button
                            onClick={() => handleDeleteProject(project.id)}
                            className="text-red-400 hover:text-red-500"
                          >
                            <TrashIcon className="h-5 w-5" aria-hidden="true" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Create Project Modal */}
      {showCreateModal && (
        <div className="fixed z-50 inset-0 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

            <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
              <div>
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  {t('projects', 'createProject')}
                </h3>
                <form onSubmit={handleCreateProject} className="mt-4 space-y-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                      {t('projects', 'name')}
                    </label>
                    <input
                      type="text"
                      name="name"
                      id="name"
                      required
                      value={newProject.name}
                      onChange={handleInputChange}
                      className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                    />
                  </div>
                  <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                      {t('projects', 'description')}
                    </label>
                    <textarea
                      name="description"
                      id="description"
                      rows={3}
                      value={newProject.description}
                      onChange={handleInputChange}
                      className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                    ></textarea>
                  </div>
                  <div className="grid grid-cols-1 gap-y-4 gap-x-4 sm:grid-cols-2">
                    <div>
                      <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">
                        {t('projects', 'startDate')}
                      </label>
                      <input
                        type="date"
                        name="startDate"
                        id="startDate"
                        required
                        value={newProject.startDate}
                        onChange={handleInputChange}
                        className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                      />
                    </div>
                    <div>
                      <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">
                        {t('projects', 'endDate')}
                      </label>
                      <input
                        type="date"
                        name="endDate"
                        id="endDate"
                        required
                        value={newProject.endDate}
                        onChange={handleInputChange}
                        className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                      />
                    </div>
                    <div>
                      <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                        {t('projects', 'status')}
                      </label>
                      <select
                        name="status"
                        id="status"
                        required
                        value={newProject.status}
                        onChange={handleInputChange}
                        className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                      >
                        <option value="not_started">{t('projects', 'notStarted')}</option>
                        <option value="in_progress">{t('projects', 'inProgress')}</option>
                        <option value="completed">{t('projects', 'completed')}</option>
                      </select>
                    </div>
                    <div>
                      <label htmlFor="budget" className="block text-sm font-medium text-gray-700">
                        {t('projects', 'budget')}
                      </label>
                      <input
                        type="number"
                        name="budget"
                        id="budget"
                        required
                        min="0"
                        step="0.01"
                        value={newProject.budget}
                        onChange={handleInputChange}
                        className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                      />
                    </div>
                    <div>
                      <label htmlFor="manager" className="block text-sm font-medium text-gray-700">
                        {t('projects', 'manager')}
                      </label>
                      <input
                        type="text"
                        name="manager"
                        id="manager"
                        required
                        value={newProject.manager}
                        onChange={handleInputChange}
                        className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                      />
                    </div>
                    <div>
                      <label htmlFor="totalLength" className="block text-sm font-medium text-gray-700">
                        {t('projects', 'totalLength')}
                      </label>
                      <input
                        type="number"
                        name="totalLength"
                        id="totalLength"
                        required
                        min="0"
                        step="0.01"
                        value={newProject.totalLength}
                        onChange={handleInputChange}
                        className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                      />
                    </div>
                    <div>
                      <label htmlFor="unit" className="block text-sm font-medium text-gray-700">
                        {t('projects', 'unit')}
                      </label>
                      <select
                        name="unit"
                        id="unit"
                        required
                        value={newProject.unit}
                        onChange={handleInputChange}
                        className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                      >
                        <option value="km">{t('projects', 'unitKm')}</option>
                        <option value="m">{t('projects', 'unitM')}</option>
                        <option value="sq_m">{t('projects', 'unitSqM')}</option>
                        <option value="units">{t('projects', 'unitUnits')}</option>
                      </select>
                    </div>
                  </div>
                  <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300 sm:col-start-2 sm:text-sm"
                    >
                      {isSubmitting ? t('common', 'loading') : t('projects', 'save')}
                    </button>
                    <button
                      type="button"
                      disabled={isSubmitting}
                      onClick={() => setShowCreateModal(false)}
                      className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-100 sm:mt-0 sm:col-start-1 sm:text-sm"
                    >
                      {t('projects', 'cancel')}
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

export default Projects; 
