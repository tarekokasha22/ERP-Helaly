import React, { Fragment, useState, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon, ChevronDownIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
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
} from '@heroicons/react/24/outline';

type SidebarProps = {
  open: boolean;
  setOpen: (open: boolean) => void;
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
};

type NavigationItem = {
  nameKey: string;
  to: string;
  icon: React.ForwardRefExoticComponent<React.SVGProps<SVGSVGElement>>;
  requireAdmin?: boolean;
};

type NavigationGroup = {
  groupNameKey: string;
  items: NavigationItem[];
  expanded?: boolean;
};

interface User {
  id: string;
  name: string;
  username: string;
  email?: string;
  role: string;
  country: 'egypt' | 'libya';
}

const Sidebar: React.FC<SidebarProps> = ({ open, setOpen, collapsed, setCollapsed }) => {
  const { language, t } = useLanguage();
  const [user, setUser] = useState<User | null>(null);
  const [expandedGroups, setExpandedGroups] = React.useState<Record<string, boolean>>({
    construction: true,
    administration: true,
  });
  const [userRole, setUserRole] = useState<string>('user');
  const [userCountry, setUserCountry] = useState<string>('');

  // Load user from sessionStorage
  useEffect(() => {
    const userData = sessionStorage.getItem('user');
    if (userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser); // Keep setting the full user object
        setUserRole(parsedUser.role || 'user');
        setUserCountry(parsedUser.country);
      } catch (error) {
        console.error('Failed to parse user data:', error);
      }
    }
  }, []);

  const navigationGroups: NavigationGroup[] = [
    {
      groupNameKey: 'dashboard',
      items: [
        { nameKey: 'dashboard', to: '/dashboard', icon: HomeIcon },
      ]
    },
    {
      groupNameKey: 'construction',
      items: [
        { nameKey: 'projects', to: '/projects', icon: ClipboardDocumentListIcon },
        { nameKey: 'sections', to: '/sections', icon: DocumentTextIcon },
        { nameKey: 'inventory', to: '/inventory', icon: ArchiveBoxIcon },
      ]
    },
    {
      groupNameKey: 'hr',
      items: [
        { nameKey: 'employees', to: '/employees', icon: UserGroupIcon },
        { nameKey: 'payments', to: '/payments', icon: CurrencyDollarIcon },
      ]
    },
    {
      groupNameKey: 'administration',
      items: [
        { nameKey: 'reports', to: '/reports', icon: ChartPieIcon },
        { nameKey: 'users', to: '/users', icon: UsersIcon },
      ]
    },
    {
      groupNameKey: 'personal',
      items: [
        { nameKey: 'profile', to: '/profile', icon: UserIcon },
      ]
    }
  ];

  const toggleGroupExpanded = (groupKey: string) => {
    setExpandedGroups((prev) => ({
      ...prev,
      [groupKey]: !prev[groupKey]
    }));
  };

  const renderNavigationItem = (item: NavigationItem) => {
    return (
      <NavLink
        key={item.nameKey}
        to={item.to}
        className={({ isActive }) =>
          `group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-all duration-150 ${isActive
            ? 'bg-blue-600 text-white shadow-md'
            : 'text-gray-700 hover:bg-blue-50 hover:text-blue-700'
          }`
        }
      >
        {({ isActive }) => (
          <>
            <div className={`${isActive ? 'bg-white bg-opacity-30' : 'bg-blue-100'} p-1.5 rounded-md ${language === 'ar' ? 'ml-3' : 'mr-3'}`}>
              <item.icon
                className={`flex-shrink-0 h-4 w-4 ${isActive ? 'text-white' : 'text-blue-700'
                  }`}
                aria-hidden="true"
              />
            </div>
            {!collapsed && <span>{t('navigation', item.nameKey)}</span>}
          </>
        )}
      </NavLink>
    );
  };

  const renderNavigationGroup = (group: NavigationGroup, isMobile: boolean = false) => {
    const isExpanded = expandedGroups[group.groupNameKey] !== false;
    const visibleItems = group.items;
    if (visibleItems.length === 0) return null;

    if (visibleItems.length === 1 && group.groupNameKey === 'dashboard') {
      return renderNavigationItem(visibleItems[0]);
    }

    return (
      <div key={group.groupNameKey} className="space-y-1">
        {group.groupNameKey !== 'dashboard' && (
          <button
            onClick={() => toggleGroupExpanded(group.groupNameKey)}
            className={`flex items-center w-full px-3 py-2 text-left text-sm font-medium rounded-md ${isMobile ? 'text-base' : 'text-xs'
              } uppercase tracking-wider text-blue-800 hover:bg-blue-50`}
          >
            <ChevronDownIcon
              className={`${language === 'ar' ? 'ml-1' : 'mr-1'} flex-shrink-0 h-4 w-4 transition-transform text-blue-600 ${isExpanded ? '' : 'transform -rotate-90'
                }`}
              aria-hidden="true"
            />
            {!collapsed && <span className="font-semibold">{t('navigation', group.groupNameKey)}</span>}
          </button>
        )}
        {isExpanded && (
          <div className={`${group.groupNameKey !== 'dashboard' ? 'ml-3 pl-2 border-l border-blue-200' : ''} space-y-2 my-2`}>
            {visibleItems.map(item => renderNavigationItem(item))}
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      {/* Mobile sidebar */}
      <Transition.Root show={open} as={Fragment}>
        <Dialog as="div" className="fixed inset-0 flex z-50 md:hidden" onClose={setOpen}>
          <Transition.Child
            as={Fragment}
            enter="transition-opacity ease-linear duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="transition-opacity ease-linear duration-300"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Dialog.Overlay className="fixed inset-0 bg-gray-600 bg-opacity-75" />
          </Transition.Child>
          <Transition.Child
            as={Fragment}
            enter="transition ease-in-out duration-300 transform"
            enterFrom={language === 'ar' ? 'translate-x-full' : '-translate-x-full'}
            enterTo="translate-x-0"
            leave="transition ease-in-out duration-300 transform"
            leaveFrom="translate-x-0"
            leaveTo={language === 'ar' ? 'translate-x-full' : '-translate-x-full'}
          >
            <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white">
              <Transition.Child
                as={Fragment}
                enter="ease-in-out duration-300"
                enterFrom="opacity-0"
                enterTo="opacity-100"
                leave="ease-in-out duration-300"
                leaveFrom="opacity-100"
                leaveTo="opacity-0"
              >
                <div className={`absolute top-0 ${language === 'ar' ? 'left-0 -ml-12' : 'right-0 -mr-12'} pt-2`}>
                  <button
                    type="button"
                    className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                    onClick={() => setOpen(false)}
                  >
                    <span className="sr-only">{t('navigation', 'closeSidebar')}</span>
                    <XMarkIcon className="h-6 w-6 text-white" aria-hidden="true" />
                  </button>
                </div>
              </Transition.Child>
              <div className="flex-1 h-0 pt-5 pb-4 overflow-y-auto bg-gradient-to-br from-blue-50 to-blue-100">
                <nav className="mt-5 px-3 space-y-4">
                  {navigationGroups.map((group) => renderNavigationGroup(group, true))}
                </nav>
              </div>
              <div className="flex-shrink-0 flex border-t border-blue-200 p-4 bg-white">
                <div className="flex-shrink-0 w-full group block">
                  <div className="flex items-center">
                    <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center text-white">
                      <span className="font-semibold text-sm">
                        {user?.name ? user.name.substring(0, 2).toUpperCase() : 'U'}
                      </span>
                    </div>
                    <div className={`${language === 'ar' ? 'mr-3' : 'ml-3'}`}>
                      <p className="text-sm font-bold text-gray-800">
                        {user?.name || 'مستخدم'}
                      </p>
                      <div className="mt-1">
                        <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-semibold text-blue-800">
                          {user?.role === 'admin' ? 'مدير' : 'موظف'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Transition.Child>
          <div className="flex-shrink-0 w-14"></div>
        </Dialog>
      </Transition.Root>

      {/* Desktop sidebar */}
      <div className={`hidden md:flex md:flex-col md:fixed md:inset-y-0 md:top-0 md:left-0 md:h-screen transition-all duration-300 ease-in-out z-10 ${collapsed ? 'md:w-16' : 'md:w-64'}`}>
        <div className="flex-1 flex flex-col min-h-0 border-r border-gray-200 bg-gradient-to-br from-blue-50 to-blue-100 h-full">
          <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
            {!collapsed && user && (
              <div className="px-3 mb-6">
                <div className="bg-blue-50 rounded-lg p-3">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 bg-blue-100 rounded-md p-1">
                      <UserIcon className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className={`${language === 'ar' ? 'mr-3' : 'ml-3'} flex-1 min-w-0`}>
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {user.name}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {user.country === 'egypt' ? '🇪🇬 مصر' : '🇱🇾 ليبيا'}
                      </p>
                    </div>
                  </div>
                  <div className="mt-2 text-xs">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                      {user.role === 'admin' ? 'مدير' : 'موظف'}
                    </span>
                  </div>
                </div>
              </div>
            )}

            <nav className="flex-1 px-2 space-y-2">
              {navigationGroups.map((group) => renderNavigationGroup(group))}
            </nav>
          </div>
          <div className="flex-shrink-0 flex border-t border-gray-200 p-4 justify-end">
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="p-1 rounded-md bg-blue-100 text-blue-600 hover:bg-blue-200"
              title={collapsed ? 'توسيع' : 'تصغير'}
            >
              {language === 'ar' ? (
                collapsed ? <ChevronLeftIcon className="h-4 w-4" /> : <ChevronRightIcon className="h-4 w-4" />
              ) : (
                collapsed ? <ChevronRightIcon className="h-4 w-4" /> : <ChevronLeftIcon className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;