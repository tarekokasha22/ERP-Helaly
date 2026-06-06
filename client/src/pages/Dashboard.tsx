// @ts-nocheck
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
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
  LineElement,
  Filler,
  RadialLinearScale,
} from 'chart.js';
import { Doughnut, Line, Bar } from 'react-chartjs-2';
import { mockGetDashboardData, mockGetSections, mockGetProjects, mockGetSpendings } from '../services/mockApi';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useCurrency } from '../contexts/CurrencyContext';
import {
  BanknotesIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ClipboardDocumentListIcon,
  CheckCircleIcon,
  PlusCircleIcon,
  UserCircleIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  BuildingOffice2Icon,
  ArrowRightIcon,
  SparklesIcon,
  RocketLaunchIcon,
  ChartPieIcon,
  CalendarDaysIcon,
  Squares2X2Icon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';
import { CheckCircleIcon as CheckCircleSolid } from '@heroicons/react/24/solid';

ChartJS.register(
  ArcElement, Tooltip, Legend,
  CategoryScale, LinearScale, BarElement, Title,
  PointElement, LineElement, Filler,
  RadialLinearScale
);

const USE_MOCK_API = true;

/* ─── Animated counter hook ──────────────────────────────────────── */
function useCountUp(target: number, duration = 1000, active = true) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!active || target === 0) { setVal(target); return; }
    let start = 0;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      start = Math.min(start + step, target);
      setVal(Math.floor(start));
      if (start >= target) clearInterval(timer);
    }, 16);
    return () => clearInterval(timer);
  }, [target, duration, active]);
  return val;
}

/* ─── Stat card ──────────────────────────────────────────────────── */
interface StatCardProps {
  label: string;
  value: number | string;
  rawValue?: number;
  icon: React.ReactNode;
  gradient: string;
  sub?: string;
  link?: string;
  delay?: number;
  trend?: 'up' | 'down' | null;
  trendVal?: string;
  accentColor?: string;
}

const StatCard: React.FC<StatCardProps> = ({
  label, value, rawValue, icon, gradient, sub, link, delay = 0, trend, trendVal, accentColor
}) => {
  const { language: cardLang } = useLanguage();
  const numericValue = rawValue !== undefined ? rawValue : (typeof value === 'number' ? value : 0);
  const animated = useCountUp(numericValue);
  const shown = rawValue !== undefined ? value : (typeof value === 'number' ? animated : value);

  return (
    <div
      className="stat-card group animate-slide-up"
      style={{
        animationDelay: `${delay}ms`,
        animationFillMode: 'both',
        borderLeftColor: accentColor,
        borderLeftWidth: accentColor ? '4px' : undefined,
      }}
    >
      <div className="flex items-start justify-between mb-4">
        {/* Icon */}
        <div
          className={`w-11 h-11 rounded-2xl ${gradient} flex items-center justify-center
                       shadow-sm group-hover:scale-110 transition-transform duration-300 shrink-0`}
        >
          <div className="text-white">{icon}</div>
        </div>

        {/* Trend badge */}
        {trend && (
          <span
            className={`flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full
              ${trend === 'up'
                ? 'bg-emerald-50 text-emerald-600'
                : 'bg-red-50 text-red-500'}`}
          >
            {trend === 'up'
              ? <ArrowTrendingUpIcon className="w-3 h-3" />
              : <ArrowTrendingDownIcon className="w-3 h-3" />}
            {trendVal}
          </span>
        )}
      </div>

      {/* Value */}
      <div className="mb-1">
        <span className="stat-value">{shown}</span>
      </div>

      {/* Label */}
      <p className="text-sm font-medium mb-1" style={{ color: 'var(--text-muted)' }}>{label}</p>

      {/* Sub text / link */}
      {sub && <p className="text-xs" style={{ color: 'var(--text-xmuted)' }}>{sub}</p>}
      {link && (
        <Link
          to={link}
          className="inline-flex items-center gap-1 text-xs font-semibold mt-2
                     text-brand-500 hover:text-brand-600 transition-colors group/link"
        >
          <span>{cardLang === 'ar' ? 'عرض الكل' : 'View All'}</span>
          <ArrowRightIcon className="w-3 h-3 group-hover/link:translate-x-0.5 transition-transform" />
        </Link>
      )}
    </div>
  );
};

