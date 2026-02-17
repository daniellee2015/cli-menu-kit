/**
 * Input Prompt Component
 * Displays the current input prompt with selected value
 */

import { Component, Rect, hintManager } from '../../layout.js';

export interface InputPromptConfig {
  /** Prompt text to display */
  prompt: string;
  /** Region ID for screen management */
  regionId: string;
}

/**
 * Create an input prompt component
 */
export function createInputPromptComponent(config: InputPromptConfig): Component {
  return {
    type: 'prompt',
    regionId: config.regionId,
    render: (rect: Rect) => {
      return [config.prompt];
    },
    config
  };
}
