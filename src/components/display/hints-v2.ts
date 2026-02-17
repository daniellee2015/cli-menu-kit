/**
 * Hints Component - New Architecture Version
 * Returns string arrays and listens to HintManager
 */

import { Component, Rect, hintManager } from '../../layout.js';
import { colors } from '../../core/colors.js';

export function createHintsComponentV2(hints: string[]): Component {
  return {
    type: 'hints',
    regionId: 'footerHints',
    render: (rect: Rect): string[] => {
      // Join hints with separator
      const hintsText = hints.join(' • ');
      return [`${colors.dim}${hintsText}${colors.reset}`];
    }
  };
}

/**
 * Create a dynamic hints component that listens to HintManager
 */
export function createDynamicHintsComponent(): Component {
  return {
    type: 'hints',
    regionId: 'footerHints',
    render: (rect: Rect): string[] => {
      const currentHint = hintManager.current();
      return [currentHint ? `${colors.dim}${currentHint}${colors.reset}` : ''];
    }
  };
}
