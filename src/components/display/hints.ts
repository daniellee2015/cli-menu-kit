/**
 * Hints Component
 * Displays operation hints at the bottom of the page
 */

import { renderHints as renderHintsCore } from '../../core/renderer.js';

/**
 * Hints configuration
 */
export interface HintsConfig {
  hints: string[];
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
