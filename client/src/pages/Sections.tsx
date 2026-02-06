import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { PlusIcon, PencilIcon, TrashIcon, BuildingOfficeIcon } from '@heroicons/react/24/outline';
import api from '../services/api';
import { mockGetSections, mockGetProjects, mockCreateSection, mockDeleteSection } from '../services/mockApi';
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
  createdAt?: string;
};

const Sections: React.FC = () => {
  const { user } = useAuth();
  const { t, language } = useLanguage();
  const { formatMoney } = useCurrency();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // SENIOR DEVELOPER PATTERN: Centralized state management
  const { sectionOperations, debugLog, healthCheck } = useDashboardState({
    enableDebugging: true,
    enableOptimisticUpdates: false, // Sections don't need optimistic updates
    refetchDelay: 0
  });

  const isAdmin = user?.role === 'admin';
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [newSection, setNewSection] = useState({
    name: '',
    description: '',
    status: 'not_started' as const,
    manager: '',
    budget: 0,
    details: '',
    notes: '',
    projectId: '',
    targetQuantity: 0,
    completedQuantity: 0
  });

  // Fetch sections with proper error handling
  const { data: sections = [], isLoading } = useQuery<Section[]>(
    ['sections'],
    async () => {
      try {
        if (USE_MOCK_API) {
          return await mockGetSections();
        } else {
          const res = await api.get('/sections');
          return res.data?.data || [];
        }
      } catch (error) {
        console.error('Error fetching sections:', error);
        toast.error(t('messages', 'networkError') || 'خطأ في تحميل البيانات');
        return [];
      }
    },
    {
      staleTime: 30000 // 30 seconds
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
  }, {
    staleTime: 30000 // 30 seconds - consistent with other queries
  });

  // Create section mutation
  const createSectionMutation = useMutation(
    async (sectionData: any) => {
      if (USE_MOCK_API) {
        return await mockCreateSection(sectionData);
      } else {
        const response = await api.post('/sections', sectionData);
        return response.data;
      }
    },
    {
      onSuccess: async (newSection) => {
        debugLog('📋 Section creation success - executing professional state management...');

        // Execute centralized state management
        await sectionOperations.onCreate(newSection);

        // Special handling for project-specific invalidation
        if (newSection.projectId) {
          queryClient.invalidateQueries(['project', newSection.projectId]);
        }

        // Verify system health
        healthCheck();

        toast.success('تم إنشاء القسم بنجاح وتحديث لوحة التحكم!');
        setShowCreateModal(false);
        setNewSection({
          name: '',
          description: '',
          status: 'not_started',
          manager: '',
          budget: 0,
          details: '',
          notes: '',
          projectId: '',
          targetQuantity: 0,
          completedQuantity: 0
        });
      },
      onError: (error) => {
        console.error('Create section error:', error);
        toast.error(t('sections', 'createError') || 'خطأ في إنشاء القسم');
      },
      onSettled: () => {
        setIsSubmitting(false);
      }
    }
  );

  // Delete section mutation
  const deleteSectionMutation = useMutation(
    async (id: string) => {
      if (USE_MOCK_API) {
        return await mockDeleteSection(id);
      } else {
        return await api.delete(`/sections/${id}`);
      }
    },
    {
      onSuccess: async (_, sectionId) => {
        debugLog('🗑️ Section deletion success - executing professional state management...');

        // Execute centralized state management
        await sectionOperations.onDelete(sectionId);

        // Verify system health
        healthCheck();

        toast.success('تم حذف القسم بنجاح وتحديث لوحة التحكم!');
      },
      onError: (error) => {
        console.error('Delete section error:', error);
        toast.error(t('sections', 'deleteError') || 'خطأ في حذف القسم');
      }
    }
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewSection(prev => ({
      ...prev,
      [name]: name === 'budget' || name === 'targetQuantity' || name === 'completedQuantity'
        ? parseFloat(value) || 0
        : value
    }));
  };

  const handleCreateSection = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form
    if (newSection.name.trim() === '') {
      toast.error(t('validation', 'nameRequired') || 'اسم القسم مطلوب');
      return;
    }

    if (newSection.manager.trim() === '') {
      toast.error(t('validation', 'managerRequired') || 'مدير القسم مطلوب');
      return;
    }

    if (newSection.budget <= 0) {
      toast.error(t('validation', 'budgetMustBePositive') || 'الميزانية يجب أن تكون أكبر من صفر');
      return;
    }

    if (newSection.targetQuantity <= 0) {
      toast.error(t('validation', 'targetQuantityRequired') || 'الكمية المستهدفة يجب أن تكون أكبر من صفر');
      return;
    }

    if (newSection.completedQuantity < 0) {
      toast.error(t('validation', 'completedQuantityValid') || 'الكمية المنجزة لا يمكن أن تكون قيمة سالبة');
      return;
    }

    if (newSection.completedQuantity > newSection.targetQuantity) {
      toast.error(t('validation', 'completedCannotExceedTarget') || 'الكمية المنجزة لا يمكن أن تتجاوز الكمية المستهدفة');
      return;
    }



    setIsSubmitting(true);

    // Calculate progress
    const progress = newSection.targetQuantity > 0 ? Math.round((newSection.completedQuantity / newSection.targetQuantity) * 100) : 0;

    createSectionMutation.mutate({
      ...newSection,
      progress
    });
  };

  const handleDeleteSection = async (id: string) => {
    if (window.confirm(t('sections', 'deleteConfirm') || 'هل أنت متأكد من حذف هذا القسم؟ لا يمكن التراجع عن هذا الإجراء.')) {
      deleteSectionMutation.mutate(id);
    }
  };

  const getStatusBadgeClass = (status: Section['status']) => {
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

  const formatStatusText = (status: Section['status']) => {
    switch (status) {
      case 'completed':
        return t('projects', 'completed') || 'مكتمل';
      case 'in_progress':
        return t('projects', 'inProgress') || 'جاري العمل';
      case 'not_started':
        return t('projects', 'notStarted') || 'لم يبدأ';
      default:
        return status;
    }
  };

  // Filter sections based on selected project
  const filteredSections = selectedProjectId
    ? sections.filter(section => section.projectId === selectedProjectId)
    : sections;

  if (isLoading) {
    return <div className="flex justify-center items-center h-64">{t('sections', 'loadingSections') || 'جاري تحميل الأقسام...'}</div>;
  }

  return (
    <div className="space-y-6" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <BuildingOfficeIcon className="h-8 w-8 text-blue-600 mr-3" />
          <h1 className="text-2xl font-bold text-gray-900">{t('sections', 'title') || 'إدارة الأقسام'}</h1>
        </div>
        {isAdmin && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <PlusIcon className={`${language === 'ar' ? '-mr-1 ml-2' : '-ml-1 mr-2'} h-5 w-5`} aria-hidden="true" />
            {t('sections', 'newSection') || 'قسم جديد'}
          </button>
        )}
      </div>

      {/* Project Filter */}
      <div className="bg-white shadow sm:rounded-lg p-4">
        <div className={`flex items-center ${language === 'ar' ? 'space-x-reverse space-x-4' : 'space-x-4'}`}>
          <label htmlFor="project-filter" className="block text-sm font-medium text-gray-700 min-w-0 flex-shrink-0">
            {t('sections', 'filterByProject') || 'تصفية حسب المشروع'}:
          </label>
          <select
            id="project-filter"
            value={selectedProjectId}
            onChange={(e) => setSelectedProjectId(e.target.value)}
            className="block w-full max-w-xs pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
          >
            <option value="">{t('sections', 'allProjects') || 'جميع المشاريع'}</option>
            {projects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.name}
              </option>
            ))}
          </select>
          {selectedProjectId && (
            <button
              onClick={() => setSelectedProjectId('')}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              {t('sections', 'clearFilter') || 'إزالة التصفية'}
            </button>
          )}
        </div>
        <div className="mt-2 text-sm text-gray-500">
          {filteredSections.length} {t('sections', 'sectionsFound') || 'قسم موجود'}
          {selectedProjectId && (
            <span> {t('sections', 'inProject') || 'في المشروع'}: {projects.find(p => p.id === selectedProjectId)?.name}</span>
          )}
        </div>
      </div>

      {/* Sections Table */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        {filteredSections.length === 0 ? (
          <div className="py-10 text-center">
            <BuildingOfficeIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              {selectedProjectId
                ? (t('sections', 'noSectionsInProject') || 'لا توجد أقسام في هذا المشروع')
                : (t('sections', 'noSections') || 'لا توجد أقسام')
              }
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              {selectedProjectId
                ? (t('sections', 'noSectionsInProjectDesc') || 'لا توجد أقسام في المشروع المحدد')
                : (t('sections', 'noSectionsDesc') || 'ابدأ بإنشاء قسم جديد لإدارة مشاريعك')
              }
            </p>
            {isAdmin && (
              <div className="mt-6">
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                  <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
                  {t('sections', 'newSection') || 'قسم جديد'}
                </button>
              </div>
            )}
          </div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {filteredSections.map((section) => (
              <li key={section.id}>
                <div className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <Link
                        to={`/sections/${section.id}`}
                        className="text-lg font-medium text-blue-600 truncate hover:underline"
                      >
                        {section.name}
                      </Link>
                      <p className="mt-1 text-sm text-gray-500 truncate">{section.description}</p>
                      {section.projectName && (
                        <p className="mt-1 text-xs text-gray-400">
                          المشروع: {section.projectName}
                        </p>
                      )}
                    </div>
                    <div className={`${language === 'ar' ? 'mr-4' : 'ml-4'} flex-shrink-0 flex items-center space-x-2`}>
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(section.status)}`}>
                        {formatStatusText(section.status)}
                      </span>
                      {section.progress !== undefined && (
                        <div className="flex items-center">
                          <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full"
                              style={{ width: `${section.progress}%` }}
                            ></div>
                          </div>
                          <span className="text-xs text-gray-500">{section.progress}%</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="mt-2 sm:flex sm:justify-between">

                    <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                      <p>
                        {t('projects', 'budget') || 'الميزانية'}: {formatMoney(section.budget)}
                      </p>
                      {section.targetQuantity && (
                        <p className={`${language === 'ar' ? 'mr-4' : 'ml-4'}`}>
                          التقدم: {section.completedQuantity || 0} / {section.targetQuantity} كم
                        </p>
                      )}
                      {isAdmin && (
                        <div className={`${language === 'ar' ? 'mr-4' : 'ml-4'} flex`}>
                          <button
                            onClick={() => navigate(`/sections/${section.id}/edit`)}
                            className={`text-gray-400 hover:text-gray-500 ${language === 'ar' ? 'ml-3' : 'mr-3'}`}
                          >
                            <PencilIcon className="h-5 w-5" aria-hidden="true" />
                          </button>
                          <button
                            onClick={() => handleDeleteSection(section.id)}
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

      {/* Create Section Modal */}
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
                  {t('sections', 'createSection') || 'إنشاء قسم جديد'}
                </h3>
                <form onSubmit={handleCreateSection} className="mt-4 space-y-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                      {t('projects', 'name') || 'اسم القسم'}
                    </label>
                    <input
                      type="text"
                      name="name"
                      id="name"
                      required
                      value={newSection.name}
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
                      value={newSection.description}
                      onChange={handleInputChange}
                      className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                    ></textarea>
                  </div>
                  <div className="grid grid-cols-1 gap-y-4 gap-x-4 sm:grid-cols-2">
                    <div>
                      <label htmlFor="manager" className="block text-sm font-medium text-gray-700">
                        {t('sections', 'manager') || 'مدير القسم'}
                      </label>
                      <input
                        type="text"
                        name="manager"
                        id="manager"
                        required
                        value={newSection.manager}
                        onChange={handleInputChange}
                        className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                      />
                    </div>
                    <div>
                      <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                        {t('projects', 'status') || 'الحالة'}
                      </label>
                      <select
                        name="status"
                        id="status"
                        required
                        value={newSection.status}
                        onChange={handleInputChange}
                        className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                      >
                        <option value="not_started">{t('projects', 'notStarted') || 'لم يبدأ'}</option>
                        <option value="in_progress">{t('projects', 'inProgress') || 'جاري العمل'}</option>
                        <option value="completed">{t('projects', 'completed') || 'مكتمل'}</option>
                      </select>
                    </div>
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
                        value={newSection.budget}
                        onChange={handleInputChange}
                        className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                      />
                    </div>
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
                        value={newSection.targetQuantity}
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
                        value={newSection.completedQuantity}
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
                        value={newSection.projectId}
                        onChange={handleInputChange}
                        className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                      >
                        <option value="">{t('common', 'selectProject') || 'اختر مشروع (اختياري)'}</option>
                        {projects.map((project) => (
                          <option key={project.id} value={project.id}>
                            {project.name}
                          </option>
                        ))}
                      </select>
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
                      value={newSection.details}
                      onChange={handleInputChange}
                      className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                    ></textarea>
                  </div>
                  <div>
                    <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
                      {t('sections', 'notes') || 'الملاحظات'}
                    </label>
                    <textarea
                      name="notes"
                      id="notes"
                      rows={2}
                      value={newSection.notes}
                      onChange={handleInputChange}
                      className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                    ></textarea>
                  </div>
                  <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300 sm:col-start-2 sm:text-sm"
                    >
                      {isSubmitting ? t('common', 'loading') || 'جاري الحفظ...' : t('projects', 'save') || 'حفظ'}
                    </button>
                    <button
                      type="button"
                      disabled={isSubmitting}
                      onClick={() => setShowCreateModal(false)}
                      className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-100 sm:mt-0 sm:col-start-1 sm:text-sm"
                    >
                      {t('projects', 'cancel') || 'إلغاء'}
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

export default Sections;