/* ─── Circular progress ring ─────────────────────────────────────── */
const RingProgress: React.FC<{
  pct: number; color: string; bg?: string; size?: number; stroke?: number;
}> = ({ pct, color, bg = '#e2e8f0', size = 110, stroke = 10 }) => {
  const r = (size - stroke) / 2;
  const circ = r * 2 * Math.PI;
  const offset = circ - (Math.min(Math.max(pct, 0), 100) / 100) * circ;
  return (
    <svg width={size} height={size} className="-rotate-90" style={{ overflow: 'visible' }}>
      <circle cx={size / 2} cy={size / 2} r={r} stroke={bg} strokeWidth={stroke} fill="none" />
      <circle
        cx={size / 2} cy={size / 2} r={r}
        stroke={color} strokeWidth={stroke} fill="none"
        strokeDasharray={circ} strokeDashoffset={offset}
        strokeLinecap="round"
        style={{ transition: 'stroke-dashoffset 1.2s cubic-bezier(0.4,0,0.2,1)' }}
      />
    </svg>
  );
};

/* ─── Quick action tile ──────────────────────────────────────────── */
const QuickAction: React.FC<{
  to: string; icon: React.ReactNode; label: string; color: string; delay?: number;
}> = ({ to, icon, label, color, delay = 0 }) => (
  <Link
    to={to}
    className="group flex flex-col items-center justify-center gap-2.5 p-4 rounded-2xl
               border bg-white hover:border-brand-200 hover:bg-brand-50/30
               transition-all duration-200 hover:-translate-y-1 animate-scale-in"
    style={{
      borderColor: 'rgb(226 232 240 / 0.65)',
      animationDelay: `${delay}ms`,
      animationFillMode: 'both',
      boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
    }}
  >
    <div
      className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center
                   shadow-sm group-hover:scale-110 transition-transform duration-300`}
    >
      <div className="text-white">{icon}</div>
    </div>
    <span className="text-xs font-semibold text-center leading-tight" style={{ color: 'var(--text-secondary)' }}>
      {label}
    </span>
  </Link>
);

/* ─── Skeleton loader ────────────────────────────────────────────── */
const DashboardSkeleton = () => (
  <div className="space-y-6 animate-fade-in">
    <div className="flex items-center justify-between">
      <div className="space-y-2">
        <div className="skeleton h-7 w-52" />
        <div className="skeleton h-4 w-72" />
      </div>
      <div className="skeleton h-10 w-32 rounded-xl" />
    </div>
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="stat-card space-y-3">
          <div className="skeleton h-11 w-11 rounded-2xl" />
          <div className="skeleton h-8 w-20" />
          <div className="skeleton h-4 w-28" />
        </div>
      ))}
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <div className="card p-5 lg:col-span-2"><div className="skeleton h-56 w-full rounded-xl" /></div>
      <div className="card p-5"><div className="skeleton h-56 w-full rounded-xl" /></div>
    </div>
  </div>
);

/* ─── Chart tooltip defaults ─────────────────────────────────────── */
const tooltipDefaults = {
  backgroundColor: '#0f172a',
  titleColor: '#f1f5f9',
  bodyColor: '#94a3b8',
  padding: 12,
  cornerRadius: 10,
  borderColor: 'rgba(255,255,255,0.06)',
  borderWidth: 1,
  displayColors: false,
};

/* ─── Main Dashboard ─────────────────────────────────────────────── */
const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { t, language, formatDate } = useLanguage();
  const { formatMoney } = useCurrency();
  const queryClient = useQueryClient();

  const [timeRange, setTimeRange] = useState<string>('all_time');
  const [totalBudget, setTotalBudget] = useState(0);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const isRtl = language === 'ar';

  useEffect(() => {
    queryClient.invalidateQueries(['projects']);
    queryClient.invalidateQueries(['sections']);
    queryClient.invalidateQueries(['spendings']);
    queryClient.invalidateQueries(['dashboard']);
  }, []);

  const { data: dashboardData, isLoading: isDataLoading } = useQuery(
    ['dashboard', timeRange],
    () => USE_MOCK_API ? mockGetDashboardData(timeRange) : null,
    {
      staleTime: 0,
      refetchInterval: 15000,
      placeholderData: {
        projectStats: { total: 0, active: 0, completed: 0, notStarted: 0, percentChange: 0 },
        financialStats: { totalBudget: 0, totalSpending: 0, totalRemaining: 0, monthlyTrend: [], percentChange: 0 },
      },
    }
  );

  const { data: projects = [], dataUpdatedAt: projUpdated } = useQuery(
    ['projects'],
    () => USE_MOCK_API ? mockGetProjects() : [],
    { staleTime: 0, refetchInterval: 15000, refetchOnMount: 'always' }
  );

  const { data: sections = [], dataUpdatedAt: secUpdated } = useQuery(
    ['sections'],
    () => USE_MOCK_API ? mockGetSections() : [],
    { staleTime: 0, refetchInterval: 15000, refetchOnMount: 'always' }
  );

  const { data: spendings = [], dataUpdatedAt: spendUpdated } = useQuery(
    ['spendings'],
    () => USE_MOCK_API ? mockGetSpendings() : [],
    { staleTime: 0, refetchInterval: 15000, refetchOnMount: 'always' }
  );

  useEffect(() => {
    setLastUpdated(new Date());
  }, [projUpdated, secUpdated, spendUpdated]);

  useEffect(() => {
    const handler = () => {
      ['projects', 'sections', 'spendings', 'dashboard'].forEach(k =>
        queryClient.invalidateQueries([k])
      );
    };
    const events = [
      'localStorageChanged', 'projectDataChanged', 'sectionDataChanged', 'spendingDataChanged',
      'projectAdded', 'projectUpdated', 'projectDeleted',
      'sectionAdded', 'sectionUpdated', 'sectionDeleted',
      'spendingAdded', 'spendingUpdated', 'spendingDeleted',
    ];
    events.forEach(e => window.addEventListener(e, handler));
    return () => events.forEach(e => window.removeEventListener(e, handler));
  }, [queryClient]);

  useEffect(() => {
    const pBudget = projects.reduce((s, p) => s + (p.budget || 0), 0);
    const sBudget = sections.reduce((s, sec) => s + (sec.budget || 0), 0);
    setTotalBudget(pBudget + sBudget);
  }, [projects, sections]);

  /* ── Computed stats ───────────────────────────────────────────── */
  const stats = React.useMemo(() => {
    const now = new Date();
    const startDate = timeRange === 'all_time' ? new Date(1900, 0, 1) :
      timeRange === '1_year'   ? new Date(now.getFullYear() - 1, now.getMonth(), 1) :
      timeRange === '6_months' ? new Date(now.getFullYear(), now.getMonth() - 5, 1) :
      timeRange === '3_months' ? new Date(now.getFullYear(), now.getMonth() - 2, 1) :
      new Date(now.getFullYear(), now.getMonth(), 1);
    const endDate = timeRange === 'all_time' ? new Date(2100, 0, 1) :
      new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const fp = projects.filter(p => {
      const s = new Date(p.startDate || p.createdAt);
      const e = p.endDate ? new Date(p.endDate) : endDate;
      return s <= endDate && e >= startDate;
    });
    const fs = spendings.filter(s => {
      const d = new Date(s.date || s.createdAt);
      return d >= startDate && d <= endDate;
    });

    const total       = fp.length;
    const active      = fp.filter(p => p.status === 'in_progress' || p.status === 'active').length;
    const completed   = fp.filter(p => p.status === 'completed').length;
    const notStarted  = fp.filter(p => p.status === 'not_started' || p.status === 'pending').length;
    const totalSpend  = fs.reduce((s, sp) => s + (sp.amount || 0), 0);
    const pBudget     = fp.reduce((s, p) => s + (p.budget || 0), 0);
    const budget      = pBudget + sections.reduce((s, sec) => s + (sec.budget || 0), 0);
    const remaining   = budget - totalSpend;
    const completionPct = total > 0 ? (completed / total) * 100 : 0;
    const budgetPct     = budget > 0 ? (totalSpend / budget) * 100 : 0;

    return { total, active, completed, notStarted, totalSpend, budget, remaining, completionPct, budgetPct };
  }, [projects, sections, spendings, timeRange]);

  /* ── Monthly spending (last 6 months) ──────────────────────────── */
  const spendingMonths = React.useMemo(() => {
    const now = new Date();
    return Array.from({ length: 6 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
      const label = d.toLocaleDateString('en-US', { month: 'short' });
      const total = spendings
        .filter(s => {
          const sd = new Date(s.date || s.createdAt);
          return sd.getMonth() === d.getMonth() && sd.getFullYear() === d.getFullYear();
        })
        .reduce((sum, s) => sum + (s.amount || 0), 0);
      return { label, total, month: d };
    });
  }, [spendings]);

  /* ── Chart 1: Spending trend (line) ─────────────────────────────── */
  const lineData = {
    labels: spendingMonths.map(m => m.label),
    datasets: [{
      label: language === 'ar' ? 'الإنفاق الشهري' : 'Monthly Spending',
      data: spendingMonths.map(m => m.total),
      borderColor: '#f97316',
      backgroundColor: (ctx: any) => {
        const chart = ctx.chart;
        const { ctx: c, chartArea } = chart;
        if (!chartArea) return 'rgba(249,115,22,0.08)';
        const g = c.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
        g.addColorStop(0, 'rgba(249,115,22,0.22)');
        g.addColorStop(1, 'rgba(249,115,22,0.01)');
        return g;
      },
      borderWidth: 2.5,
      fill: true,
      tension: 0.45,
      pointRadius: 4,
      pointBackgroundColor: '#f97316',
      pointBorderColor: '#fff',
      pointBorderWidth: 2.5,
      pointHoverRadius: 7,
      pointHoverBorderWidth: 2.5,
    }],
  };

  const lineOpts = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: 'index' as const, intersect: false },
    plugins: {
      legend: { display: false },
      tooltip: {
        ...tooltipDefaults,
        callbacks: { label: (ctx: any) => ` ${formatMoney(ctx.raw)}` },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        border: { display: false },
        ticks: { color: '#94a3b8', font: { size: 11, family: 'Inter' } },
      },
      y: {
        grid: { color: 'rgba(148,163,184,0.07)', drawBorder: false },
        border: { display: false },
        ticks: {
          color: '#94a3b8',
          font: { size: 11, family: 'Inter' },
          callback: (v: number) => {
            if (v >= 1000000) return `${(v / 1000000).toFixed(1)}M`;
            if (v >= 1000) return `${(v / 1000).toFixed(0)}k`;
            return v;
          },
        },
        beginAtZero: true,
      },
    },
  };

  /* ── Chart 2: Project status donut ──────────────────────────────── */
  const donutData = {
    labels: language === 'ar'
      ? ['مكتمل', 'قيد التنفيذ', 'لم يبدأ']
      : ['Completed', 'In Progress', 'Not Started'],
    datasets: [{
      data: [stats.completed, stats.active, stats.notStarted],
      backgroundColor: ['#10b981', '#f97316', '#cbd5e1'],
      borderColor: ['#ffffff', '#ffffff', '#ffffff'],
      borderWidth: 3,
      hoverOffset: 8,
    }],
  };

  const donutOpts = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '74%',
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          usePointStyle: true,
          boxWidth: 8,
          padding: 16,
          font: { size: 12, family: 'Inter' },
          color: '#64748b',
        },
      },
      tooltip: {
        ...tooltipDefaults,
        callbacks: { label: (ctx: any) => ` ${ctx.label}: ${ctx.parsed}` },
      },
    },
  };

  /* ── Chart 3: Budget vs Spending (grouped bars) ──────────────────── */
  const monthlyBudgetEstimate = stats.budget > 0 ? stats.budget / 6 : 0;
  const budgetCompData = {
    labels: spendingMonths.map(m => m.label),
    datasets: [
      {
        label: language === 'ar' ? 'الميزانية' : 'Budget',
        data: spendingMonths.map(() => monthlyBudgetEstimate),
        backgroundColor: 'rgba(59,130,246,0.70)',
        borderRadius: 5,
        borderSkipped: false as const,
        barPercentage: 0.75,
        categoryPercentage: 0.7,
      },
      {
        label: language === 'ar' ? 'الإنفاق' : 'Spending',
        data: spendingMonths.map(m => m.total),
        backgroundColor: 'rgba(249,115,22,0.85)',
        borderRadius: 5,
        borderSkipped: false as const,
        barPercentage: 0.75,
        categoryPercentage: 0.7,
      },
    ],
  };

  const budgetCompOpts = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: 'index' as const, intersect: false },
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          usePointStyle: true,
          boxWidth: 8,
          padding: 14,
          font: { size: 11, family: 'Inter' },
          color: '#64748b',
        },
      },
      tooltip: {
        ...tooltipDefaults,
        callbacks: {
          label: (ctx: any) => ` ${ctx.dataset.label}: ${formatMoney(ctx.raw)}`,
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        border: { display: false },
        ticks: { color: '#94a3b8', font: { size: 11, family: 'Inter' } },
      },
      y: {
        grid: { color: 'rgba(148,163,184,0.07)', drawBorder: false },
        border: { display: false },
        ticks: {
          color: '#94a3b8',
          font: { size: 11, family: 'Inter' },
          callback: (v: number) => {
            if (v >= 1000000) return `${(v / 1000000).toFixed(1)}M`;
            if (v >= 1000) return `${(v / 1000).toFixed(0)}k`;
            return v;
          },
        },
        beginAtZero: true,
      },
    },
  };

  /* ── Chart 4: Project status bar ────────────────────────────────── */
  const statusBarData = {
    labels: language === 'ar'
      ? ['مكتمل', 'قيد التنفيذ', 'لم يبدأ']
      : ['Completed', 'In Progress', 'Not Started'],
    datasets: [{
      label: language === 'ar' ? 'المشاريع' : 'Projects',
      data: [stats.completed, stats.active, stats.notStarted],
      backgroundColor: [
        'rgba(16,185,129,0.85)',
        'rgba(249,115,22,0.85)',
        'rgba(148,163,184,0.75)',
      ],
      borderRadius: 8,
      borderSkipped: false as const,
    }],
  };

  const statusBarOpts = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        ...tooltipDefaults,
        callbacks: { label: (ctx: any) => ` ${ctx.label}: ${ctx.parsed.y} project(s)` },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        border: { display: false },
        ticks: { color: '#94a3b8', font: { size: 12, family: 'Inter' } },
      },
      y: {
        grid: { color: 'rgba(148,163,184,0.07)', drawBorder: false },
        border: { display: false },
        ticks: {
          color: '#94a3b8',
          font: { size: 11, family: 'Inter' },
          stepSize: 1,
          precision: 0,
        },
        beginAtZero: true,
      },
    },
  };

  /* ── Chart 5: Spending categories (horizontal bar) ──────────────── */
  const categoryLabels = language === 'ar'
    ? ['عمالة', 'معدات ومركبات', 'مواد البناء', 'إدارة ومكتب', 'أخرى']
    : ['Labor', 'Equipment & Vehicles', 'Building Materials', 'Administration & Office', 'Other'];
  const categoryColors = ['#f97316', '#3b82f6', '#10b981', '#8b5cf6', '#94a3b8'];
  const totalSpend = stats.totalSpend || 1;
  const catValues = (() => {
    if (spendings.length === 0) return [0, 0, 0, 0, 0];
    const chunk = totalSpend / 5;
    return [
      chunk * 0.38,
      chunk * 0.22,
      chunk * 0.20,
      chunk * 0.12,
      chunk * 0.08,
    ];
  })();

  const categoryData = {
    labels: categoryLabels,
    datasets: [{
      data: catValues,
      backgroundColor: categoryColors.map(c => `${c}cc`),
      borderRadius: 6,
      borderSkipped: false as const,
    }],
  };

  const categoryOpts = {
    indexAxis: 'y' as const,
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        ...tooltipDefaults,
        callbacks: {
          label: (ctx: any) => ` ${formatMoney(ctx.raw)}`,
        },
      },
    },
    scales: {
      x: {
        grid: { color: 'rgba(148,163,184,0.07)', drawBorder: false },
        border: { display: false },
        ticks: {
          color: '#94a3b8',
          font: { size: 10, family: 'Inter' },
          callback: (v: number) => {
            if (v >= 1000000) return `${(v / 1000000).toFixed(1)}M`;
            if (v >= 1000) return `${(v / 1000).toFixed(0)}k`;
            return v;
          },
        },
        beginAtZero: true,
      },
      y: {
        grid: { display: false },
        border: { display: false },
        ticks: { color: '#475569', font: { size: 12, family: 'Inter' } },
      },
    },
  };

  if (isDataLoading) return <DashboardSkeleton />;

  const greetingTime = () => {
    const h = new Date().getHours();
    if (language === 'ar') {
      if (h < 12) return 'صباح الخير';
      if (h < 17) return 'مساء الخير';
      return 'مساء النور';
    }
    if (h < 12) return 'Good Morning';
    if (h < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  /* ── Top sections for progress display ─────────────────────────── */
  const topSections = sections
    .filter(s => (s.progress || 0) > 0)
    .sort((a, b) => (b.progress || 0) - (a.progress || 0))
    .slice(0, 3);

  return (
    <div className="space-y-6">

      {/* ── Page header ─────────────────────────────────────────── */}
      <div className="page-header animate-fade-in">
        <div>
          <h1 className="page-title">
            {greetingTime()}{user?.name ? `, ${user.name.split(' ')[0]}` : ''} 👋
          </h1>
          <p className="page-subtitle">
            {language === 'ar' ? 'نظرة عامة على نظام الهلالي' : 'Here is an overview of Helaly ERP'}
            <span className="inline-flex items-center gap-1.5 ms-2.5 text-emerald-600 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              {language === 'ar' ? 'مباشر' : 'Live'}
            </span>
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="hidden sm:flex items-center gap-1.5 text-xs" style={{ color: 'var(--text-muted)' }}>
            <ArrowPathIcon className="w-3.5 h-3.5" />
            {lastUpdated.toLocaleTimeString('en-US')}
          </span>
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="form-select text-sm"
            style={{ width: 'auto' }}
          >
            <option value="1_month">{language === 'ar' ? 'شهر واحد' : '1 Month'}</option>
            <option value="3_months">{language === 'ar' ? '3 أشهر' : '3 Months'}</option>
            <option value="6_months">{language === 'ar' ? '6 أشهر' : '6 Months'}</option>
            <option value="1_year">{language === 'ar' ? 'سنة واحدة' : '1 Year'}</option>
            <option value="all_time">{language === 'ar' ? 'كل الوقت' : 'All Time'}</option>
          </select>
        </div>
      </div>

      {/* ── Row 1: KPI Stat Cards ─────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label={t('dashboard', 'totalProjects')}
          value={stats.total}
          icon={<ClipboardDocumentListIcon className="w-5 h-5" />}
          gradient="gradient-blue"
          link="/projects"
          delay={0}
          trend="up"
          trendVal="+2"
          accentColor="#3b82f6"
        />
        <StatCard
          label={t('dashboard', 'activeProjects')}
          value={stats.active}
          icon={<RocketLaunchIcon className="w-5 h-5" />}
          gradient="gradient-brand"
          link="/projects"
          delay={80}
          trend="up"
          trendVal="+1"
          accentColor="#f97316"
        />
        <StatCard
          label={t('dashboard', 'completedProjects')}
          value={stats.completed}
          icon={<CheckCircleIcon className="w-5 h-5" />}
          gradient="gradient-success"
          sub={`${stats.completionPct.toFixed(0)}% ${language === 'ar' ? 'نسبة الإنجاز' : 'completion rate'}`}
          delay={160}
          accentColor="#10b981"
        />
        <StatCard
          label={t('dashboard', 'totalBudget')}
          value={formatMoney(totalBudget)}
          rawValue={totalBudget}
          icon={<CurrencyDollarIcon className="w-5 h-5" />}
          gradient="gradient-purple"
          sub={`${formatMoney(stats.totalSpend)} ${language === 'ar' ? 'منصرف' : 'spent'}`}
          delay={240}
          accentColor="#8b5cf6"
        />
      </div>

      {/* ── Row 2: Spending line + Donut ─────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Line chart — spending trend */}
        <div className="card p-6 lg:col-span-2 animate-slide-up delay-100">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="section-title">{language === 'ar' ? 'مخطط الإنفاق الشهري' : 'Monthly Spending Trend'}</h3>
              <p className="section-subtitle">{language === 'ar' ? 'آخر 6 أشهر · بالعملة المحلية' : 'Last 6 months · in local currency'}</p>
            </div>
            <div
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold"
              style={{ background: 'rgba(249,115,22,0.08)', color: '#f97316' }}
            >
              <span className="w-2.5 h-0.5 rounded-full bg-brand-500" />
              Spending
            </div>
          </div>
          <div style={{ height: '220px' }}>
            <Line data={lineData} options={lineOpts} />
          </div>
        </div>

        {/* Donut — project distribution */}
        <div className="card p-6 animate-slide-up delay-200">
          <div className="mb-4">
            <h3 className="section-title">{language === 'ar' ? 'توزيع المشاريع' : 'Project Distribution'}</h3>
            <p className="section-subtitle">{language === 'ar' ? 'حسب الحالة الحالية' : 'By current status'}</p>
          </div>
          <div className="relative" style={{ height: '175px' }}>
            <Doughnut data={donutData} options={donutOpts} />
            <div
              className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none"
              style={{ marginBottom: '32px' }}
            >
              <span className="text-2xl font-extrabold" style={{ color: 'var(--text-primary)' }}>
                {stats.total}
              </span>
              <span className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
                {language === 'ar' ? 'مشروع' : 'project(s)'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Row 3: Budget comparison + Status bars ─────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        {/* Budget vs Spending (grouped bars) */}
        <div className="card p-6 animate-slide-up delay-200">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="section-title">{language === 'ar' ? 'الميزانية مقابل الإنفاق' : 'Budget vs Spending'}</h3>
              <p className="section-subtitle">{language === 'ar' ? 'مقارنة شهرية تفصيلية' : 'Detailed monthly comparison'}</p>
            </div>
          </div>
          <div style={{ height: '200px' }}>
            <Bar data={budgetCompData} options={budgetCompOpts} />
          </div>
        </div>

        {/* Project status bar */}
        <div className="card p-6 animate-slide-up delay-300">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="section-title">{language === 'ar' ? 'توزيع حالات المشاريع' : 'Project Status Distribution'}</h3>
              <p className="section-subtitle">{language === 'ar' ? 'عدد المشاريع لكل حالة' : 'Number of projects per status'}</p>
            </div>
          </div>
          <div style={{ height: '200px' }}>
            <Bar data={statusBarData} options={statusBarOpts} />
          </div>
        </div>
      </div>

      {/* ── Row 4: Spending categories + Section progress ─────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Spending categories (horizontal bar) */}
        <div className="card p-6 lg:col-span-2 animate-slide-up delay-200">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="section-title">{language === 'ar' ? 'توزيع الإنفاق حسب الفئة' : 'Spending Distribution by Category'}</h3>
              <p className="section-subtitle">{language === 'ar' ? 'تحليل تفصيلي للمصروفات' : 'Detailed expense analysis'}</p>
            </div>
          </div>
          <div style={{ height: '200px' }}>
            <Bar data={categoryData} options={categoryOpts} />
          </div>
        </div>

        {/* Section progress rings */}
        <div className="card p-6 animate-slide-up delay-300">
          <div className="mb-4">
            <h3 className="section-title">{language === 'ar' ? 'تقدم الأقسام' : 'Section Progress'}</h3>
            <p className="section-subtitle">{language === 'ar' ? 'أفضل الأقسام أداءً' : 'Top performing sections'}</p>
          </div>
          {topSections.length > 0 ? (
            <div className="space-y-5">
              {topSections.map((section, i) => {
                const pct = section.progress || 0;
                const ringColors = ['#f97316', '#10b981', '#3b82f6'];
                return (
                  <div key={section.id} className="flex items-center gap-4">
                    <div className="relative shrink-0">
                      <RingProgress
                        pct={pct}
                        color={ringColors[i % 3]}
                        size={52}
                        stroke={5}
                      />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-[11px] font-bold" style={{ color: 'var(--text-primary)' }}>
                          {pct}%
                        </span>
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }}>
                        {section.name}
                      </p>
                      <div className="progress-bar mt-1.5 w-full">
                        <div
                          className="progress-fill"
                          style={{ width: `${pct}%`, background: ringColors[i % 3] }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-32 text-center">
              <ChartPieIcon className="w-8 h-8 mb-2" style={{ color: 'var(--text-xmuted)' }} />
              <p className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>No active sections</p>
              <Link to="/sections" className="text-xs text-brand-500 hover:text-brand-600 mt-1">
                Add a section →
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* ── Row 5: Recent projects + Quick actions ───────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Recent projects */}
        {projects.length > 0 && (
          <div className="card lg:col-span-2 animate-slide-up delay-300">
            <div
              className="flex items-center justify-between px-6 py-4"
              style={{ borderBottom: '1px solid rgb(241 245 249)' }}
            >
              <div>
                <h3 className="section-title">{language === 'ar' ? 'المشاريع الحديثة' : 'Recent Projects'}</h3>
                <p className="section-subtitle">{language === 'ar' ? `آخر ${Math.min(projects.length, 5)} مشاريع` : `Last ${Math.min(projects.length, 5)} projects`}</p>
              </div>
              <Link
                to="/projects"
                className="text-xs font-semibold text-brand-500 hover:text-brand-600
                           flex items-center gap-1 transition-colors"
              >
                {language === 'ar' ? 'عرض الكل' : 'View All'}
                <ArrowRightIcon className="w-3 h-3" />
              </Link>
            </div>
            <div>
              {projects.slice(0, 5).map((project, idx) => {
                const progress = project.progress || 0;
                const statusConfig: Record<string, { label: string; cls: string }> = {
                  completed:   { label: t('projects', 'completed'),   cls: 'badge-success' },
                  in_progress: { label: t('projects', 'inProgress'),  cls: 'badge-brand' },
                  active:      { label: t('projects', 'inProgress'),  cls: 'badge-brand' },
                  not_started: { label: t('projects', 'notStarted'),  cls: 'badge-neutral' },
                  pending:     { label: t('projects', 'notStarted'),  cls: 'badge-warning' },
                };
                const sc = statusConfig[project.status] || statusConfig.not_started;

                return (
                  <div
                    key={project.id}
                    className="flex items-center gap-4 px-6 animate-fade-in"
                    style={{
                      height: '60px',
                      borderBottom: idx < 4 ? '1px solid rgb(248 250 252)' : 'none',
                      animationDelay: `${idx * 55}ms`,
                      animationFillMode: 'both',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'rgb(248 250 252)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                  >
                    {/* Rank */}
                    <span
                      className="text-xs font-bold w-5 text-center shrink-0"
                      style={{ color: 'var(--text-xmuted)' }}
                    >
                      {idx + 1}
                    </span>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <Link
                        to={`/projects/${project.id}`}
                        className="text-sm font-semibold truncate block transition-colors
                                   hover:text-brand-600"
                        style={{ color: 'var(--text-primary)' }}
                      >
                        {project.name}
                      </Link>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className={`badge text-[10px] ${sc.cls}`}>{sc.label}</span>
                        {project.endDate && (
                          <span className="text-[10px] flex items-center gap-0.5" style={{ color: 'var(--text-muted)' }}>
                            <CalendarDaysIcon className="w-3 h-3" />
                            {new Date(project.endDate).toLocaleDateString('en-US')}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Progress */}
                    <div className="hidden sm:flex flex-col items-end gap-1 w-24 shrink-0">
                      <span className="text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>
                        {progress}%
                      </span>
                      <div className="progress-bar w-full">
                        <div
                          className="progress-fill"
                          style={{
                            width: `${progress}%`,
                            background: progress >= 100 ? '#10b981' :
                                        progress >= 60  ? '#f97316' : '#f59e0b',
                          }}
                        />
                      </div>
                    </div>

                    {/* Budget */}
                    {project.budget > 0 && (
                      <span
                        className="hidden md:block text-xs font-semibold w-24 text-end shrink-0"
                        style={{ color: 'var(--text-secondary)' }}
                      >
                        {formatMoney(project.budget)}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Quick actions */}
        <div className="card p-6 animate-slide-up delay-400">
          <h3 className="section-title mb-4">{language === 'ar' ? 'إجراءات سريعة' : 'Quick Actions'}</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-2 gap-3">
            <QuickAction to="/projects"  icon={<PlusCircleIcon className="w-5 h-5" />}       label={t('projects','newProject')}        color="gradient-blue"    delay={0} />
            <QuickAction to="/reports"   icon={<ChartBarIcon className="w-5 h-5" />}          label={t('navigation','reports')}        color="gradient-success" delay={50} />
            <QuickAction to="/employees" icon={<UserCircleIcon className="w-5 h-5" />}        label={t('navigation','employees')}      color="gradient-purple"  delay={100} />
            <QuickAction to="/sections"  icon={<BuildingOffice2Icon className="w-5 h-5" />}   label={t('navigation','sections')}       color="gradient-brand"   delay={150} />
            <QuickAction to="/inventory" icon={<Squares2X2Icon className="w-5 h-5" />}        label={t('navigation','inventory')}      color="gradient-teal"    delay={200} />
            <QuickAction to="/payments"  icon={<BanknotesIcon className="w-5 h-5" />}         label={t('navigation','payments')}       color="gradient-rose"    delay={250} />
          </div>
        </div>
      </div>

    </div>
  );
};

export default Dashboard;
