// @ts-nocheck
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bars3Icon,
  ChevronDownIcon,
  ArrowRightOnRectangleIcon,
  UserCircleIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';

interface HeaderProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
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

const Header: React.FC<HeaderProps> = ({ sidebarOpen, setSidebarOpen }) => {
  const { t, language, setLanguage } = useLanguage();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const toggleLanguage = () => setLanguage(language === 'ar' ? 'en' : 'ar');
  const roleLabel = user?.role === 'admin'
    ? (language === 'ar' ? 'مدير النظام' : 'Admin')
    : (language === 'ar' ? 'موظف' : 'Employee');
  const countryFlag = user?.country === 'egypt' ? '🇪🇬' : '🇱🇾';
  const initials = user?.name ? user.name.slice(0, 2).toUpperCase() : 'US';
  const avatarGrad = getAvatarGradient(user?.name || '');

  return (
    <header
      className="sticky top-0 z-30 flex h-14 items-center gap-3 px-4 sm:px-6 shrink-0"
      style={{
        background: 'rgba(255,255,255,0.95)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(226,232,240,0.65)',
        boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 1px 0 rgba(0,0,0,0.02)',
      }}
    >
      {/* Mobile hamburger */}
      <button
        type="button"
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="flex items-center justify-center w-8 h-8 rounded-lg text-slate-500
                   hover:text-slate-700 hover:bg-slate-100 transition-colors md:hidden -ms-1"
      >
        <Bars3Icon className="h-5 w-5" />
      </button>

      {/* Mobile brand */}
      <div className="flex items-center gap-2 md:hidden">
        <div
          className="w-7 h-7 rounded-lg gradient-brand flex items-center justify-center"
          style={{ boxShadow: '0 0 10px rgba(249,115,22,0.35)' }}
        >
          <SparklesIcon className="w-3.5 h-3.5 text-white" />
        </div>
        <span className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
          Helaly ERP
        </span>
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Right actions */}
      <div className="flex items-center gap-1 sm:gap-2">

        {/* Language toggle */}
        <button
          type="button"
          onClick={toggleLanguage}
          className="hidden sm:flex items-center justify-center h-8 px-3 rounded-xl
                     text-xs font-semibold text-slate-600 hover:bg-slate-100
                     border border-transparent hover:border-slate-200
                     transition-all duration-150"
        >
          {language === 'ar' ? 'EN' : 'عربي'}
        </button>

        {/* Separator */}
        <div
          className="hidden sm:block h-5 w-px mx-0.5"
          style={{ background: 'rgb(226 232 240)' }}
        />

        {/* User dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center gap-2 rounded-xl px-2 py-1.5
                       hover:bg-slate-100 transition-colors duration-150"
          >
            {/* Avatar */}
            <div
              className={`h-7 w-7 rounded-full bg-gradient-to-br ${avatarGrad}
                flex items-center justify-center text-white text-xs font-bold shrink-0`}
              style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.18)' }}
            >
              {initials}
            </div>

            {/* Name + role */}
            <div className="hidden lg:block text-start">
              <p className="text-[13px] font-semibold leading-tight" style={{ color: 'var(--text-primary)' }}>
                {user?.name || 'User'}
              </p>
              <p className="text-[10px] leading-tight" style={{ color: 'var(--text-muted)' }}>
                {countryFlag} · {roleLabel}
              </p>
            </div>

            <ChevronDownIcon
              className={`h-3.5 w-3.5 text-slate-400 transition-transform duration-200
                ${showDropdown ? 'rotate-180' : ''}`}
            />
          </button>

          {/* Dropdown menu */}
          {showDropdown && (
            <div
              className="absolute end-0 top-full mt-2 w-60 rounded-2xl overflow-hidden border bg-white
                         animate-scale-in"
              style={{
                borderColor: 'rgba(226,232,240,0.7)',
                boxShadow: '0 8px 24px -4px rgba(0,0,0,0.12), 0 3px 8px -3px rgba(0,0,0,0.08)',
                transformOrigin: 'top right',
              }}
            >
              {/* User info header */}
              <div
                className="px-4 py-3"
                style={{ borderBottom: '1px solid rgb(241 245 249)' }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`h-9 w-9 rounded-full bg-gradient-to-br ${avatarGrad}
                      flex items-center justify-center text-white text-sm font-bold shrink-0`}
                    style={{ boxShadow: '0 2px 6px rgba(0,0,0,0.18)' }}
                  >
                    {initials}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }}>
                      {user?.name}
                    </p>
                    <p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>
                      {countryFlag} {roleLabel}
                    </p>
                  </div>
                </div>
              </div>

              {/* Menu items */}
              <div className="py-1.5">
                <button
                  onClick={() => { setShowDropdown(false); navigate('/profile'); }}
                  className="flex w-full items-center gap-3 px-4 py-2.5 text-sm
                             text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  <UserCircleIcon className="h-4 w-4 text-slate-400 shrink-0" />
                  <span>{language === 'ar' ? 'الملف الشخصي' : 'Profile'}</span>
                </button>

                {/* Language on mobile */}
                <button
                  onClick={() => { toggleLanguage(); setShowDropdown(false); }}
                  className="flex sm:hidden w-full items-center gap-3 px-4 py-2.5 text-sm
                             text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  <span className="text-slate-400 w-4 text-center font-bold text-xs">
                    {language === 'ar' ? 'EN' : 'ع'}
                  </span>
                  <span>{language === 'ar' ? 'Switch to English' : 'التحويل للعربية'}</span>
                </button>
              </div>

              <div
                className="mx-3"
                style={{ height: '1px', background: 'rgb(241 245 249)' }}
              />

              {/* Logout */}
              <div className="py-1.5">
                <button
                  onClick={() => { setShowDropdown(false); logout(); }}
                  className="flex w-full items-center gap-3 px-4 py-2.5 text-sm
                             text-red-600 hover:bg-red-50 transition-colors"
                >
                  <ArrowRightOnRectangleIcon className="h-4 w-4 shrink-0" />
                  <span>{language === 'ar' ? 'تسجيل الخروج' : 'Sign out'}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
