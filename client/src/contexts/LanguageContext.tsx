import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { toast } from 'react-toastify';
import enTranslations from '../translations/en.json';
import arTranslations from '../translations/ar.json';

// Define all supported languages
export type Language = 'ar' | 'en';

// Define translation interfaces
interface TranslationData {
  [key: string]: string | TranslationData;
}

// Create the language context
type LanguageContextType = {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (section: string, key: string) => string;
  dir: () => 'rtl' | 'ltr';
  formatDate: (date: Date | string | number, options?: Intl.DateTimeFormatOptions) => string;
  formatNumber: (num: number, options?: Intl.NumberFormatOptions) => string;
  formatCurrency: (amount: number, currency: string) => string;
  hasRtlChars: (text: string) => boolean;
  textAlign: () => 'right' | 'left';
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Load translations from JSON files directly
  const translations = {
    en: enTranslations,
    ar: arTranslations
  };

  const [language, setLanguage] = useState<Language>(() => {
    // Try to get language from localStorage or default to Arabic
    const savedLanguage = localStorage.getItem('language') as Language;
    return savedLanguage || 'ar';
  });

  // Save language preference to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('language', language);
    // Update document dir attribute
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
    
    // Show language changed toast notification for anything after first load
    const isInitialLoad = document.readyState !== 'complete';
    if (!isInitialLoad) {
      const message = language === 'ar' ? 'تم تغيير اللغة بنجاح' : 'Language changed successfully';
      toast.info(message);
    }
  }, [language]);

  // Translation function
  const t = (section: string, key: string): string => {
    try {
      if (
        translations[language] && 
        translations[language][section] && 
        translations[language][section][key]
      ) {
        return translations[language][section][key];
      }
      
      // Fallback to English if key not found in current language
      if (
        language !== 'en' &&
        translations['en'] && 
        translations['en'][section] && 
        translations['en'][section][key]
      ) {
        return translations['en'][section][key];
      }
      
      // Return key if translation not found
      return key;
    } catch (e) {
      console.warn(`Translation not found for ${section}.${key}`);
      return key;
    }
  };

  // Direction helper function
  const dir = (): 'rtl' | 'ltr' => {
    return language === 'ar' ? 'rtl' : 'ltr';
  };

  // Format date helper - Always use Gregorian calendar
  const formatDate = (date: Date | string | number, options?: Intl.DateTimeFormatOptions): string => {
    const dateObj = typeof date === 'string' ? new Date(date) : 
                    typeof date === 'number' ? new Date(date) : date;
    // Use ar-EG instead of ar-SA to avoid Hijri calendar, force Gregorian
    const locale = language === 'ar' ? 'ar-EG' : 'en-US';
    const formatOptions = {
      calendar: 'gregory', // Force Gregorian calendar
      ...options
    };
    return dateObj.toLocaleDateString(locale, formatOptions);
  };

  // Format number helper
  const formatNumber = (num: number, options?: Intl.NumberFormatOptions): string => {
    const locale = language === 'ar' ? 'ar-EG' : 'en-US';
    return num.toLocaleString(locale, options);
  };

  // Format currency helper
  const formatCurrency = (amount: number, currency: string): string => {
    const locale = language === 'ar' ? 'ar-EG' : 'en-US';
    const currencyCode = currency || (language === 'ar' ? 'EGP' : 'USD');
    return amount.toLocaleString(locale, { 
      style: 'currency', 
      currency: currencyCode 
    });
  };

  // Check for RTL characters
  const hasRtlChars = (text: string): boolean => {
    const rtlChars = /[\u0590-\u083F]|[\u08A0-\u08FF]|[\uFB1D-\uFDFF]|[\uFE70-\uFEFF]/;
    return rtlChars.test(text);
  };

  // Get text alignment based on language
  const textAlign = (): 'right' | 'left' => {
    return language === 'ar' ? 'right' : 'left';
  };

  const value = {
    language,
    setLanguage,
    t,
    dir,
    formatDate,
    formatNumber,
    formatCurrency,
    hasRtlChars,
    textAlign
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}; 