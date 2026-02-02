import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bars3Icon,
  UserIcon,
  ChevronDownIcon,
  ArrowRightOnRectangleIcon
} from '@heroicons/react/24/outline';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';

interface HeaderProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

interface User {
  id: string;
  name: string;
  username: string;
  role: string;
  country: 'egypt' | 'libya';
}

const Header: React.FC<HeaderProps> = ({ sidebarOpen, setSidebarOpen }) => {
  const { t, language, setLanguage, dir } = useLanguage();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);

  // User is coming from AuthContext now, no need for local state or effect

  const handleLogout = () => {
    logout();
  };

  const toggleLanguage = () => {
    setLanguage(language === 'ar' ? 'en' : 'ar');
  };

  return (
    <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-200 bg-white px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
      <button
        type="button"
        className="-m-2.5 p-2.5 text-gray-700 lg:hidden"
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        <span className="sr-only">Open sidebar</span>
        <Bars3Icon className="h-6 w-6" aria-hidden="true" />
      </button>

      {/* Separator */}
      <div className="h-6 w-px bg-gray-200 lg:hidden" aria-hidden="true" />

      <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
        {/* Company Logo */}
        <div className="flex items-center">
          <img
            src="/logo2.webp"
            alt="Helaly Trans Company Logo"
            className="h-10 w-auto"
            style={{
              maxWidth: '150px',
              objectFit: 'contain'
            }}
            onError={(e) => {
              e.currentTarget.src = "/logo.png";
            }}
          />
          <span className={`${language === 'ar' ? 'mr-3' : 'ml-3'} text-xl font-bold text-blue-900`}>
            الهلالي
          </span>
        </div>

        <div className="flex flex-1"></div>
        <div className="flex items-center gap-x-4 lg:gap-x-6">
          {/* Language Toggle */}
          <button
            type="button"
            onClick={toggleLanguage}
            className="text-sm font-medium text-gray-700 hover:text-gray-900"
          >
            {language === 'ar' ? 'EN' : 'عربي'}
          </button>

          {/* Country Indicator */}
          {user?.country && (
            <div className="flex items-center text-sm font-medium text-gray-700">
              <span className="text-base">
                {user.country === 'egypt' ? '🇪🇬' : '🇱🇾'}
              </span>
              <span className="ml-1">
                {user.country === 'egypt' ? 'Egypt' : 'Libya'}
              </span>
            </div>
          )}

          {/* Separator */}
          <div className="hidden lg:block lg:h-6 lg:w-px lg:bg-gray-200" aria-hidden="true" />

          {/* Profile dropdown */}
          <div className="relative">
            <button
              type="button"
              className="-m-1.5 flex items-center p-1.5"
              onClick={() => setShowDropdown(!showDropdown)}
            >
              <span className="sr-only">Open user menu</span>
              <div className="h-8 w-8 rounded-full bg-gray-50 flex items-center justify-center">
                <UserIcon className="h-5 w-5 text-gray-400" />
              </div>
              <span className="hidden lg:flex lg:items-center">
                <span className="ml-4 text-sm font-semibold leading-6 text-gray-900" aria-hidden="true">
                  {user?.name || 'المستخدم'}
                </span>
                <ChevronDownIcon className="ml-2 h-5 w-5 text-gray-400" aria-hidden="true" />
              </span>
            </button>

            {/* Dropdown Menu */}
            {showDropdown && (
              <div className="absolute right-0 mt-2 w-48 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5">
                <div className="py-1">
                  <button
                    onClick={handleLogout}
                    className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <ArrowRightOnRectangleIcon className="mr-3 h-5 w-5 text-gray-400" />
                    تسجيل الخروج
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;