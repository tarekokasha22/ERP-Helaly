/**
 * Helper functions to load and merge translations
 */

import { Language } from '../contexts/LanguageContext';

/**
 * Load translation files for the given language
 * @param {Language} language - The language to load
 * @returns {Promise<object>} - The loaded translations
 */
export const loadTranslations = async (language) => {
  try {
    // This will dynamically import the translation file
    const translations = await import(`../translations/${language}.json`);
    return translations.default;
  } catch (error) {
    console.error(`Failed to load translations for ${language}:`, error);
    return {};
  }
};

/**
 * Merge translations with existing translations
 * @param {object} existingTranslations - The existing translations
 * @param {object} newTranslations - The new translations to merge
 * @returns {object} - The merged translations
 */
export const mergeTranslations = (existingTranslations, newTranslations) => {
  const result = { ...existingTranslations };
  
  // Iterate through all sections in new translations
  Object.keys(newTranslations).forEach(section => {
    if (!result[section]) {
      result[section] = { en: {}, ar: {} };
    }
    
    // Merge English translations
    if (newTranslations[section].en) {
      result[section].en = {
        ...result[section].en,
        ...newTranslations[section].en
      };
    }
    
    // Merge Arabic translations
    if (newTranslations[section].ar) {
      result[section].ar = {
        ...result[section].ar,
        ...newTranslations[section].ar
      };
    }
  });
  
  return result;
}; 