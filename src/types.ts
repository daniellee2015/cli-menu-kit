/**
 * CLI Menu Kit - Type Definitions
 */

export interface MenuOption {
  label: string;
  value?: any;
}

export type MenuType = 'main' | 'sub' | 'firstRun';

export type HintKey = 'arrows' | 'number' | 'letter' | 'enter' | 'esc' | 'space' | 'all' | 'invert';

export interface MenuConfig {
  lang?: 'zh' | 'en';
  type?: MenuType;
  title?: string;           // Menu header title
  prompt?: string;          // Prompt message between options and hints
  showHints?: boolean;      // Whether to show operation hints (default: true)
}

export interface MultiSelectConfig {
  lang?: 'zh' | 'en';
  defaultSelected?: number[];
}

export interface Colors {
  reset: string;
  red: string;
  green: string;
  yellow: string;
  blue: string;
  cyan: string;
  gray: string;
}

export interface Theme {
  primary: string;
  success: string;
  warning: string;
  error: string;
  muted: string;
  active: string;
  title: string;
}

export interface Symbol {
  icon: string;
  color: string;
}

export interface Symbols {
  success: Symbol;
  error: Symbol;
  warning: Symbol;
  info: Symbol;
}
