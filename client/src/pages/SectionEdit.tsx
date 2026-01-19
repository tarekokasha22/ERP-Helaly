import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeftIcon, BuildingOfficeIcon } from '@heroicons/react/24/outline';
import api from '../services/api';
import { mockGetSectionById, mockUpdateSection, mockGetProjects } from '../services/mockApi';
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
  manager: string;
  budget: number;
  employees?: number;
  details?: string;
  notes?: string;
  projectId?: string;
  projectName?: string;
  // Road construction specific fields
  targetQuantity: number;
  completedQuantity: number;
  progress?: number; // Auto-calculated
};

const SectionEdit: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t, language } = useLanguage();
  const { formatMoney } = useCurrency();
  const queryClient = useQueryClient();
  
  // CRITICAL FIX: Add centralized state management for dashboard updates
  const { sectionOperations, debugLog, healthCheck } = useDashboardState({
    enableDebugging: true,
    enableOptimisticUpdates: true,
    refetchDelay: 0 // Immediate updates for professional UX
  });
  
  const isAdmin = user?.role === 'admin';
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [sectionData, setSectionData] = useState<Partial<Section>>({
    name: '',
    description: '',
    status: 'not_started',
    manager: '',
    budget: 0,
    employees: 0,
    details: '',
    notes: '',
    projectId: '',
    targetQuantity: 0,
    completedQuantity: 0,
  });

  // Fetch section data with proper error handling
  const { data: section, isLoading, error } = useQuery(
    ['section', id],
    async () => {
      if (!id) throw new Error('Section ID is required');
      
      try {
        if (USE_MOCK_API) {
          return await mockGetSectionById(id);
        } else {
          const res = await api.get(`/sections/${id}`);
          return res.data;
        }
      } catch (error) {
        console.error('Error fetching section:', error);
        throw new Error(t('sections', 'loadError') || 'Failed to load section');
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

  // Fetch projects for dropdown
  const { data: projects = [] } = useQuery(['projects'], async () => {
    if (USE_MOCK_API) {
      return await mockGetProjects();
    } else {
      const res = await api.get('/projects');
      return res.data?.data || [];
    }
  });

  // Update section mutation
  const updateSectionMutation = useMutation(
    async (sectionData: Partial<Section>) => {
      if (!id) throw new Error('Section ID is required');
      
      if (USE_MOCK_API) {
        return await mockUpdateSection(id, sectionData);
      } else {
        const response = await api.put(`/sections/${id}`, sectionData);
        return response.data;
      }
    },
    {
      onSuccess: async (updatedSection) => {
        debugLog('🔧 Section update success - executing professional state management...');
        
        // CRITICAL FIX: Use centralized state management instead of manual cache invalidation
        await sectionOperations.onUpdate(updatedSection);
        
        // Verify system health
        healthCheck();
        
        // Professional user feedback
        const newProgress = updatedSection.progress || 0;
        toast.success(`✅ تم تحديث القسم بنجاح! التقدم الجديد: ${newProgress}%`);
        navigate(`/sections/${id}`);
      },
      onError: (error) => {
        console.error('Update section error:', error);
        toast.error(t('sections', 'editError') || 'Failed to update section');
      },
      onSettled: () => {
        setIsSubmitting(false);
      }
    }
  );

  // Set form data when section loads
  useEffect(() => {
    if (section) {
      setSectionData({
        name: section.name,
        description: section.description,
        status: section.status,
        manager: section.manager,
        budget: section.budget,
        employees: section.employees || 0,
        details: section.details || '',
        notes: section.notes || '',
        projectId: section.projectId || '',
        targetQuantity: section.targetQuantity || 0,
        completedQuantity: section.completedQuantity || 0,
      });
    }
  }, [section]);

  // Redirect if not admin
  useEffect(() => {
    if (!isAdmin) {
      navigate('/sections');
      toast.error(t('common', 'unauthorizedAction') || 'You do not have permission to edit sections');
    }
  }, [isAdmin, navigate, t]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setSectionData(prev => ({
      ...prev,
      [name]: ['budget', 'employees', 'targetQuantity', 'completedQuantity'].includes(name) 
        ? parseFloat(value) || 0 
        : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (sectionData.name?.trim() === '') {
      toast.error(t('validation', 'nameRequired') || 'Section name is required');
      return;
    }
    
    if (sectionData.manager?.trim() === '') {
      toast.error(t('validation', 'managerRequired') || 'Manager name is required');
    }
    
    if (sectionData.budget !== undefined && sectionData.budget <= 0) {
      toast.error(t('validation', 'budgetMustBePositive') || 'Budget must be a positive number');
      return;
    }
    
    if (sectionData.targetQuantity !== undefined && sectionData.targetQuantity <= 0) {
      toast.error(t('validation', 'targetQuantityRequired') || 'Target quantity must be greater than zero');
      return;
    }
    
    if (sectionData.completedQuantity !== undefined && sectionData.completedQuantity < 0) {
      toast.error(t('validation', 'completedQuantityValid') || 'Completed quantity cannot be negative');
      return;
    }
    
    if (sectionData.completedQuantity !== undefined && sectionData.targetQuantity !== undefined && 
        sectionData.completedQuantity > sectionData.targetQuantity) {
      toast.error(t('validation', 'completedCannotExceedTarget') || 'Completed quantity cannot exceed target quantity');
      return;
    }
    
    if (sectionData.employees !== undefined && sectionData.employees < 0) {
      toast.error(t('validation', 'employeesValid') || 'Number of employees cannot be negative');
      return;
    }
    
    // Calculate progress
    const progress = sectionData.targetQuantity && sectionData.targetQuantity > 0 
      ? Math.round(((sectionData.completedQuantity || 0) / sectionData.targetQuantity) * 100) 
      : 0;
    
    setIsSubmitting(true);
    updateSectionMutation.mutate({
      ...sectionData,
      progress
    });
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-64">{t('common', 'loading') || 'Loading...'}</div>;
  }

  if (error || !section) {
    return (
      <div className="text-center py-12">
        <p className="text-xl text-gray-500">{t('sections', 'notFound') || 'Section not found'}</p>
        <Link 
          to="/sections"
          className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
        >
          {t('common', 'backToSections') || 'Back to Sections'}
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
            to={`/sections/${id}`}
            className={`${language === 'ar' ? 'ml-4' : 'mr-4'} text-gray-400 hover:text-gray-500`}
          >
            <ArrowLeftIcon className="h-5 w-5" aria-hidden="true" />
          </Link>
          <div className="flex items-center">
            <BuildingOfficeIcon className="h-8 w-8 text-blue-600 mr-3" />
            <h1 className="text-2xl font-bold text-gray-900">{t('sections', 'editSection') || 'تعديل القسم'}</h1>
          </div>
        </div>
      </div>

      {/* Edit Form */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                {t('projects', 'name') || 'اسم القسم'}
              </label>
              <input
                type="text"
                name="name"
                id="name"
                required
                value={sectionData.name}
                onChange={handleInputChange}
                className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
              />
            </div>
            
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                {t('projects', 'description') || 'الوصف'}
              </label>
              <textarea
                name="description"
                id="description"
                rows={3}
                value={sectionData.description}
                onChange={handleInputChange}
                className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
              />
            </div>
            
            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-3">
              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                  {t('projects', 'status') || 'الحالة'}
                </label>
                <select
                  id="status"
                  name="status"
                  value={sectionData.status}
                  onChange={handleInputChange}
                  className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
                  <option value="not_started">{t('projects', 'notStarted') || 'لم يبدأ'}</option>
                  <option value="in_progress">{t('projects', 'inProgress') || 'جاري العمل'}</option>
                  <option value="completed">{t('projects', 'completed') || 'مكتمل'}</option>
                </select>
              </div>
              
              <div>
                <label htmlFor="manager" className="block text-sm font-medium text-gray-700">
                  {t('sections', 'manager') || 'مدير القسم'}
                </label>
                <input
                  type="text"
                  name="manager"
                  id="manager"
                  required
                  value={sectionData.manager}
                  onChange={handleInputChange}
                  className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                />
              </div>
              
              <div>
                <label htmlFor="projectId" className="block text-sm font-medium text-gray-700">
                  {t('sections', 'project') || 'المشروع'}
                </label>
                <select
                  name="projectId"
                  id="projectId"
                  value={sectionData.projectId}
                  onChange={handleInputChange}
                  className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
                  <option value="">{t('common', 'selectProject') || 'اختر مشروع (اختياري)'}</option>
                  {projects.map((project: any) => (
                    <option key={project.id} value={project.id}>
                      {project.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
              <div>
                <label htmlFor="budget" className="block text-sm font-medium text-gray-700">
                  {t('projects', 'budget') || 'الميزانية'}
                </label>
                <input
                  type="number"
                  name="budget"
                  id="budget"
                  required
                  min="0"
                  step="0.01"
                  value={sectionData.budget}
                  onChange={handleInputChange}
                  className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                />
              </div>
              
              <div>
                <label htmlFor="employees" className="block text-sm font-medium text-gray-700">
                  👥 {t('sections', 'employees') || 'عدد الموظفين'}
                </label>
                <input
                  type="number"
                  name="employees"
                  id="employees"
                  min="0"
                  value={sectionData.employees}
                  onChange={handleInputChange}
                  className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
              <div>
                <label htmlFor="targetQuantity" className="block text-sm font-medium text-gray-700">
                  {t('projects', 'targetQuantity') || 'الكمية المستهدفة'} (كم)
                </label>
                <input
                  type="number"
                  name="targetQuantity"
                  id="targetQuantity"
                  required
                  min="0"
                  step="0.01"
                  value={sectionData.targetQuantity}
                  onChange={handleInputChange}
                  className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                />
              </div>
              
              <div>
                <label htmlFor="completedQuantity" className="block text-sm font-medium text-gray-700">
                  {t('projects', 'completedQuantity') || 'الكمية المنجزة'} (كم)
                </label>
                <input
                  type="number"
                  name="completedQuantity"
                  id="completedQuantity"
                  min="0"
                  step="0.01"
                  value={sectionData.completedQuantity}
                  onChange={handleInputChange}
                  className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                />
                <p className="mt-1 text-xs text-gray-500">
                  التقدم الحالي: {sectionData.targetQuantity && sectionData.targetQuantity > 0 
                    ? Math.round(((sectionData.completedQuantity || 0) / sectionData.targetQuantity) * 100) 
                    : 0}%
                </p>
              </div>
            </div>
            
            <div>
              <label htmlFor="details" className="block text-sm font-medium text-gray-700">
                {t('sections', 'details') || 'التفاصيل'}
              </label>
              <textarea
                name="details"
                id="details"
                rows={2}
                value={sectionData.details}
                onChange={handleInputChange}
                className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
              />
            </div>
            
            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
                {t('sections', 'notes') || 'الملاحظات'}
              </label>
              <textarea
                name="notes"
                id="notes"
                rows={3}
                value={sectionData.notes}
                onChange={handleInputChange}
                placeholder={t('sections', 'addNotes') || 'أضف ملاحظات حول هذا القسم...'}
                className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
              />
            </div>
            
            <div className="flex justify-end space-x-3">
              <Link
                to={`/sections/${id}`}
                className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                {t('projects', 'cancel') || 'إلغاء'}
              </Link>
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300"
              >
                {isSubmitting ? (t('common', 'loading') || 'جاري الحفظ...') : (t('projects', 'save') || 'حفظ')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SectionEdit;
