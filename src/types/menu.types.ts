/**
 * Menu component types for CLI Menu Kit
 */

import { MenuLayout } from './layout.types.js';

/**
 * Menu option (can be string, object with label, or section header)
 */
export type MenuOption =
  | string
  | { label: string; value?: string }
  | { type: 'separator'; label?: string };

/**
 * Base menu configuration
 */
export interface BaseMenuConfig {
  /** Menu title/header */
  title?: string;

  /** Input prompt text */
  prompt?: string;

  /** Hint texts to display */
  hints?: string[];

  /** Layout configuration */
  layout?: MenuLayout;

  /** Color for highlighted items */
  highlightColor?: string;

  /** Goodbye message function */
  onExit?: () => void;

  /** Separator width for section labels (default: 30) */
  separatorWidth?: number;

  /** Keep menu rendered after selection instead of clearing (default: false) */
  preserveOnSelect?: boolean;
}

/**
 * Radio menu (single-select) configuration
 */
export interface RadioMenuConfig extends BaseMenuConfig {
  /** Menu options */
  options: MenuOption[];

  /** Default selected index */
  defaultIndex?: number;

  /** Allow number key selection */
  allowNumberKeys?: boolean;

  /** Allow letter key selection */
  allowLetterKeys?: boolean;
}

/**
 * Checkbox menu (multi-select) configuration
 */
export interface CheckboxMenuConfig extends BaseMenuConfig {
  /** Menu options */
  options: MenuOption[];

  /** Default selected indices */
  defaultSelected?: number[];

  /** Minimum selections required */
  minSelections?: number;

  /** Maximum selections allowed */
  maxSelections?: number;

  /** Allow select all */
  allowSelectAll?: boolean;

  /** Allow invert selection */
  allowInvert?: boolean;
}

/**
 * Boolean menu configuration
 */
export interface BooleanMenuConfig extends BaseMenuConfig {
  /** Question text */
  question: string;

  /** Default value */
  defaultValue?: boolean;

  /** Yes text */
  yesText?: string;

  /** No text */
  noText?: string;

  /** Orientation */
  orientation?: 'horizontal' | 'vertical';
}

/**
 * Menu result types
 */
export interface RadioMenuResult {
  index: number;
  value: string;
}

export interface CheckboxMenuResult {
  indices: number[];
  values: string[];
}

export type BooleanMenuResult = boolean;
