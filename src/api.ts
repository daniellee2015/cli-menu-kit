/**
 * Unified API - Main entry point for CLI Menu Kit
 * Provides a simple, consistent API for all components
 */

import { showRadioMenu } from './components/menus/radio-menu.js';
import { showCheckboxMenu } from './components/menus/checkbox-menu.js';
import { showBooleanMenu } from './components/menus/boolean-menu.js';
import { showTextInput } from './components/inputs/text-input.js';
import { showNumberInput } from './components/inputs/number-input.js';
import { showLanguageSelector } from './components/inputs/language-input.js';
import { showModifyField } from './components/inputs/modify-field.js';
import { runWizard, WizardConfig, WizardResult } from './features/wizard.js';
import {
  RadioMenuConfig,
  CheckboxMenuConfig,
  BooleanMenuConfig,
  RadioMenuResult,
  CheckboxMenuResult,
  BooleanMenuResult
} from './types/menu.types.js';
import {
  TextInputConfig,
  NumberInputConfig,
  LanguageSelectorConfig,
  ModifyFieldConfig,
  TextInputResult,
  NumberInputResult,
  LanguageSelectorResult,
  ModifyFieldResult
} from './types/input.types.js';

/**
 * Unified menu API
 */
export const menuAPI = {
  /**
   * Show a radio menu (single-select)
   * @param config - Menu configuration
   * @returns Promise resolving to selected option
   */
  radio: (config: RadioMenuConfig): Promise<RadioMenuResult> => {
    return showRadioMenu(config);
  },

  /**
   * Show a checkbox menu (multi-select)
   * @param config - Menu configuration
   * @returns Promise resolving to selected options
   */
  checkbox: (config: CheckboxMenuConfig): Promise<CheckboxMenuResult> => {
    return showCheckboxMenu(config);
  },

  /**
   * Show a boolean menu (yes/no)
   * @param config - Menu configuration
   * @returns Promise resolving to boolean result
   */
  boolean: (config: BooleanMenuConfig): Promise<BooleanMenuResult> => {
    return showBooleanMenu(config);
  },

  /**
   * Show a boolean menu (horizontal)
   * @param question - Question text
   * @param defaultValue - Default value
   * @returns Promise resolving to boolean result
   */
  booleanH: (question: string, defaultValue?: boolean): Promise<boolean> => {
    return showBooleanMenu({
      question,
      orientation: 'horizontal',
      defaultValue
    });
  },

  /**
   * Show a boolean menu (vertical)
   * @param question - Question text
   * @param defaultValue - Default value
   * @returns Promise resolving to boolean result
   */
  booleanV: (question: string, defaultValue?: boolean): Promise<boolean> => {
    return showBooleanMenu({
      question,
      orientation: 'vertical',
      defaultValue
    });
  }
};

/**
 * Unified input API
 */
export const inputAPI = {
  /**
   * Show a text input
   * @param config - Input configuration
   * @returns Promise resolving to entered text
   */
  text: (config: TextInputConfig): Promise<TextInputResult> => {
    return showTextInput(config);
  },

  /**
   * Show a number input
   * @param config - Input configuration
   * @returns Promise resolving to entered number
   */
  number: (config: NumberInputConfig): Promise<NumberInputResult> => {
    return showNumberInput(config);
  },

  /**
   * Show a language selector
   * @param config - Selector configuration
   * @returns Promise resolving to selected language code
   */
  language: (config: LanguageSelectorConfig): Promise<LanguageSelectorResult> => {
    return showLanguageSelector(config);
  },

  /**
   * Show a modify field prompt
   * @param config - Field configuration
   * @returns Promise resolving to modification result
   */
  modifyField: (config: ModifyFieldConfig): Promise<ModifyFieldResult> => {
    return showModifyField(config);
  }
};

/**
 * Unified wizard API
 */
export const wizardAPI = {
  /**
   * Run a wizard
   * @param config - Wizard configuration
   * @returns Promise resolving to wizard results
   */
  run: (config: WizardConfig): Promise<WizardResult> => {
    return runWizard(config);
  }
};

/**
 * Default export with all APIs
 */
export default {
  menu: menuAPI,
  input: inputAPI,
  wizard: wizardAPI
};
