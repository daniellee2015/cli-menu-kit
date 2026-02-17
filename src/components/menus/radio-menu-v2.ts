/**
 * Radio Menu Component - New Architecture Version
 * Wraps the old showRadioMenu API to work with new architecture
 */

import { Component, Rect } from '../../layout.js';
import { showRadioMenu } from './radio-menu.js';
import type { RadioMenuConfig } from '../../types/menu.types.js';

export interface RadioMenuComponentConfig {
  menuConfig: RadioMenuConfig;
  onResult: (result: any) => Promise<void>;
}

export function createRadioMenuComponentV2(config: RadioMenuComponentConfig): Component {
  return {
    type: 'radio-menu',
    regionId: 'main',
    render: (rect: Rect): string[] => {
      // Return empty for initial render
      // The actual menu will be rendered in interact phase
      return [];
    },
    interact: async () => {
      // Use the old showRadioMenu API
      const result = await showRadioMenu(config.menuConfig);
      await config.onResult(result);
    },
    config
  };
}
