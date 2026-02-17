/**
 * Component Factories
 *
 * Factory functions to create common components
 * These are helper functions to simplify component creation
 *
 * NOTE: These are legacy factories that need to be updated to return string arrays
 * For now, they are kept for backward compatibility but will be deprecated
 */

import { Component, Rect } from './layout.js';
import { renderHeader as renderFullHeader } from './components/display/header.js';
import { renderSimpleHeader, renderSectionHeader } from './components/display/headers.js';
import { renderHints as renderHintsCore } from './core/renderer.js';
import { renderTable } from './components/display/table.js';
import { renderList } from './components/display/list.js';
import { renderSummaryTable } from './components/display/summary.js';
import { renderRadioMenuUI, waitForRadioMenuInput, RadioMenuState } from './components/menus/radio-menu-split.js';
import { createInputPromptComponent } from './components/display/input-prompt.js';
import type { HeaderConfig } from './components/display/header.js';
import type { TableConfig } from './components/display/table.js';
import type { ListConfig } from './components/display/list.js';
import type { SummaryTableConfig } from './types/display.types.js';
import type { RadioMenuConfig } from './types/menu.types.js';

/**
 * Create a full header component (with ASCII art)
 * LEGACY: Returns void, needs update to return string[]
 */
export function createFullHeaderComponent(config: HeaderConfig): any {
  return {
    type: 'full-header',
    regionId: 'header',
    render: () => renderFullHeader(config),
    config
  };
}

/**
 * Create a simple header component
 * LEGACY: Returns void, needs update to return string[]
 */
export function createSimpleHeaderComponent(text: string): any {
  return {
    type: 'simple-header',
    regionId: 'header',
    render: () => renderSimpleHeader(text),
    config: { text }
  };
}

/**
 * Create a section header component
 * LEGACY: Returns void, needs update to return string[]
 */
export function createSectionHeaderComponent(text: string, width?: number): any {
  return {
    type: 'section-header',
    regionId: 'header',
    render: () => renderSectionHeader(text, width || 50),
    config: { text, width }
  };
}

/**
 * Create a hints component
 * LEGACY: Returns void, needs update to return string[]
 */
export function createHintsComponent(hints: string[]): any {
  return {
    type: 'hints',
    regionId: 'footerHints',
    render: () => renderHintsCore(hints),
    config: { hints }
  };
}

/**
 * Create a table component
 * LEGACY: Returns void, needs update to return string[]
 */
export function createTableComponent(config: TableConfig): any {
  return {
    type: 'table',
    regionId: 'main',
    render: () => renderTable(config),
    config
  };
}

/**
 * Create a list component
 * LEGACY: Returns void, needs update to return string[]
 */
export function createListComponent(config: ListConfig): any {
  return {
    type: 'list',
    regionId: 'main',
    render: () => renderList(config),
    config
  };
}

/**
 * Create a summary table component
 * LEGACY: Returns void, needs update to return string[]
 */
export function createSummaryTableComponent(config: SummaryTableConfig): any {
  return {
    type: 'summary-table',
    regionId: 'main',
    render: () => renderSummaryTable(config),
    config
  };
}

/**
 * Export input prompt component creator
 */
export { createInputPromptComponent } from './components/display/input-prompt.js';

/**
 * Create an interactive menu component (radio menu)
 * Separates rendering and interaction for proper Page Layout integration
 * LEGACY: Needs update to use new architecture
 */
export function createRadioMenuComponent(
  config: RadioMenuConfig,
  onResult: (result: any) => void | Promise<void>
): any {
  let menuState: RadioMenuState | null = null;

  return {
    type: 'radio-menu',
    regionId: 'main',
    render: () => {
      // Render menu UI (non-blocking)
      menuState = renderRadioMenuUI(config);
    },
    interact: async () => {
      // Wait for user input (blocking)
      if (!menuState) {
        throw new Error('Menu must be rendered before interaction');
      }
      const result = await waitForRadioMenuInput(menuState);
      await onResult(result);
    },
    config
  };
}

// Export managers and utilities
export { screenManager, hintManager, computeLayout } from './layout.js';
export type { Layout, Rect } from './layout.js';

