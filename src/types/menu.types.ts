/**
 * Menu component types for CLI Menu Kit
 */

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

/**
 * Checkbox table menu configuration
 * Combines checkbox selection with table display
 */
export interface CheckboxTableMenuConfig extends BaseMenuConfig {
  /** Table columns definition */
  columns: Array<{
    header: string;
    key: string;
    width?: number;
    align?: 'left' | 'center' | 'right';
  }>;

  /** Data rows (each row is an object with column keys) */
  data: Record<string, any>[];

  /** Optional: Key to use as unique identifier (default: index) */
  idKey?: string;

  /** Default selected row indices or IDs */
  defaultSelected?: (number | string)[];

  /** Minimum selections required */
  minSelections?: number;

  /** Maximum selections allowed */
  maxSelections?: number;

  /** Allow select all */
  allowSelectAll?: boolean;

  /** Allow invert selection */
  allowInvert?: boolean;

  /** Show table borders (default: false for checkbox menu style) */
  showBorders?: boolean;

  /** Show header separator (default: true) */
  showHeaderSeparator?: boolean;

  /** Phase/group separators (for grouping rows) */
  separators?: Array<{
    /** Insert before this row index */
    beforeIndex: number;
    /** Separator label */
    label: string;
    /** Optional description shown below the separator */
    description?: string;
  }>;

  /** Separator label and description alignment (default: 'center') */
  separatorAlign?: 'left' | 'center' | 'right';

  /** Column width calculation mode */
  widthMode?: 'auto' | 'fixed';

  /** Checkbox column width (default: 4) */
  checkboxWidth?: number;
}

/**
 * Checkbox table menu result
 */
export interface CheckboxTableMenuResult {
  /** Selected row indices */
  indices: number[];

  /** Selected row data objects */
  rows: Record<string, any>[];

  /** Selected IDs (if idKey is provided) */
  ids?: (string | number)[];
}
