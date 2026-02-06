import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import api from '../services/api';
import { mockGetProjectById, mockUpdateProject } from '../services/mockApi';
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
};

const ProjectEdit: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t, language } = useLanguage();
  const { formatMoney } = useCurrency();
  const queryClient = useQueryClient();

  // CRITICAL FIX: Add centralized state management for dashboard updates
  const { projectOperations, debugLog, healthCheck } = useDashboardState({
    enableDebugging: true,
    enableOptimisticUpdates: true,
    refetchDelay: 0 // Immediate updates for professional UX
  });

  const isAdmin = user?.role === 'admin';
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [projectData, setProjectData] = useState<Partial<Project>>({
    name: '',
    description: '',
    startDate: '',
    endDate: '',
    budget: 0,
    manager: '',
    status: 'not_started',
  });

  // Fetch project data with proper error handling
  const { data: project, isLoading, error } = useQuery(
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
        throw new Error(t('projects', 'loadError') || 'Failed to load project');
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

  // Update project mutation
  const updateProjectMutation = useMutation(
    async (projectData: Partial<Project>) => {
      if (!id) throw new Error('Project ID is required');

      if (USE_MOCK_API) {
        return await mockUpdateProject(id, projectData);
      } else {
        const response = await api.put(`/projects/${id}`, projectData);
        return response.data;
      }
    },
    {
      onSuccess: async (updatedProject) => {
        debugLog('🚀 Project update success - executing professional state management...');

        // CRITICAL FIX: Use centralized state management instead of manual cache invalidation
        await projectOperations.onUpdate(updatedProject);

        // Verify system health
        healthCheck();

        // Professional user feedback
        toast.success('تم تحديث المشروع بنجاح وتحديث لوحة التحكم!');
        navigate(`/projects/${id}`);
      },
      onError: (error) => {
        console.error('Update project error:', error);
        toast.error(t('projects', 'editError') || 'Failed to update project');
      },
      onSettled: () => {
        setIsSubmitting(false);
      }
    }
  );

  // Set form data when project loads
  useEffect(() => {
    if (project) {
      setProjectData({
        name: project.name,
        description: project.description,
        startDate: project.startDate,
        endDate: project.endDate,
        budget: project.budget,
        manager: project.manager,
        status: project.status,
      });
    }
  }, [project]);

  // Redirect if not admin
  useEffect(() => {
    if (!isAdmin) {
      navigate('/projects');
      toast.error(t('common', 'unauthorizedAction') || 'You do not have permission to edit projects');
    }
  }, [isAdmin, navigate, t]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setProjectData(prev => ({
      ...prev,
      [name]: name === 'budget' ? parseFloat(value) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form
    if (projectData.name?.trim() === '') {
      toast.error(t('validation', 'nameRequired') || 'Project name is required');
      return;
    }

    if (!projectData.startDate) {
      toast.error(t('validation', 'startDateRequired') || 'Start date is required');
      return;
    }

    if (!projectData.endDate) {
      toast.error(t('validation', 'endDateRequired') || 'End date is required');
      return;
    }

    if (projectData.startDate && projectData.endDate &&
      new Date(projectData.startDate) > new Date(projectData.endDate)) {
      toast.error(t('validation', 'endDateMustBeAfterStartDate') || 'End date must be after start date');
      return;
    }

    if (projectData.budget !== undefined && projectData.budget <= 0) {
      toast.error(t('validation', 'budgetMustBePositive') || 'Budget must be a positive number');
      return;
    }

    if (projectData.manager?.trim() === '') {
      toast.error(t('validation', 'managerRequired') || 'Manager name is required');
      return;
    }

    setIsSubmitting(true);
    updateProjectMutation.mutate(projectData);
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

  return (
    <div className="space-y-6" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Link
            to={`/projects/${id}`}
            className={`${language === 'ar' ? 'ml-4' : 'mr-4'} text-gray-400 hover:text-gray-500`}
          >
            <ArrowLeftIcon className="h-5 w-5" aria-hidden="true" />
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">{t('projects', 'editProject')}</h1>
        </div>
      </div>

      {/* Edit Form */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                {t('projects', 'name')}
              </label>
              <input
                type="text"
                name="name"
                id="name"
                required
                value={projectData.name}
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
                value={projectData.description}
                onChange={handleInputChange}
                className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
              />
            </div>

            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-3">
              <div>
                <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">
                  {t('projects', 'startDate')}
                </label>
                <input
                  type="date"
                  name="startDate"
                  id="startDate"
                  required
                  value={projectData.startDate}
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
                  value={projectData.endDate}
                  onChange={handleInputChange}
                  className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                />
              </div>

              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                  {t('projects', 'status')}
                </label>
                <select
                  id="status"
                  name="status"
                  value={projectData.status}
                  onChange={handleInputChange}
                  className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
                  <option value="not_started">{t('projects', 'notStarted')}</option>
                  <option value="in_progress">{t('projects', 'inProgress')}</option>
                  <option value="completed">{t('projects', 'completed')}</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
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
                  value={projectData.budget}
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
                  value={projectData.manager}
                  onChange={handleInputChange}
                  className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <Link
                to={`/projects/${id}`}
                className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                {t('projects', 'cancel')}
              </Link>
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300"
              >
                {isSubmitting ? t('common', 'loading') : t('projects', 'save')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProjectEdit; 
