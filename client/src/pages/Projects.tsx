// @ts-nocheck
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  CalendarDaysIcon,
  UserCircleIcon,
  BanknotesIcon,
  FolderOpenIcon,
  MapPinIcon,
} from '@heroicons/react/24/outline';
import api from '../services/api';
import { mockGetProjects, mockCreateProject, mockDeleteProject } from '../services/mockApi';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useCurrency } from '../contexts/CurrencyContext';
import { toast } from 'react-toastify';
import useDashboardState from '../hooks/useDashboardState';

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
  totalLength: number;
  unit: 'km' | 'm' | 'sq_m' | 'units';
  progress?: number;
};

/* ── Status helpers ────────────────────────────────────────────── */
const getStatusConfig = (t: (ns: string, key: string) => string) => ({
  completed:   { label: t('projects', 'completed'),   badge: 'badge-success', bar: '#10b981' },
  in_progress: { label: t('projects', 'inProgress'),  badge: 'badge-brand',   bar: '#f97316' },
  not_started: { label: t('projects', 'notStarted'),  badge: 'badge-muted',   bar: '#94a3b8' },
});

/* ── Summary stat pill ─────────────────────────────────────────── */
const SummaryPill: React.FC<{ label: string; value: string | number; color: string }> = ({ label, value, color }) => (
  <div className="stat-card flex-1 min-w-[120px] flex flex-col gap-1" style={{ borderTop: `3px solid ${color}`, padding: '16px 20px' }}>
    <span className="stat-value" style={{ fontSize: '1.6rem' }}>{value}</span>
    <span className="text-xs text-slate-500 font-medium">{label}</span>
  </div>
);

/* ── Project card ──────────────────────────────────────────────── */
const ProjectCard: React.FC<{
  project: Project;
  index: number;
  isAdmin: boolean;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  formatMoney: (n: number) => string;
  t: (ns: string, key: string) => string;
}> = ({ project, index, isAdmin, onEdit, onDelete, formatMoney, t }) => {
  const statusCfg = getStatusConfig(t);
  const cfg  = statusCfg[project.status] ?? statusCfg.not_started;
  const prog = project.progress ?? 0;

  /* gradient fill color based on progress level */
  const progressGradient =
    prog >= 100 ? 'linear-gradient(90deg, #10b981, #34d399)' :
    prog >= 60  ? 'linear-gradient(90deg, #f97316, #fb923c)' :
                  'linear-gradient(90deg, #f59e0b, #fbbf24)';

  /* manager initials for avatar */
  const initials = (project.manager || '')
    .split(' ')
    .slice(0, 2)
    .map(w => w[0] ?? '')
    .join('')
    .toUpperCase();

  return (
    <Link
      to={`/projects/${project.id}`}
      className="card animate-fade-in block"
      style={{
        animationDelay: `${index * 50}ms`,
        animationFillMode: 'both',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        textDecoration: 'none',
        cursor: 'pointer',
      }}
    >
      {/* ── Colored top bar (thicker, full-width) ── */}
      <div style={{ height: 6, background: cfg.bar, borderRadius: '12px 12px 0 0' }} />

      {/* ── Status + progress badge row ── */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '10px 20px 0',
      }}>
        <span className={`badge ${cfg.badge}`} style={{ fontSize: 11, letterSpacing: '0.04em' }}>{cfg.label}</span>
        <span style={{
          fontSize: 13, fontWeight: 800, color: cfg.bar,
          background: `${cfg.bar}18`, borderRadius: 8, padding: '2px 10px',
          letterSpacing: '0.01em',
        }}>
          {prog}%
        </span>
      </div>

      <div className="card-content" style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 14, paddingTop: 10 }}>

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
              {project.name}
            </span>
          </div>

          {isAdmin && (
            <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
              <button
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); onEdit(project.id); }}
                className="btn-icon text-slate-400 hover:text-brand-600 hover:bg-brand-50"
                title={t('common', 'edit')}
              >
                <PencilIcon className="h-4 w-4" />
              </button>
              <button
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); onDelete(project.id); }}
                className="btn-icon text-slate-400 hover:text-red-600 hover:bg-red-50"
                title={t('common', 'delete')}
              >
                <TrashIcon className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>

        {/* ── Description ── */}
        {project.description && (
          <p className="text-sm text-slate-500 leading-relaxed" style={{
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}>
            {project.description}
          </p>
        )}

        {/* ── Meta grid ── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px 12px' }}>
          {/* Location */}
          {(project as any).location && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
              <MapPinIcon className="h-4 w-4 text-brand-500 shrink-0" />
              <span className="text-sm text-slate-600 truncate">{(project as any).location}</span>
            </div>
          )}

          {/* Budget */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
            <BanknotesIcon className="h-4 w-4 text-slate-400 shrink-0" />
            <span className="text-lg font-bold text-brand-600 truncate">{formatMoney(project.budget)}</span>
          </div>

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
            <span className="text-sm text-slate-600 truncate">{project.manager}</span>
          </div>

          {/* Dates */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
            <CalendarDaysIcon className="h-4 w-4 text-slate-400 shrink-0" />
            <span className="text-xs text-slate-500">
              {new Date(project.startDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: '2-digit' })}
              {' → '}
              {new Date(project.endDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: '2-digit' })}
            </span>
          </div>

          {/* Total length */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
            <span className="text-slate-400 text-sm shrink-0">📏</span>
            <span className="text-sm text-slate-600">{project.totalLength} {project.unit}</span>
          </div>
        </div>

        {/* ── Progress bar (10 px, gradient) ── */}
        <div style={{ marginTop: 'auto' }}>
          <div className="progress-bar" style={{ height: 10, borderRadius: 99 }}>
            <div
              className="progress-fill"
              style={{
                width: `${prog}%`,
                background: progressGradient,
                borderRadius: 99,
                transition: 'width 0.6s cubic-bezier(0.4,0,0.2,1)',
              }}
            />
          </div>
        </div>

      </div>
    </Link>
  );
};

