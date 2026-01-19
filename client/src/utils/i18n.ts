export interface TranslationObject {
  [key: string]: string | TranslationObject;
}

let translations: { [lang: string]: TranslationObject } = {};
let currentLanguage = 'en';

// Load translations function
export const loadTranslations = async (language: string): Promise<TranslationObject> => {
  try {
    const translationModule = await import(`../translations/${language}.json`);
    return translationModule.default || translationModule;
  } catch (error) {
    console.warn(`Could not load translations for ${language}`, error);
    return {};
  }
};

// Merge translations function
export const mergeTranslations = (lang: string, newTranslations: TranslationObject): void => {
  if (!translations[lang]) {
    translations[lang] = {};
  }
  translations[lang] = { ...translations[lang], ...newTranslations };
};

// Get translation function
export const getTranslation = (key: string, language: string = currentLanguage): string => {
  const keys = key.split('.');
  let value: any = translations[language];
  
  for (const k of keys) {
    if (value && typeof value === 'object' && k in value) {
      value = value[k];
    } else {
      // Fallback to English if key not found
      value = translations['en'];
      for (const fallbackKey of keys) {
        if (value && typeof value === 'object' && fallbackKey in value) {
          value = value[fallbackKey];
        } else {
          return key; // Return key if translation not found
        }
      }
    }
  }
  
  return typeof value === 'string' ? value : key;
};

// Set current language
export const setCurrentLanguage = (language: string): void => {
  currentLanguage = language;
};

// Get current language
export const getCurrentLanguage = (): string => {
  return currentLanguage;
};

// MISSING FUNCTIONS - ADD THESE NOW:

export const getDirection = (language: string): string => {
  return language === 'ar' ? 'rtl' : 'ltr';
};

export const formatDate = (date: Date | string, language: string): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  // Always use Gregorian calendar, just change locale for language
  const locale = language === 'ar' ? 'ar-EG' : 'en-US';
  return dateObj.toLocaleDateString(locale, {
    calendar: 'gregory', // Force Gregorian calendar
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

export const formatNumber = (number: number, language: string): string => {
  const locale = language === 'ar' ? 'ar-EG' : 'en-US';
  return number.toLocaleString(locale);
};

export const formatCurrency = (amount: number, language: string): string => {
  const locale = language === 'ar' ? 'ar-EG' : 'en-US';
  const currency = language === 'ar' ? 'EGP' : 'USD';
  return amount.toLocaleString(locale, { 
    style: 'currency', 
    currency: currency 
  });
};

export const hasRtlCharacters = (text: string): boolean => {
  const rtlChars = /[\u0590-\u083F]|[\u08A0-\u08FF]|[\uFB1D-\uFDFF]|[\uFE70-\uFEFF]/;
  return rtlChars.test(text);
};

export const getTextAlign = (language: string): string => {
  return language === 'ar' ? 'right' : 'left';
};

// Translation helper function
export const t = (key: string, language?: string): string => {
  return getTranslation(key, language);
};

export default {
  loadTranslations,
  mergeTranslations,
  getTranslation,
  setCurrentLanguage,
  getCurrentLanguage,
  getDirection,
  formatDate,
  formatNumber,
  formatCurrency,
  hasRtlCharacters,
  getTextAlign,
  t
}; 