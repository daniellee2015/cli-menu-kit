/**
 * i18n registry - Language management system
 */

import { I18nRegistry, LanguageCode, LanguageMap } from './types.js';
import { zh } from './languages/zh.js';
import { en } from './languages/en.js';

/**
 * Global i18n registry
 */
const registry: I18nRegistry = {
  languages: {
    zh,
    en
  },
  current: 'zh' // Default language
};

/**
 * Get current language code
 * @returns Current language code
 */
export function getCurrentLanguage(): LanguageCode {
  return registry.current;
}

/**
 * Set current language
 * @param lang - Language code to set
 */
export function setLanguage(lang: LanguageCode): void {
  if (!registry.languages[lang]) {
    throw new Error(`Language '${lang}' is not registered`);
  }
  registry.current = lang;
}

/**
 * Get translation for a key path with optional parameter substitution
 * @param keyPath - Dot-separated key path (e.g., 'menus.selectPrompt')
 * @param params - Optional parameters for string interpolation (e.g., { current: '1', total: '10' })
 * @returns Translated string with parameters substituted
 */
export function t(keyPath: string, params?: Record<string, string>): string {
  const keys = keyPath.split('.');
  const langMap = registry.languages[registry.current];

  let value: any = langMap;
  for (const key of keys) {
    if (value && typeof value === 'object' && key in value) {
      value = value[key];
    } else {
      console.warn(`Translation key not found: ${keyPath}`);
      return keyPath; // Return key path as fallback
    }
  }

  let result = typeof value === 'string' ? value : keyPath;

  // Substitute parameters if provided
  if (params) {
    for (const [key, val] of Object.entries(params)) {
      result = result.replace(new RegExp(`\\{${key}\\}`, 'g'), val);
    }
  }

  return result;
}

/**
 * Register a new language
 * @param code - Language code
 * @param translations - Language translations
 */
export function registerLanguage(code: string, translations: LanguageMap): void {
  registry.languages[code as LanguageCode] = translations;
}

/**
 * Get all registered languages
 * @returns Array of language codes
 */
export function getAvailableLanguages(): LanguageCode[] {
  return Object.keys(registry.languages) as LanguageCode[];
}

/**
 * Get current language map
 * @returns Current language translations
 */
export function getCurrentLanguageMap(): LanguageMap {
  return registry.languages[registry.current];
}
