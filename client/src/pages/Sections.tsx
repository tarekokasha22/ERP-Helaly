import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { PlusIcon, PencilIcon, TrashIcon, BuildingOfficeIcon, UserGroupIcon, BanknotesIcon, UserCircleIcon } from '@heroicons/react/24/outline';
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

/* ── Section status config (uses t() for translatable labels) ──── */
const getSectionStatusConfig = (t: (ns: string, key: string) => string) => ({
  completed:   { label: t('projects', 'completed'),   badge: 'badge-success', bar: '#10b981' },
  in_progress: { label: t('projects', 'inProgress'),  badge: 'badge-brand',   bar: '#f97316' },
  not_started: { label: t('projects', 'notStarted'),  badge: 'badge-muted',   bar: '#94a3b8' },
});

/* ── Section Card component ────────────────────────────────────── */
const SectionCard: React.FC<{
  section: Section;
  index: number;
  isAdmin: boolean;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  formatMoney: (n: number) => string;
  t: (ns: string, key: string) => string;
}> = ({ section, index, isAdmin, onEdit, onDelete, formatMoney, t }) => {
  const statusCfg = getSectionStatusConfig(t);
  const cfg  = statusCfg[section.status] ?? statusCfg.not_started;
  const prog = section.progress ?? (
    section.targetQuantity > 0
      ? Math.round((section.completedQuantity / section.targetQuantity) * 100)
      : 0
  );

  const progressGradient =
    prog >= 100 ? 'linear-gradient(90deg, #10b981, #34d399)' :
    prog >= 60  ? 'linear-gradient(90deg, #f97316, #fb923c)' :
                  'linear-gradient(90deg, #f59e0b, #fbbf24)';

  const initials = (section.manager || '')
    .split(' ')
    .slice(0, 2)
    .map(w => w[0] ?? '')
    .join('')
    .toUpperCase();

  return (
    <Link
      to={`/sections/${section.id}`}
      className="card animate-fade-in block"
      style={{
        animationDelay: `${index * 40}ms`,
        animationFillMode: 'both',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        textDecoration: 'none',
        cursor: 'pointer',
      }}
    >
      {/* ── Colored top bar ── */}
      <div style={{ height: 6, background: cfg.bar, borderRadius: '12px 12px 0 0' }} />

      {/* ── Status + progress percent row ── */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '10px 20px 0',
      }}>
        <span className={`badge ${cfg.badge}`} style={{ fontSize: 11, letterSpacing: '0.04em' }}>{cfg.label}</span>
        <span style={{
          fontSize: 13, fontWeight: 800, color: cfg.bar,
          background: `${cfg.bar}18`, borderRadius: 8, padding: '2px 10px',
        }}>
          {prog}%
        </span>
      </div>

      <div className="card-content" style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 13, paddingTop: 10 }}>

        {/* ── Header row: index badge + name + actions ── */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
          <div style={{
            width: 34, height: 34, borderRadius: 9, flexShrink: 0,
            background: 'linear-gradient(135deg, #f97316, #fb923c)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontSize: 12, fontWeight: 900,
            boxShadow: '0 2px 8px rgba(249,115,22,0.28)',
          }}>
            #{index + 1}
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <span
              className="text-lg font-black text-slate-800 hover:text-brand-600 transition-colors leading-tight"
              style={{ display: 'block', marginBottom: 2 }}
            >
              {section.name}
            </span>
          </div>

          {isAdmin && (
            <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
              <button
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); onEdit(section.id); }}
                className="btn-icon text-slate-400 hover:text-brand-600 hover:bg-brand-50"
                title={t('common', 'edit')}
              >
                <PencilIcon className="h-4 w-4" />
              </button>
              <button
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); onDelete(section.id); }}
                className="btn-icon text-slate-400 hover:text-red-600 hover:bg-red-50"
                title={t('common', 'delete')}
              >
                <TrashIcon className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>

        {/* ── Description ── */}
        {section.description && (
          <p className="text-sm text-slate-500 leading-relaxed" style={{
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}>
            {section.description}
          </p>
        )}

        {/* ── Project label ── */}
        {section.projectName && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <BuildingOfficeIcon className="h-3.5 w-3.5 text-brand-500 shrink-0" />
            <span className="text-xs font-semibold text-brand-600 truncate">{section.projectName}</span>
          </div>
        )}

        {/* ── Meta row ── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 12px' }}>
          {/* Manager with avatar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
            <div style={{
              width: 24, height: 24, borderRadius: '50%', flexShrink: 0,
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontSize: 9, fontWeight: 800,
            }}>
              {initials || <UserCircleIcon className="h-3.5 w-3.5" />}
            </div>
            <span className="text-sm text-slate-600 truncate">{section.manager}</span>
          </div>

          {/* Budget */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
            <BanknotesIcon className="h-4 w-4 text-slate-400 shrink-0" />
            <span className="text-sm font-bold text-brand-600 truncate">{formatMoney(section.budget)}</span>
          </div>

          {/* Employees */}
          {section.employees !== undefined && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
              <UserGroupIcon className="h-4 w-4 text-slate-400 shrink-0" />
              <span className="text-sm text-slate-600">{section.employees} {t('sections', 'employees')}</span>
            </div>
          )}
        </div>

        {/* ── Progress bar (10px, gradient) ── */}
        <div style={{ marginTop: 'auto' }}>
          <div className="progress-bar" style={{ height: 10, borderRadius: 99 }}>
            <div
              style={{
                height: '100%',
                width: `${prog}%`,
                background: progressGradient,
                borderRadius: 99,
                transition: 'width 0.6s cubic-bezier(0.4,0,0.2,1)',
              }}
            />
          </div>
          {section.targetQuantity > 0 && (
            <p className="text-xs text-slate-400 mt-1">
              Progress: {section.completedQuantity ?? 0} / {section.targetQuantity} km
            </p>
          )}
        </div>

      </div>
    </Link>
  );
};

