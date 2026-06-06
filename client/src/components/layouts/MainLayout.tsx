// @ts-nocheck
import React, { useState } from 'react';
import { Outlet, useLocation, Link } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';
import Header from '../ui/Header';
import Sidebar from '../ui/Sidebar';
import { HomeIcon, ChevronRightIcon, ChevronLeftIcon } from '@heroicons/react/24/outline';

const routeMap: Record<string, string> = {
  dashboard:  'navigation.dashboard',
  projects:   'navigation.projects',
  sections:   'navigation.sections',
  reports:    'navigation.reports',
  users:      'navigation.users',
  profile:    'navigation.profile',
  employees:  'navigation.employees',
  payments:   'navigation.payments',
  inventory:  'navigation.inventory',
  'ai-chat':  'navigation.aiChat',
};

const MainLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen]           = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { t, language, dir } = useLanguage();
  const location = useLocation();
  const isRtl = language === 'ar';

  const getBreadcrumbs = () => {
    const segments = location.pathname.split('/').filter(Boolean);
    const crumbs: { name: string; href: string; current: boolean }[] = [];

    crumbs.push({
      name: t('navigation', 'dashboard'),
      href: '/dashboard',
      current: segments.length === 1 && segments[0] === 'dashboard',
    });

    if (segments.length > 0 && segments[0] !== 'dashboard') {
      const key = segments[0];
      crumbs.push({
        name: t('navigation', key) || key,
        href: `/${key}`,
        current: segments.length === 1,
      });
      if (segments.length > 1) {
        crumbs.push({
          name: segments[1] === 'edit'
            ? t('projects', 'editProject')
            : `#${segments[1].slice(0, 8)}`,
          href: `/${key}/${segments[1]}`,
          current: segments.length === 2,
        });
        if (segments[2] === 'edit') {
          crumbs.push({
            name: t('projects', 'editProject') || 'Edit',
            href: `/${key}/${segments[1]}/edit`,
            current: true,
          });
        }
      }
    }
    return crumbs;
  };

  const breadcrumbs = getBreadcrumbs();
  const Separator = isRtl ? ChevronLeftIcon : ChevronRightIcon;

  return (
    <div className="h-screen flex overflow-hidden" style={{ background: 'var(--bg-page)' }} dir={dir()}>
      <Sidebar
        open={sidebarOpen}
        setOpen={setSidebarOpen}
        collapsed={sidebarCollapsed}
        setCollapsed={setSidebarCollapsed}
      />

      {/* ── Main content — fills remaining flex space ── */}
      <div className="flex flex-1 flex-col overflow-hidden min-w-0">
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

        {/* Breadcrumbs */}
        {breadcrumbs.length > 1 && (
          <nav
            className="flex items-center gap-1.5 px-4 sm:px-6 py-2.5 text-xs border-b bg-white/80 backdrop-blur-sm shrink-0"
            style={{ borderColor: 'rgba(226,232,240,0.6)' }}
          >
            <Link
              to="/dashboard"
              className="text-slate-400 hover:text-slate-600 transition-colors"
            >
              <HomeIcon className="h-3.5 w-3.5" />
            </Link>
            {breadcrumbs.map((crumb, i) => (
              <React.Fragment key={`${crumb.href}-${i}`}>
                <Separator className="h-3 w-3 text-slate-300 shrink-0" />
                <Link
                  to={crumb.href}
                  className={`transition-colors font-medium ${
                    crumb.current
                      ? 'text-brand-600'
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                  aria-current={crumb.current ? 'page' : undefined}
                >
                  {crumb.name}
                </Link>
              </React.Fragment>
            ))}
          </nav>
        )}

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-full px-4 sm:px-6 py-6 animate-fade-in">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
