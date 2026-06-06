// @ts-nocheck
import React, { Fragment, useState, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { NavLink } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';
import {
  HomeIcon,
  ClipboardDocumentListIcon,
  DocumentTextIcon,
  UsersIcon,
  UserIcon,
  ChartPieIcon,
  ArchiveBoxIcon,
  CurrencyDollarIcon,
  UserGroupIcon,
  XMarkIcon,
  ChevronDoubleLeftIcon,
  ChevronDoubleRightIcon,
} from '@heroicons/react/24/outline';

type SidebarProps = {
  open: boolean;
  setOpen: (open: boolean) => void;
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
};

type NavItem = {
  nameKey: string;
  to: string;
  icon: React.ForwardRefExoticComponent<React.SVGProps<SVGSVGElement>>;
};

type NavGroup = {
  labelKey: string;
  items: NavItem[];
};

const navGroups: NavGroup[] = [
  {
    labelKey: '',
    items: [
      { nameKey: 'dashboard', to: '/dashboard', icon: HomeIcon },
    ],
  },
  {
    labelKey: 'construction',
    items: [
      { nameKey: 'projects',  to: '/projects',  icon: ClipboardDocumentListIcon },
      { nameKey: 'sections',  to: '/sections',  icon: DocumentTextIcon },
      { nameKey: 'inventory', to: '/inventory', icon: ArchiveBoxIcon },
    ],
  },
  {
    labelKey: 'hr',
    items: [
      { nameKey: 'employees', to: '/employees', icon: UserGroupIcon },
      { nameKey: 'payments',  to: '/payments',  icon: CurrencyDollarIcon },
    ],
  },
  {
    labelKey: 'administration',
    items: [
      { nameKey: 'reports', to: '/reports', icon: ChartPieIcon },
      { nameKey: 'users',   to: '/users',   icon: UsersIcon },
    ],
  },
  {
    labelKey: 'personal',
    items: [
      { nameKey: 'profile', to: '/profile', icon: UserIcon },
    ],
  },
];

interface User {
  id: string;
  name: string;
  username: string;
  role: string;
  country: 'egypt' | 'libya';
}

const avatarGradients = [
  'from-orange-400 to-rose-500',
  'from-violet-500 to-purple-600',
  'from-cyan-400 to-blue-500',
  'from-emerald-400 to-teal-500',
];

const getAvatarGradient = (name: string) => {
  const i = name ? name.charCodeAt(0) % avatarGradients.length : 0;
  return avatarGradients[i];
};

/* ── Sidebar Content (shared between mobile + desktop) ─────────── */
const SidebarContent: React.FC<{
  collapsed: boolean;
  onToggleCollapse?: () => void;
  t: any;
  language: string;
  user: User | null;
}> = ({ collapsed, onToggleCollapse, t, language, user }) => {
  return (
    <div className="flex flex-col h-full">

      {/* Brand / Logo */}
      <div
        className="flex items-center h-16 px-4 shrink-0"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
      >
        <div className="flex items-center gap-3 min-w-0">
          {/* Icon mark */}
          <div
            className="shrink-0 w-8 h-8 rounded-lg overflow-hidden flex items-center justify-center"
            style={{ boxShadow: '0 0 14px rgba(249,115,22,0.45)', background: '#fff' }}
          >
            <img
              src="/logo2.webp"
              alt="Helaly"
              className="w-full h-full object-contain"
              onError={(e) => { (e.target as HTMLImageElement).src = '/logo.png'; }}
            />
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <span className="block text-sm font-bold text-white tracking-wide truncate">
                Helaly ERP
              </span>
              <span className="block text-[10px] text-slate-500 truncate tracking-widest uppercase">
                Construction
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto sidebar-scroll py-3 px-2 space-y-0.5" style={{ overflowX: 'hidden' }}>
        {navGroups.map((group) => (
          <div key={group.labelKey || 'main'}>
            {/* Group label */}
            {group.labelKey && !collapsed && (
              <div className="sidebar-group-label">
                {t('navigation', group.labelKey)}
              </div>
            )}
            {/* Divider when collapsed */}
            {group.labelKey && collapsed && (
              <div
                className="h-px mx-2 my-3"
                style={{ background: 'rgba(255,255,255,0.07)' }}
              />
            )}

            {group.items.map((item) => (
              <NavLink
                key={item.nameKey}
                to={item.to}
                title={collapsed ? t('navigation', item.nameKey) : undefined}
                className={({ isActive }) =>
                  `sidebar-item${isActive ? ' active' : ''}${collapsed ? ' justify-center px-2' : ''}`
                }
              >
                {({ isActive }) => (
                  <>
                    <item.icon
                      style={{
                        width: '18px',
                        height: '18px',
                        flexShrink: 0,
                        color: isActive ? '#f97316' : undefined,
                        transition: 'color 120ms',
                      }}
                    />
                    {!collapsed && (
                      <span className="truncate flex-1">
                        {t('navigation', item.nameKey)}
                      </span>
                    )}
                    {!collapsed && isActive && (
                      <span
                        className="shrink-0 w-1.5 h-1.5 rounded-full"
                        style={{ background: '#f97316', marginInlineStart: 'auto' }}
                      />
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </div>
        ))}
      </nav>

      {/* Collapse / Expand toggle — only shown on desktop (onToggleCollapse provided) */}
      {onToggleCollapse && (
        <div className="px-2 pb-1">
          <button
            onClick={onToggleCollapse}
            className={`sidebar-item w-full ${collapsed ? 'justify-center px-2' : ''}`}
            style={{ color: 'var(--sidebar-text)' }}
            title={collapsed ? t('navigation', 'expandSidebar') : t('navigation', 'collapseSidebar')}
          >
            {collapsed ? (
              <ChevronDoubleRightIcon style={{ width: 18, height: 18, flexShrink: 0 }} />
            ) : (
              <>
                <ChevronDoubleLeftIcon style={{ width: 18, height: 18, flexShrink: 0 }} />
                <span className="truncate flex-1 text-sm">
                  {t('navigation', 'collapseSidebar')}
                </span>
              </>
            )}
          </button>
        </div>
      )}

      {/* User card */}
      {user && (
        <div
          className="shrink-0 px-3 py-3"
          style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
        >
          <div className={`flex items-center gap-2.5 ${collapsed ? 'justify-center' : ''}`}>
            <div
              className={`shrink-0 w-8 h-8 rounded-full bg-gradient-to-br ${getAvatarGradient(user.name)}
                flex items-center justify-center text-white text-xs font-bold`}
              style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.3)' }}
            >
              {user.name ? user.name.slice(0, 1).toUpperCase() : 'U'}
            </div>
            {!collapsed && (
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-slate-200 truncate leading-snug">
                  {user.name}
                </p>
                <p className="text-[10px] text-slate-500 truncate">
                  {user.role === 'admin' ? 'Admin' : 'Employee'} ·{' '}
                  {user.country === 'egypt' ? '🇪🇬 Egypt' : '🇱🇾 Libya'}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

/* ── Main Sidebar Component ─────────────────────────────────────── */
const Sidebar: React.FC<SidebarProps> = ({ open, setOpen, collapsed, setCollapsed }) => {
  const { language, t } = useLanguage();
  const [user, setUser] = useState<User | null>(null);
  const isRtl = language === 'ar';

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem('user');
      if (raw) setUser(JSON.parse(raw));
    } catch {}
  }, []);

  const sidebarStyle: React.CSSProperties = {
    background: 'linear-gradient(175deg, #0f172a 0%, #0c1220 55%, #0a1018 100%)',
    boxShadow: '2px 0 24px rgba(0,0,0,0.28)',
    borderInlineEnd: '1px solid rgba(255,255,255,0.04)',
    width: collapsed ? '64px' : '256px',
  };

  return (
    <>
      {/* ── Mobile overlay sidebar ─────────────────────────────── */}
      <Transition.Root show={open} as={Fragment}>
        <Dialog as="div" className="relative z-50 md:hidden" onClose={setOpen}>
          {/* Backdrop */}
          <Transition.Child
            as={Fragment}
            enter="transition-opacity ease-linear duration-200"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="transition-opacity ease-linear duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/65 backdrop-blur-sm" />
          </Transition.Child>

          <div className="fixed inset-0 flex">
            <Transition.Child
              as={Fragment}
              enter="transition ease-in-out duration-280 transform"
              enterFrom={isRtl ? 'translate-x-full' : '-translate-x-full'}
              enterTo="translate-x-0"
              leave="transition ease-in-out duration-280 transform"
              leaveFrom="translate-x-0"
              leaveTo={isRtl ? 'translate-x-full' : '-translate-x-full'}
            >
              <Dialog.Panel
                className="relative flex w-64 flex-col"
                style={{
                  background: 'linear-gradient(175deg, #0f172a 0%, #0c1220 55%, #0a1018 100%)',
                  boxShadow: '4px 0 32px rgba(0,0,0,0.35)',
                }}
              >
                {/* Close button */}
                <Transition.Child
                  as={Fragment}
                  enter="ease-in-out duration-280"
                  enterFrom="opacity-0"
                  enterTo="opacity-100"
                  leave="ease-in-out duration-280"
                  leaveFrom="opacity-100"
                  leaveTo="opacity-0"
                >
                  <div
                    className={`absolute top-3 ${isRtl ? 'left-[-48px]' : 'right-[-48px]'}`}
                  >
                    <button
                      type="button"
                      onClick={() => setOpen(false)}
                      className="flex h-10 w-10 items-center justify-center rounded-full
                                 bg-white/10 text-white hover:bg-white/20 transition-colors"
                    >
                      <XMarkIcon className="h-5 w-5" />
                    </button>
                  </div>
                </Transition.Child>

                <SidebarContent
                  collapsed={false}
                  t={t}
                  language={language}
                  user={user}
                />
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition.Root>

      {/* ── Desktop sidebar — static flex column, never overlaps content ─ */}
      <div
        className="hidden md:flex md:flex-col sidebar-desktop shrink-0
                   transition-[width] duration-300 ease-in-out"
        style={{ ...sidebarStyle, position: 'relative', height: '100vh', overflowY: 'auto' }}
      >
        <SidebarContent
          collapsed={collapsed}
          onToggleCollapse={() => setCollapsed(!collapsed)}
          t={t}
          language={language}
          user={user}
        />
      </div>
    </>
  );
};

export default Sidebar;
