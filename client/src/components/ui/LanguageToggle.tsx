import React from 'react';
import { LanguageIcon } from '@heroicons/react/24/outline';
import { useLanguage, Language } from '../../contexts/LanguageContext';

interface LanguageToggleProps {
  variant?: 'button' | 'dropdown';
  className?: string;
}

const LanguageToggle: React.FC<LanguageToggleProps> = ({ 
  variant = 'button',
  className = '' 
}) => {
  const { language, setLanguage, t } = useLanguage();

  const toggleLanguage = () => {
    setLanguage(language === 'ar' ? 'en' : 'ar');
  };

  if (variant === 'dropdown') {
    return (
      <div className={`relative ${className}`}>
        <label htmlFor="language-select" className="sr-only">
          {t('common', 'selectLanguage')}
        </label>
        <select
          id="language-select"
          value={language}
          onChange={(e) => setLanguage(e.target.value as Language)}
          className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm rounded-md"
        >
          <option value="en">{t('common', 'english')}</option>
          <option value="ar">{t('common', 'arabic')}</option>
        </select>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={toggleLanguage}
      className={`p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 ${className}`}
      title={language === 'ar' ? t('common', 'english') : t('common', 'arabic')}
    >
      <LanguageIcon className="h-6 w-6" aria-hidden="true" />
      <span className="sr-only">
        {language === 'ar' ? t('common', 'english') : t('common', 'arabic')}
      </span>
    </button>
  );
};

export default LanguageToggle; 