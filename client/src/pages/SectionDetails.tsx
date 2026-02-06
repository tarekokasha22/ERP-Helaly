import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeftIcon,
  PencilIcon,
  TrashIcon,
  UserIcon,

  BuildingOfficeIcon
} from '@heroicons/react/24/outline';
import api from '../services/apiService';
import { mockGetSectionById, mockUpdateSection } from '../services/mockApi';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useCurrency } from '../contexts/CurrencyContext';
import { toast } from 'react-toastify';
import useDashboardState from '../hooks/useDashboardState';

// Flag to use mock API
const USE_MOCK_API = false;

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
  // New fields for road construction
  targetQuantity: number;
  completedQuantity: number;
  progress?: number; // Auto-calculated
};

const SectionDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t, language } = useLanguage();
  const { formatMoney } = useCurrency();
  const queryClient = useQueryClient();

  // CRITICAL FIX: Add centralized state management for dashboard updates
  const { sectionOperations, debugLog, healthCheck } = useDashboardState({
    enableDebugging: true,
    enableOptimisticUpdates: false,
    refetchDelay: 0
  });

  const isAdmin = user?.role === 'admin';
  const [editMode, setEditMode] = useState(false);
  const [targetQuantity, setTargetQuantity] = useState(0);
  const [completedQuantity, setCompletedQuantity] = useState(0);
  const [status, setStatus] = useState<Section['status']>('not_started');
  const [notes, setNotes] = useState('');


  // Fetch section data
  const { data: section, isLoading, refetch } = useQuery(['section', id], async () => {
    if (!id) throw new Error('Section ID is required');

    if (USE_MOCK_API) {
      return await mockGetSectionById(id);
    } else {
      const res = await api.get(`/sections/${id}`);
      // Backend returns { success: true, data: { ...section } }
      return res.data.data || res.data;
    }
  });

  // Fetch employees for this section to calculate actual count
  const { data: sectionEmployees = [] } = useQuery(
    ['section-employees', id, user?.country],
    async () => {
      if (!user?.country || !id) return [];
      const res = await api.get(`/employees/${user.country}`);
      const allEmployees = res.data?.data || [];
      return allEmployees.filter((emp: any) => emp.sectionId === id);
    },
    {
      enabled: !!user?.country && !!id,
      refetchInterval: 5000 // Refresh every 5 seconds to stay in sync
    }
  );

  const actualEmployeeCount = sectionEmployees.length;

  React.useEffect(() => {
    if (section) {
      setTargetQuantity(section.targetQuantity || 0);
      setCompletedQuantity(section.completedQuantity || 0);
      setStatus(section.status);
      setNotes(section.notes || '');
    }
  }, [section]);

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

  // CRITICAL FIX: Professional mutation for section updates
  const updateSectionMutation = useMutation(
    async (updateData: any) => {
      if (!id) throw new Error('Section ID is required');

      if (USE_MOCK_API) {
        return await mockUpdateSection(id, updateData);
      } else {
        const response = await api.put(`/sections/${id}`, updateData);
        return response.data;
      }
    },
    {
      onSuccess: async (updatedSection) => {
        debugLog('🔧 Section update success - executing professional state management...');

        // Execute centralized state management
        await sectionOperations.onUpdate(updatedSection);

        // Invalidate related queries
        queryClient.invalidateQueries(['section', id]);
        queryClient.invalidateQueries(['sections']);
        queryClient.invalidateQueries(['dashboard']);

        // Verify system health
        healthCheck();

        // Refetch current section data
        refetch();

        // Success feedback
        const newProgress = updatedSection.progress || 0;
        toast.success(`✅ تم تحديث القسم بنجاح! التقدم الجديد: ${newProgress}%`);
        setEditMode(false);
      },
      onError: (error: any) => {
        console.error('❌ Section update failed:', error);
        toast.error('❌ فشل في تحديث القسم: ' + (error?.message || 'خطأ غير معروف'));
      }
    }
  );

  const handleSaveChanges = async () => {
    try {
      // Validate input
      if (targetQuantity <= 0) {
        toast.error('⚠️ الكمية المستهدفة يجب أن تكون أكبر من صفر');
        return;
      }

      if (completedQuantity < 0) {
        toast.error('⚠️ الكمية المنجزة لا يمكن أن تكون قيمة سالبة');
        return;
      }

      if (completedQuantity > targetQuantity) {
        toast.error('⚠️ الكمية المنجزة لا يمكن أن تتجاوز الكمية المستهدفة');
        return;
      }



      // Calculate progress
      const progress = targetQuantity > 0 ? Math.round((completedQuantity / targetQuantity) * 100) : 0;

      // Prepare update data (employees count is now read-only, calculated from actual employees)
      const updateData = {
        targetQuantity,
        completedQuantity,
        status,
        notes,
        progress
      };

      debugLog('📝 Updating section with data:', updateData);
      updateSectionMutation.mutate(updateData);

    } catch (error) {
      console.error('❌ Section update preparation failed:', error);
      toast.error('❌ خطأ في إعداد البيانات للتحديث');
    }
  };



  const handleDeleteSection = async () => {
    if (window.confirm(t('sections', 'confirmDelete') || 'هل أنت متأكد من حذف هذا القسم؟ لا يمكن التراجع عن هذا الإجراء.')) {
      try {
        // For demonstration, we'll just show a success message and redirect
        toast.success(t('sections', 'sectionDeleted') || 'تم حذف القسم بنجاح!');
        navigate('/sections');
      } catch (error) {
        toast.error(t('sections', 'deleteFailed') || 'فشل في حذف القسم');
        console.error('Delete section error:', error);
      }
    }
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-64">{t('common', 'loading') || 'جاري تحميل تفاصيل القسم...'}</div>;
  }

  if (!section) {
    return (
      <div className="text-center py-12">
        <p className="text-xl text-red-500">{t('sections', 'notFound') || 'القسم غير موجود'}</p>
        <Link to="/sections" className="text-blue-600 hover:text-blue-900 mt-4 inline-block">
          {t('common', 'backToSections') || 'العودة للأقسام'}
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
            to="/sections"
            className="mr-4 p-2 rounded-full text-gray-400 hover:text-gray-500 hover:bg-gray-100"
          >
            <ArrowLeftIcon className="h-5 w-5" aria-hidden="true" />
          </Link>
          <div className="flex items-center">
            <BuildingOfficeIcon className="h-8 w-8 text-blue-600 mr-3" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{section.name}</h1>
              <p className="text-sm text-gray-500">
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(section.status)}`}>
                  {formatStatusText(section.status)}
                </span>
              </p>
            </div>
          </div>
        </div>
        {isAdmin && !editMode && (
          <div className="flex space-x-2">
            <button
              onClick={() => setEditMode(true)}
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <PencilIcon className="-ml-0.5 mr-2 h-4 w-4" aria-hidden="true" />
              {t('common', 'edit') || 'تعديل'}
            </button>
            <button
              onClick={handleDeleteSection}
              className="inline-flex items-center px-3 py-2 border border-transparent shadow-sm text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              <TrashIcon className="-ml-0.5 mr-2 h-4 w-4" aria-hidden="true" />
              {t('common', 'delete') || 'حذف'}
            </button>
          </div>
        )}
        {editMode && (
          <div className="flex space-x-2">
            <button
              onClick={handleSaveChanges}
              className="inline-flex items-center px-3 py-2 border border-transparent shadow-sm text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              {t('common', 'save') || 'حفظ التغييرات'}
            </button>
            <button
              onClick={() => setEditMode(false)}
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              {t('common', 'cancel') || 'إلغاء'}
            </button>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">{t('sections', 'sectionInfo') || 'معلومات القسم'}</h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">{t('sections', 'sectionInfoDesc') || 'تفاصيل وتقدم القسم'}</p>
        </div>
        <div className="border-t border-gray-200 px-4 py-5 sm:p-0">
          <dl className="sm:divide-y sm:divide-gray-200">
            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">{t('projects', 'description') || 'الوصف'}</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{section.description}</dd>
            </div>
            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">{t('sections', 'manager') || 'مدير القسم'}</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2 flex items-center">
                <UserIcon className="h-5 w-5 text-gray-400 mr-2" aria-hidden="true" />
                {section.manager}
              </dd>
            </div>
            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">{t('projects', 'budget') || 'الميزانية'}</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {formatMoney(section.budget)}
              </dd>
            </div>
            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">
                👥 {t('sections', 'employees') || 'عدد الموظفين'}
              </dt>
              <dd className="mt-1 text-sm sm:mt-0 sm:col-span-2">
                <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-blue-600">
                      {actualEmployeeCount}
                    </span>
                    <span className="text-sm text-gray-600">موظف</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    يتم الحساب تلقائياً من صفحة العاملين
                  </p>
                </div>
              </dd>
            </div>
            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">{t('projects', 'status') || 'الحالة'}</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {!editMode ? (
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(section.status)}`}>
                    {formatStatusText(section.status)}
                  </span>
                ) : (
                  <select
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    value={status}
                    onChange={(e) => setStatus(e.target.value as Section['status'])}
                  >
                    <option value="not_started">{t('projects', 'notStarted') || 'لم يبدأ'}</option>
                    <option value="in_progress">{t('projects', 'inProgress') || 'جاري العمل'}</option>
                    <option value="completed">{t('projects', 'completed') || 'مكتمل'}</option>
                  </select>
                )}
              </dd>
            </div>
            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">{t('projects', 'targetQuantity') || 'الكمية المستهدفة'}</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {!editMode ? (
                  <span>{section.targetQuantity} كم</span>
                ) : (
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={targetQuantity}
                    onChange={(e) => setTargetQuantity(parseFloat(e.target.value) || 0)}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                )}
              </dd>
            </div>
            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">{t('projects', 'completedQuantity') || 'الكمية المنجزة'}</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {!editMode ? (
                  <span>{section.completedQuantity} كم</span>
                ) : (
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={completedQuantity}
                    onChange={(e) => setCompletedQuantity(parseFloat(e.target.value) || 0)}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                )}
              </dd>
            </div>
            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">{t('projects', 'progressAutoCalculated') || 'التقدم (محسوب تلقائياً)'}</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                <div className="flex items-center">
                  <div className="w-full max-w-xs bg-gray-200 rounded-full h-2.5 mr-2">
                    <div
                      className="bg-blue-600 h-2.5 rounded-full"
                      style={{ width: `${section.progress}%` }}
                    ></div>
                  </div>
                  <span>{section.progress}%</span>
                  {editMode && (
                    <span className="text-sm text-gray-500 ml-3">
                      ({targetQuantity > 0 ? Math.round((completedQuantity / targetQuantity) * 100) : 0}% جديد)
                    </span>
                  )}
                </div>
              </dd>
            </div>
            {section.details && (
              <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">{t('sections', 'details') || 'التفاصيل'}</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{section.details}</dd>
              </div>
            )}
            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">{t('sections', 'notes') || 'الملاحظات'}</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {!editMode ? (
                  section.notes || t('sections', 'noNotes') || 'لا توجد ملاحظات'
                ) : (
                  <textarea
                    rows={3}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder={t('sections', 'addNotes') || 'أضف ملاحظات حول هذا القسم...'}
                  />
                )}
              </dd>
            </div>
          </dl>
        </div>
      </div>


    </div>
  );
};

export default SectionDetails; 