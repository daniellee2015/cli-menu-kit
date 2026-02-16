/**
 * i18n types - Internationalization type definitions
 */

/**
 * Language code type
 */
export type LanguageCode = 'zh' | 'en';

/**
 * Translation map structure
 */
export interface LanguageMap {
  menus: {
    selectPrompt: string;
    multiSelectPrompt: string;
    confirmPrompt: string;
    selectedCount: string;
  };
  hints: {
    arrows: string;
    space: string;
    enter: string;
    numbers: string;
    letters: string;
    selectAll: string;
    invert: string;
    yesNo: string;
  };
  messages: {
    success: string;
    error: string;
    warning: string;
    info: string;
    question: string;
    goodbye: string;
    unknownCommand: string;
    helpPrompt: string;
  };
  inputs: {
    defaultValue: string;
    enterText: string;
    enterNumber: string;
    minLength: string;
    maxLength: string;
    minValue: string;
    maxValue: string;
    invalidInput: string;
    cannotBeEmpty: string;
  };
  commands: {
    quit: string;
    help: string;
    clear: string;
    back: string;
    availableCommands: string;
    defaultCommands: string;
    customCommands: string;
  };
}

/**
 * i18n registry interface
 */
export interface I18nRegistry {
  languages: Record<LanguageCode, LanguageMap>;
  current: LanguageCode;
}
