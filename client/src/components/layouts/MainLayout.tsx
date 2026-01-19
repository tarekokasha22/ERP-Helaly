import React, { useState } from 'react';
import { Outlet, useLocation, Link } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';
import Header from '../ui/Header';
import Sidebar from '../ui/Sidebar';
import { HomeIcon, ArrowRightIcon } from '@heroicons/react/24/outline';

const MainLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { t, language, dir } = useLanguage();
  const location = useLocation();

  // Generate breadcrumbs based on current path
  const getBreadcrumbs = () => {
    const path = location.pathname;
    const segments = path.split('/').filter(Boolean);
    let breadcrumbs = [];

    // Always add dashboard as first breadcrumb
    breadcrumbs.push({
      name: t('navigation', 'dashboard'),
      href: '/dashboard',
      current: segments.length === 1 && segments[0] === 'dashboard'
    });

    // Add other breadcrumbs based on path
    if (segments.length > 0) {
      switch (segments[0]) {
        case 'projects':
          breadcrumbs.push({
            name: t('navigation', 'projects'),
            href: '/projects',
            current: segments.length === 1
          });
          if (segments.length > 1) {
            breadcrumbs.push({
              name: t('navigation', 'projectDetails'),
              href: `/projects/${segments[1]}`,
              current: segments.length === 2 && !segments[2]
            });
            if (segments[2] === 'edit') {
              breadcrumbs.push({
                name: t('projects', 'editProject'),
                href: `/projects/${segments[1]}/edit`,
                current: true
              });
            }
          }
          break;
        case 'sections':
          breadcrumbs.push({
            name: t('navigation', 'sections'),
            href: '/sections',
            current: segments.length === 1
          });
          if (segments.length > 1) {
            breadcrumbs.push({
              name: t('navigation', 'sectionDetails'),
              href: `/sections/${segments[1]}`,
              current: true
            });
          }
          break;
        case 'reports':
          breadcrumbs.push({
            name: t('navigation', 'reports'),
            href: '/reports',
            current: true
          });
          break;
        case 'users':
          breadcrumbs.push({
            name: t('navigation', 'users'),
            href: '/users',
            current: true
          });
          break;
        case 'profile':
          breadcrumbs.push({
            name: t('navigation', 'profile'),
            href: '/profile',
            current: true
          });
          break;
        case 'employees':
          breadcrumbs.push({
            name: t('navigation', 'employees'),
            href: '/employees',
            current: true
          });
          break;
        case 'payments':
          breadcrumbs.push({
            name: t('navigation', 'payments'),
            href: '/payments',
            current: true
          });
          break;
      }
    }

    return breadcrumbs;
  };

  const breadcrumbs = getBreadcrumbs();

  return (
    <div className="h-screen flex overflow-hidden bg-gray-100" dir={dir()}>
      <Sidebar 
        open={sidebarOpen} 
        setOpen={setSidebarOpen}
        collapsed={sidebarCollapsed}
        setCollapsed={setSidebarCollapsed}
      />
      
      {/* Main content area with dynamic margin based on sidebar state */}
      <div className={`flex-1 flex flex-col overflow-hidden transition-all duration-300 ease-in-out ${sidebarCollapsed ? 'md:ml-16' : 'md:ml-64'}`}>
        <div className="sticky top-0 z-30">
          <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        </div>
        
        {/* Breadcrumbs */}
        <nav className="bg-white shadow-sm z-20 px-4 py-2.5">
          <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8">
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <Link to="/dashboard">
              <HomeIcon className="h-4 w-4 text-gray-400" aria-hidden="true" />
              </Link>
              {breadcrumbs.map((item, index) => (
                <React.Fragment key={item.name}>
                  {index > 0 && (
                    <ArrowRightIcon 
                      className={`flex-shrink-0 h-4 w-4 text-gray-400 ${language === 'ar' ? 'transform rotate-180' : ''}`}
                      aria-hidden="true" 
                    />
                  )}
                  <Link
                    to={item.href}
                    className={`${item.current ? 'text-blue-600 font-medium' : 'hover:text-gray-700'}`}
                    aria-current={item.current ? 'page' : undefined}
                  >
                    {item.name}
                  </Link>
                </React.Fragment>
              ))}
            </div>
          </div>
        </nav>
        
        <main className="flex-1 overflow-y-auto bg-gray-50">
          <div className="py-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
            <div className="bg-white shadow overflow-hidden sm:rounded-lg p-4 sm:p-6">
              <Outlet />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default MainLayout; 