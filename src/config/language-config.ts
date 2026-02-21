/**
 * Language Configuration System
 * Supports dynamic language loading from JSON
 */

import * as fs from 'fs';
import * as path from 'path';

export interface LanguageConfig {
  code: string;              // Language code (e.g., 'en', 'zh-CN')
  cliCode?: string;          // CLI-specific code (optional, defaults to code)
  label: string;             // English label
  nativeLabel: string;       // Native language label
  [key: string]: any;        // Allow custom fields
}

export interface LanguagesConfig {
  default: string;           // Default language code
  languages: LanguageConfig[];
}

class LanguageManager {
  private config: LanguagesConfig;
  private languageMap: Map<string, LanguageConfig>;

  constructor(config: LanguagesConfig) {
    this.config = config;
    this.languageMap = new Map();

    // Build language map
    for (const lang of config.languages) {
      this.languageMap.set(lang.code, lang);
    }
  }

  /**
   * Get all supported languages
   */
  getLanguages(): LanguageConfig[] {
    return this.config.languages;
  }

  /**
   * Get language config by code
   */
  getLanguage(code: string): LanguageConfig | undefined {
    return this.languageMap.get(code);
  }

  /**
   * Get default language code
   */
  getDefaultLanguage(): string {
    return this.config.default;
  }

  /**
   * Get CLI language code
   */
  getCLICode(code: string): string {
    const lang = this.getLanguage(code);
    return lang?.cliCode || lang?.code || this.getDefaultLanguage();
  }

  /**
   * Check if language is supported
   */
  isSupported(code: string): boolean {
    return this.languageMap.has(code);
  }

  /**
   * Get all language codes
   */
  getLanguageCodes(): string[] {
    return Array.from(this.languageMap.keys());
  }
}

// Global language manager
let globalLanguageManager: LanguageManager | null = null;

/**
 * Initialize language manager from config
 */
export function initLanguages(config: LanguagesConfig): LanguageManager {
  globalLanguageManager = new LanguageManager(config);
  return globalLanguageManager;
}

/**
 * Load languages from JSON file
 */
export function loadLanguagesFromFile(filePath: string): LanguageManager {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const config = JSON.parse(content) as LanguagesConfig;
    return initLanguages(config);
  } catch (error) {
    console.error('Failed to load languages config:', error);
    throw error;
  }
}

/**
 * Get global language manager
 */
export function getLanguageManager(): LanguageManager {
  if (!globalLanguageManager) {
    // Return default manager if not initialized
    return new LanguageManager({
      default: 'en',
      languages: [
        { code: 'en', label: 'English', nativeLabel: 'English' },
        { code: 'zh', label: 'Chinese', nativeLabel: '中文' }
      ]
    });
  }
  return globalLanguageManager;
}

/**
 * Get all supported languages
 */
export function getSupportedLanguages(): LanguageConfig[] {
  return getLanguageManager().getLanguages();
}

/**
 * Get language config
 */
export function getLanguageConfig(code: string): LanguageConfig | undefined {
  return getLanguageManager().getLanguage(code);
}

/**
 * Get default language
 */
export function getDefaultLanguage(): string {
  return getLanguageManager().getDefaultLanguage();
}

/**
 * Get CLI language code
 */
export function getCLILanguageCode(code: string): string {
  return getLanguageManager().getCLICode(code);
}
