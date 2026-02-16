/**
 * Layout system types for CLI Menu Kit
 * Defines how components are composed and rendered
 */

/**
 * Layout element types that can be arranged
 */
export type LayoutElement = 'header' | 'options' | 'input' | 'hints' | 'progress';

/**
 * Visibility configuration for layout elements
 */
export interface LayoutVisibility {
  header?: boolean;
  input?: boolean;
  hints?: boolean;
  progress?: boolean;
}

/**
 * Spacing configuration for layout elements
 * Values represent number of blank lines
 */
export interface LayoutSpacing {
  beforeHeader?: number;
  afterHeader?: number;
  beforeOptions?: number;
  afterOptions?: number;
  beforeInput?: number;
  afterInput?: number;
  beforeHints?: number;
  beforeProgress?: number;
  afterProgress?: number;
}

/**
 * Complete menu layout configuration
 */
export interface MenuLayout {
  /** Order in which elements are rendered */
  order: LayoutElement[];

  /** Which elements are visible */
  visible: LayoutVisibility;

  /** Spacing between elements */
  spacing?: LayoutSpacing;
}

/**
 * Preset layout configurations
 */
export const LAYOUT_PRESETS = {
  /** Main menu with header */
  MAIN_MENU: {
    order: ['header', 'options', 'input', 'hints'],
    visible: { header: true, input: true, hints: true },
    spacing: { afterHeader: 1, afterOptions: 1, beforeHints: 1 }
  } as MenuLayout,

  /** Sub menu without header */
  SUB_MENU: {
    order: ['options', 'input', 'hints'],
    visible: { header: false, input: true, hints: true },
    spacing: { afterOptions: 1, beforeHints: 1 }
  } as MenuLayout,

  /** Wizard step with progress indicator */
  WIZARD_STEP: {
    order: ['header', 'progress', 'options', 'input', 'hints'],
    visible: { header: true, progress: true, input: true, hints: true },
    spacing: { afterHeader: 1, afterProgress: 1, afterOptions: 1, beforeHints: 1 }
  } as MenuLayout,

  /** Minimal layout (options only) */
  MINIMAL: {
    order: ['options'],
    visible: { header: false, input: false, hints: false },
    spacing: {}
  } as MenuLayout
};
