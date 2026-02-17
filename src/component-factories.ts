/**
 * Component Factories
 *
 * Factory functions to create common components
 * These are helper functions to simplify component creation
 */

import { Component } from './layout.js';
import { renderHeader as renderFullHeader } from './components/display/header.js';
import { renderSimpleHeader, renderSectionHeader } from './components/display/headers.js';
import { renderHints as renderHintsCore } from './core/renderer.js';
import { renderTable } from './components/display/table.js';
import { renderList } from './components/display/list.js';
import { renderSummaryTable } from './components/display/summary.js';
import type { HeaderConfig } from './components/display/header.js';
import type { TableConfig } from './components/display/table.js';
import type { ListConfig } from './components/display/list.js';
import type { SummaryTableConfig } from './types/display.types.js';

/**
 * Create a full header component (with ASCII art)
 */
export function createFullHeaderComponent(config: HeaderConfig): Component {
  return {
    type: 'full-header',
    render: () => renderFullHeader(config),
    config
  };
}

/**
 * Create a simple header component
 */
export function createSimpleHeaderComponent(text: string): Component {
  return {
    type: 'simple-header',
    render: () => renderSimpleHeader(text),
    config: { text }
  };
}

/**
 * Create a section header component
 */
export function createSectionHeaderComponent(text: string, width?: number): Component {
  return {
    type: 'section-header',
    render: () => renderSectionHeader(text, width || 50),
    config: { text, width }
  };
}

/**
 * Create a hints component
 */
export function createHintsComponent(hints: string[]): Component {
  return {
    type: 'hints',
    render: () => renderHintsCore(hints),
    config: { hints }
  };
}

/**
 * Create a table component
 */
export function createTableComponent(config: TableConfig): Component {
  return {
    type: 'table',
    render: () => renderTable(config),
    config
  };
}

/**
 * Create a list component
 */
export function createListComponent(config: ListConfig): Component {
  return {
    type: 'list',
    render: () => renderList(config),
    config
  };
}

/**
 * Create a summary table component
 */
export function createSummaryTableComponent(config: SummaryTableConfig): Component {
  return {
    type: 'summary-table',
    render: () => renderSummaryTable(config),
    config
  };
}

/**
 * Create a custom component with a render function
 */
export function createCustomComponent(
  type: string,
  render: () => void | Promise<void>
): Component {
  return {
    type,
    render
  };
}
