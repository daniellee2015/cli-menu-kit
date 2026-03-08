/**
 * Hints Component
 * Displays operation hints at the bottom of the page
 */

import { renderHints as renderHintsCore } from '../../core/renderer.js';
import { t } from '../../i18n/registry.js';

/**
 * Hints configuration
 */
export interface HintsConfig {
  hints: string[];
}

/**
 * Standard hint types
 */
export const HintTypes = {
  /** Arrow keys navigation */
  ARROWS: () => t('hints.arrows'),
  /** Number keys selection */
  NUMBERS: () => t('hints.numbers'),
  /** Letter keys selection */
  LETTERS: () => t('hints.letters'),
  /** Space key toggle */
  SPACE: () => t('hints.space'),
  /** Enter key confirm */
  ENTER: () => t('hints.enter'),
  /** Escape key cancel */
  ESC: () => 'Esc Cancel',
  /** Select all */
  SELECT_ALL: () => t('hints.selectAll'),
  /** Invert selection */
  INVERT: () => t('hints.invert')
} as const;

/**
 * Generate hints for menu interactions
 */
export function generateMenuHints(options: {
  hasMultipleOptions?: boolean;
  allowNumberKeys?: boolean;
  allowLetterKeys?: boolean;
  allowSelectAll?: boolean;
  allowInvert?: boolean;
}): string[] {
  const hints: string[] = [];

  if (options.hasMultipleOptions) {
    hints.push(HintTypes.ARROWS());
  }

  if (options.allowNumberKeys) {
    hints.push(HintTypes.NUMBERS());
  }

  if (options.allowLetterKeys) {
    hints.push(HintTypes.LETTERS());
  }

  if (options.allowSelectAll) {
    hints.push(HintTypes.SELECT_ALL());
  }

  if (options.allowInvert) {
    hints.push(HintTypes.INVERT());
  }

  hints.push(HintTypes.ENTER());

  return hints;
}

/**
 * Generate hints for input interactions
 */
export function generateInputHints(): string[] {
  return [HintTypes.ENTER(), HintTypes.ESC()];
}

/**
 * Render hints component
 * @param config - Hints configuration
 */
export function renderHintsComponent(config: HintsConfig): void {
  if (!config.hints || config.hints.length === 0) {
    return;
  }

  renderHintsCore(config.hints);
}

/**
 * Create hints component (factory function)
 * @param hints - Array of hint strings
 * @returns Hints configuration
 */
export function createHints(hints: string[]): HintsConfig {
  return { hints };
}
