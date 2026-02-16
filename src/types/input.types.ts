/**
 * Input component types for CLI Menu Kit
 */

/**
 * Base input configuration
 */
export interface BaseInputConfig {
  /** Input prompt text */
  prompt: string;

  /** Default value */
  defaultValue?: string;

  /** Validation function */
  validate?: (value: string) => boolean | string;

  /** Error message for validation failure */
  errorMessage?: string;

  /** Goodbye message function */
  onExit?: () => void;
}

/**
 * Text input configuration
 */
export interface TextInputConfig extends BaseInputConfig {
  /** Placeholder text */
  placeholder?: string;

  /** Maximum length */
  maxLength?: number;

  /** Minimum length */
  minLength?: number;

  /** Allow empty input */
  allowEmpty?: boolean;
}

/**
 * Number input configuration
 */
export interface NumberInputConfig extends BaseInputConfig {
  /** Minimum value */
  min?: number;

  /** Maximum value */
  max?: number;

  /** Allow decimals */
  allowDecimals?: boolean;

  /** Allow negative numbers */
  allowNegative?: boolean;
}

/**
 * Language selector configuration
 */
export interface LanguageSelectorConfig {
  /** Available languages */
  languages: Array<{
    code: string;
    name: string;
    nativeName?: string;
  }>;

  /** Default language code */
  defaultLanguage?: string;

  /** Prompt text */
  prompt?: string;

  /** Goodbye message function */
  onExit?: () => void;
}

/**
 * Modify field configuration
 */
export interface ModifyFieldConfig {
  /** Field name */
  fieldName: string;

  /** Current value */
  currentValue: string;

  /** Prompt for modification */
  modifyPrompt?: string;

  /** Prompt for new value */
  newValuePrompt?: string;

  /** Validation function */
  validate?: (value: string) => boolean | string;

  /** Goodbye message function */
  onExit?: () => void;
}

/**
 * Input result types
 */
export type TextInputResult = string;
export type NumberInputResult = number;
export type LanguageSelectorResult = string;

export interface ModifyFieldResult {
  modified: boolean;
  value: string;
}