/* ══════════════════════════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════════════════════════ */
const Projects: React.FC = () => {
  const { user }         = useAuth();
  const { t, language }  = useLanguage();
  const { formatMoney }  = useCurrency();
  const navigate         = useNavigate();
  const queryClient      = useQueryClient();

  const { projectOperations, debugLog, healthCheck } = useDashboardState({
    enableDebugging: true,
    enableOptimisticUpdates: true,
    refetchDelay: 0,
  });

  const isAdmin = user?.role === 'admin';
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isSubmitting, setIsSubmitting]       = useState(false);
  const [filterStatus, setFilterStatus]       = useState<'all' | Project['status']>('all');
  const [newProject, setNewProject] = useState({
    name: '', description: '', startDate: '', endDate: '',
    status: 'not_started' as const, budget: 0, manager: '', totalLength: 0, unit: 'km' as const,
  });

  /* ── Query ── */
  const { data: projects = [], isLoading } = useQuery<Project[]>(
    ['projects'],
    async () => {
      try {
        return USE_MOCK_API ? await mockGetProjects() : (await api.get('/projects')).data?.data || [];
      } catch { return []; }
    },
    { staleTime: 0, refetchOnMount: 'always' }
  );

  /* ── Mutations ── */
  const createMutation = useMutation(
    async (data: any) => USE_MOCK_API ? mockCreateProject(data) : (await api.post('/projects', data)).data,
    {
      onSuccess: async (proj) => {
        await projectOperations.onCreate(proj);
        healthCheck();
        toast.success('Project created successfully!');
        setShowCreateModal(false);
        setNewProject({ name: '', description: '', startDate: '', endDate: '', status: 'not_started', budget: 0, manager: '', totalLength: 0, unit: 'km' });
      },
      onError: () => toast.error('Failed to create project. Please try again.'),
      onSettled: () => setIsSubmitting(false),
    }
  );

  const deleteMutation = useMutation(
    async (id: string) => USE_MOCK_API ? mockDeleteProject(id) : api.delete(`/projects/${id}`),
    {
      onSuccess: async (_, id) => {
        await projectOperations.onDelete(id);
        healthCheck();
        toast.success('Project deleted.');
      },
      onError: () => toast.error(t('projects', 'deleteError')),
    }
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewProject(prev => ({ ...prev, [name]: name === 'budget' || name === 'totalLength' ? parseFloat(value) || 0 : value }));
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProject.name.trim())        { toast.error(t('validation', 'nameRequired'));             return; }
    if (!newProject.startDate)          { toast.error(t('validation', 'startDateRequired'));         return; }
    if (!newProject.endDate)            { toast.error(t('validation', 'endDateRequired'));           return; }
    if (new Date(newProject.startDate) > new Date(newProject.endDate)) {
      toast.error(t('validation', 'endDateMustBeAfterStartDate')); return;
    }
    if (newProject.budget <= 0)         { toast.error(t('validation', 'budgetMustBePositive'));      return; }
    if (!newProject.manager.trim())     { toast.error(t('validation', 'managerRequired'));           return; }
    if (newProject.totalLength <= 0)    { toast.error(t('validation', 'totalLengthRequired'));       return; }
    setIsSubmitting(true);
    createMutation.mutate(newProject);
  };

  /* ── Filtered list ── */
  const filtered = filterStatus === 'all' ? projects : projects.filter(p => p.status === filterStatus);

  /* ── Summary counts ── */
  const counts = {
    total:       projects.length,
    active:      projects.filter(p => p.status === 'in_progress').length,
    completed:   projects.filter(p => p.status === 'completed').length,
    notStarted:  projects.filter(p => p.status === 'not_started').length,
  };

  /* ── Loading skeleton ── */
  if (isLoading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="page-header">
          <div className="space-y-2">
            <div className="h-7 w-36 rounded-xl bg-slate-200 animate-pulse" />
            <div className="h-4 w-24 rounded-lg bg-slate-100 animate-pulse" />
          </div>
          <div className="h-10 w-36 rounded-xl bg-slate-200 animate-pulse" />
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="stat-card animate-pulse">
              <div className="h-8 w-16 rounded-lg bg-slate-200 mb-2" />
              <div className="h-3 w-24 rounded bg-slate-100" />
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="card animate-pulse" style={{ height: 260 }}>
              <div className="h-1 bg-slate-200 rounded-t-xl" />
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
      <div className="page-header flex flex-col sm:flex-row gap-3">
        <div>
          <h1 className="page-title">{t('projects', 'title')}</h1>
          <p className="page-subtitle">{counts.total} projects registered</p>
        </div>
        {isAdmin && (
          <button onClick={() => setShowCreateModal(true)} className="btn-primary w-full sm:w-auto">
            <PlusIcon className="h-4 w-4" />
            {t('projects', 'newProject')}
          </button>
        )}
      </div>

      {/* ── Summary stat pills ── */}
      <div className="flex flex-wrap gap-4">
        <SummaryPill label="Total Projects"   value={counts.total}      color="#64748b" />
        <SummaryPill label="In Progress"      value={counts.active}     color="#f97316" />
        <SummaryPill label="Completed"        value={counts.completed}  color="#10b981" />
        <SummaryPill label="Not Started"      value={counts.notStarted} color="#94a3b8" />
      </div>

      {/* ── Status filter tabs ── */}
      <div className="overflow-x-auto pb-1">
      <div className="flex items-center gap-2 flex-nowrap sm:flex-wrap min-w-max sm:min-w-0">
        {(['all', 'in_progress', 'completed', 'not_started'] as const).map(s => (
          <button
            key={s}
            onClick={() => setFilterStatus(s)}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all duration-150 ${
              filterStatus === s
                ? 'bg-brand-600 text-white shadow-sm'
                : 'bg-white text-slate-500 border border-slate-200 hover:border-slate-300'
            }`}
          >
            {s === 'all'         ? `All (${counts.total})`
             : s === 'in_progress' ? `In Progress (${counts.active})`
             : s === 'completed'   ? `Completed (${counts.completed})`
             : `Not Started (${counts.notStarted})`}
          </button>
        ))}
      </div>
      </div>

      {/* ── Card grid ── */}
      {filtered.length === 0 ? (
        <div className="card py-20 text-center">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
            <FolderOpenIcon className="h-8 w-8 text-slate-300" />
          </div>
          <p className="text-sm font-semibold text-slate-600">{t('common', 'noData')}</p>
          <p className="text-xs text-slate-400 mt-1">
            {filterStatus === 'all' ? 'Start by creating your first project' : `No ${filterStatus.replace('_', ' ')} projects`}
          </p>
          {isAdmin && filterStatus === 'all' && (
            <button onClick={() => setShowCreateModal(true)} className="btn-primary mt-5 mx-auto">
              <PlusIcon className="h-4 w-4" />
              Create First Project
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
          {filtered.map((project, idx) => (
            <ProjectCard
              key={project.id}
              project={project}
              index={idx}
              isAdmin={isAdmin}
              onEdit={id => navigate(`/projects/${id}/edit`)}
              onDelete={id => { if (window.confirm(t('projects', 'deleteConfirm'))) deleteMutation.mutate(id); }}
              formatMoney={formatMoney}
              t={t}
            />
          ))}
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════
          Create Project Modal
      ══════════════════════════════════════════════════════════ */}
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
              {/* header */}
              <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
                <h3 className="text-base font-bold text-slate-800">
                  {t('projects', 'createProject')}
                </h3>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="btn-icon text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                >
                  ✕
                </button>
              </div>

              {/* body */}
              <div className="px-6 py-5 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 80px)' }}>
                <form onSubmit={handleCreate} className="space-y-4">
                  <div>
                    <label className="form-label">{t('projects', 'name')}</label>
                    <input type="text" name="name" required value={newProject.name} onChange={handleInputChange} className="form-input mt-1" />
                  </div>
                  <div>
                    <label className="form-label">{t('projects', 'description')}</label>
                    <textarea name="description" rows={3} value={newProject.description} onChange={handleInputChange} className="form-input mt-1" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="form-label">{t('projects', 'startDate')}</label>
                      <input type="date" name="startDate" required value={newProject.startDate} onChange={handleInputChange} className="form-input mt-1" />
                    </div>
                    <div>
                      <label className="form-label">{t('projects', 'endDate')}</label>
                      <input type="date" name="endDate" required value={newProject.endDate} onChange={handleInputChange} className="form-input mt-1" />
                    </div>
                    <div>
                      <label className="form-label">{t('projects', 'status')}</label>
                      <select name="status" required value={newProject.status} onChange={handleInputChange} className="form-input mt-1">
                        <option value="not_started">{t('projects', 'notStarted')}</option>
                        <option value="in_progress">{t('projects', 'inProgress')}</option>
                        <option value="completed">{t('projects', 'completed')}</option>
                      </select>
                    </div>
                    <div>
                      <label className="form-label">{t('projects', 'budget')}</label>
                      <input type="number" name="budget" required min="0" step="0.01" value={newProject.budget} onChange={handleInputChange} className="form-input mt-1" />
                    </div>
                    <div>
                      <label className="form-label">{t('projects', 'manager')}</label>
                      <input type="text" name="manager" required value={newProject.manager} onChange={handleInputChange} className="form-input mt-1" />
                    </div>
                    <div>
                      <label className="form-label">{t('projects', 'totalLength')}</label>
                      <input type="number" name="totalLength" required min="0" step="0.01" value={newProject.totalLength} onChange={handleInputChange} className="form-input mt-1" />
                    </div>
                    <div>
                      <label className="form-label">{t('projects', 'unit')}</label>
                      <select name="unit" required value={newProject.unit} onChange={handleInputChange} className="form-input mt-1">
                        <option value="km">{t('projects', 'unitKm')}</option>
                        <option value="m">{t('projects', 'unitM')}</option>
                        <option value="sq_m">{t('projects', 'unitSqM')}</option>
                        <option value="units">{t('projects', 'unitUnits')}</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex gap-3 justify-end pt-2 border-t border-slate-100 mt-6">
                    <button type="button" disabled={isSubmitting} onClick={() => setShowCreateModal(false)} className="btn btn-ghost">
                      {t('projects', 'cancel')}
                    </button>
                    <button type="submit" disabled={isSubmitting} className="btn btn-primary" style={isSubmitting ? { opacity: 0.6 } : {}}>
                      {isSubmitting ? (
                        <>
                          <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                          {t('common', 'loading')}
                        </>
                      ) : t('projects', 'save')}
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