/* ══════════════════════════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════════════════════════ */
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
        toast.error(t('messages', 'networkError') || 'Error loading data');
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

        toast.success('Section created successfully!');
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
        toast.error(t('sections', 'createError') || 'Error creating section');
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

        toast.success('Section deleted successfully!');
      },
      onError: (error) => {
        console.error('Delete section error:', error);
        toast.error(t('sections', 'deleteError') || 'Error deleting section');
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
      toast.error(t('validation', 'nameRequired') || 'Section name is required');
      return;
    }

    if (newSection.manager.trim() === '') {
      toast.error(t('validation', 'managerRequired') || 'Section manager is required');
      return;
    }

    if (newSection.budget <= 0) {
      toast.error(t('validation', 'budgetMustBePositive') || 'Budget must be greater than zero');
      return;
    }

    if (newSection.targetQuantity <= 0) {
      toast.error(t('validation', 'targetQuantityRequired') || 'Target quantity must be greater than zero');
      return;
    }

    if (newSection.completedQuantity < 0) {
      toast.error(t('validation', 'completedQuantityValid') || 'Completed quantity cannot be negative');
      return;
    }

    if (newSection.completedQuantity > newSection.targetQuantity) {
      toast.error(t('validation', 'completedCannotExceedTarget') || 'Completed quantity cannot exceed target quantity');
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
    if (window.confirm(t('sections', 'deleteConfirm') || 'Are you sure you want to delete this section? This cannot be undone.')) {
      deleteSectionMutation.mutate(id);
    }
  };

  // Filter sections based on selected project
  const filteredSections = selectedProjectId
    ? sections.filter(section => section.projectId === selectedProjectId)
    : sections;

  if (isLoading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="page-header">
          <div className="space-y-2">
            <div className="h-7 w-36 rounded-xl bg-slate-200 animate-pulse" />
            <div className="h-4 w-48 rounded-lg bg-slate-100 animate-pulse" />
          </div>
          <div className="h-10 w-36 rounded-xl bg-slate-200 animate-pulse" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="card animate-pulse" style={{ height: 280 }}>
              <div className="h-1.5 bg-slate-200 rounded-t-xl" />
              <div className="card-content space-y-4">
                <div className="flex gap-3">
                  <div className="w-9 h-9 rounded-xl bg-slate-200" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-3/4 rounded-lg bg-slate-200" />
                    <div className="h-3 w-1/3 rounded bg-slate-100" />
                  </div>
                </div>
                <div className="h-3 w-full rounded bg-slate-100" />
                <div className="h-3 w-5/6 rounded bg-slate-100" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in" dir={language === 'ar' ? 'rtl' : 'ltr'}>

      {/* ── Page header ── */}
      <div className="page-header">
        <div>
          <h1 className="page-title">{t('sections', 'title') || 'Sections'}</h1>
          <p className="page-subtitle">Manage construction sections and work packages</p>
        </div>
        {isAdmin && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn btn-primary btn-lg flex items-center gap-2"
          >
            <PlusIcon className="h-4 w-4" />
            {t('sections', 'newSection') || 'New Section'}
          </button>
        )}
      </div>

      {/* ── Project filter bar ── */}
      <div className="card p-4 flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <label className="text-sm font-semibold text-slate-700 shrink-0">
          {t('sections', 'filterByProject') || 'Filter by Project'}:
        </label>
        <select
          value={selectedProjectId}
          onChange={(e) => setSelectedProjectId(e.target.value)}
          className="form-select flex-1 max-w-xs"
        >
          <option value="">{t('sections', 'allProjects') || 'All Projects'}</option>
          {projects.map((project) => (
            <option key={project.id} value={project.id}>
              {project.name}
            </option>
          ))}
        </select>
        {selectedProjectId && (
          <button
            onClick={() => setSelectedProjectId('')}
            className="btn btn-sm"
          >
            {t('sections', 'clearFilter') || 'Clear'}
          </button>
        )}
        <span className="text-sm text-slate-500 ml-auto">
          {filteredSections.length} sections found
          {selectedProjectId && ` in ${projects.find(p => p.id === selectedProjectId)?.name ?? ''}`}
        </span>
      </div>

      {/* ── Section card grid ── */}
      {filteredSections.length === 0 ? (
        <div className="card py-20 text-center">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
            <BuildingOfficeIcon className="h-8 w-8 text-slate-300" />
          </div>
          <p className="text-sm font-semibold text-slate-600">
            {selectedProjectId
              ? (t('sections', 'noSectionsInProject') || 'No sections in this project')
              : (t('sections', 'noSections') || 'No sections')}
          </p>
          <p className="text-xs text-slate-400 mt-1">
            {selectedProjectId
              ? (t('sections', 'noSectionsInProjectDesc') || 'No sections in the selected project')
              : (t('sections', 'noSectionsDesc') || 'Start by creating a new section')}
          </p>
          {isAdmin && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="btn btn-primary mt-5 mx-auto flex items-center gap-2"
            >
              <PlusIcon className="h-4 w-4" />
              {t('sections', 'newSection') || 'New Section'}
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredSections.map((section, index) => (
            <SectionCard
              key={section.id}
              section={section}
              index={index}
              isAdmin={isAdmin}
              onEdit={(id) => navigate(`/sections/${id}/edit`)}
              onDelete={(id) => handleDeleteSection(id)}
              formatMoney={formatMoney}
              t={t}
            />
          ))}
        </div>
      )}

      {/* ── Create Section Modal ── */}
      {showCreateModal && (
        <div className="fixed z-50 inset-0 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen p-4">
            <div
              className="fixed inset-0 bg-black/50 backdrop-blur-sm animate-fade-in"
              onClick={() => setShowCreateModal(false)}
            />
            <div
              className="relative w-full max-w-lg rounded-2xl bg-white shadow-2xl animate-scale-in overflow-hidden"
              style={{ boxShadow: 'var(--shadow-xl)' }}
            >
              {/* modal header */}
              <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
                <h3 className="text-base font-bold text-slate-800">
                  {t('sections', 'createSection') || 'Create New Section'}
                </h3>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="btn-icon text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                >
                  ✕
                </button>
              </div>

              {/* modal body */}
              <div className="px-6 py-5 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 80px)' }}>
                <form onSubmit={handleCreateSection} className="space-y-4">
                  <div>
                    <label className="form-label">{t('projects', 'name') || 'Section Name'}</label>
                    <input
                      type="text"
                      name="name"
                      required
                      value={newSection.name}
                      onChange={handleInputChange}
                      className="form-input mt-1"
                    />
                  </div>
                  <div>
                    <label className="form-label">{t('projects', 'description') || 'Description'}</label>
                    <textarea
                      name="description"
                      rows={3}
                      value={newSection.description}
                      onChange={handleInputChange}
                      className="form-input mt-1"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="form-label">{t('sections', 'manager') || 'Section Manager'}</label>
                      <input
                        type="text"
                        name="manager"
                        required
                        value={newSection.manager}
                        onChange={handleInputChange}
                        className="form-input mt-1"
                      />
                    </div>
                    <div>
                      <label className="form-label">{t('projects', 'status') || 'Status'}</label>
                      <select
                        name="status"
                        required
                        value={newSection.status}
                        onChange={handleInputChange}
                        className="form-input mt-1"
                      >
                        <option value="not_started">{t('projects', 'notStarted') || 'Not Started'}</option>
                        <option value="in_progress">{t('projects', 'inProgress') || 'In Progress'}</option>
                        <option value="completed">{t('projects', 'completed') || 'Completed'}</option>
                      </select>
                    </div>
                    <div>
                      <label className="form-label">{t('projects', 'budget') || 'Budget'}</label>
                      <input
                        type="number"
                        name="budget"
                        required
                        min="0"
                        step="0.01"
                        value={newSection.budget}
                        onChange={handleInputChange}
                        className="form-input mt-1"
                      />
                    </div>
                    <div>
                      <label className="form-label">{t('projects', 'targetQuantity') || 'Target Quantity'} (km)</label>
                      <input
                        type="number"
                        name="targetQuantity"
                        required
                        min="0"
                        step="0.01"
                        value={newSection.targetQuantity}
                        onChange={handleInputChange}
                        className="form-input mt-1"
                      />
                    </div>
                    <div>
                      <label className="form-label">{t('projects', 'completedQuantity') || 'Completed Quantity'} (km)</label>
                      <input
                        type="number"
                        name="completedQuantity"
                        min="0"
                        step="0.01"
                        value={newSection.completedQuantity}
                        onChange={handleInputChange}
                        className="form-input mt-1"
                      />
                    </div>
                    <div>
                      <label className="form-label">{t('sections', 'project') || 'Project'}</label>
                      <select
                        name="projectId"
                        value={newSection.projectId}
                        onChange={handleInputChange}
                        className="form-input mt-1"
                      >
                        <option value="">{t('common', 'selectProject') || 'Select project (optional)'}</option>
                        {projects.map((project) => (
                          <option key={project.id} value={project.id}>
                            {project.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="form-label">{t('sections', 'details') || 'Details'}</label>
                    <textarea
                      name="details"
                      rows={2}
                      value={newSection.details}
                      onChange={handleInputChange}
                      className="form-input mt-1"
                    />
                  </div>
                  <div>
                    <label className="form-label">{t('sections', 'notes') || 'Notes'}</label>
                    <textarea
                      name="notes"
                      rows={2}
                      value={newSection.notes}
                      onChange={handleInputChange}
                      className="form-input mt-1"
                    />
                  </div>

                  <div className="flex gap-3 justify-end pt-2 border-t border-slate-100 mt-6">
                    <button
                      type="button"
                      disabled={isSubmitting}
                      onClick={() => setShowCreateModal(false)}
                      className="btn btn-ghost"
                    >
                      {t('projects', 'cancel') || 'Cancel'}
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="btn btn-primary"
                      style={isSubmitting ? { opacity: 0.6 } : {}}
                    >
                      {isSubmitting ? (
                        <>
                          <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                          {t('common', 'loading') || 'Saving...'}
                        </>
                      ) : t('projects', 'save') || 'Save'}
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
