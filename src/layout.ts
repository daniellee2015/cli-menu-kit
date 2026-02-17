/**
 * Page Layout System
 * Universal page layout: Header + Main Area + Footer
 */

import { menuAPI as menu, inputAPI as input } from './api.js';
import { renderSimpleHeader, renderSectionHeader } from './components/display/headers.js';
import { renderHints } from './core/renderer.js';

/**
 * Header configuration
 */
export interface HeaderConfig {
  type: 'simple' | 'section' | 'none';
  text?: string;
  width?: number;
}

/**
 * Main Area configuration
 */
export interface MainAreaConfig {
  type: 'menu' | 'display' | 'interactive';
  render: () => void | Promise<void>;
}

/**
 * Footer configuration
 */
export interface FooterConfig {
  menu?: {
    options: string[];
    allowLetterKeys?: boolean;
    allowNumberKeys?: boolean;
  };
  input?: {
    prompt: string;
    defaultValue?: string;
    allowEmpty?: boolean;
  };
  ask?: {
    question: string;
    defaultValue?: boolean;
    horizontal?: boolean;
  };
  hints?: string[];
}

/**
 * Complete page layout configuration
 */
export interface PageLayoutConfig {
  header?: HeaderConfig;
  mainArea: MainAreaConfig;
  footer?: FooterConfig;
}

/**
 * Render header
 */
function renderHeader(config?: HeaderConfig): void {
  if (!config || config.type === 'none') {
    return;
  }

  if (config.type === 'simple' && config.text) {
    renderSimpleHeader(config.text);
  } else if (config.type === 'section' && config.text) {
    renderSectionHeader(config.text, config.width || 50);
  }
}

/**
 * Render footer
 * Returns user's selection/input result
 */
async function renderFooter(config?: FooterConfig): Promise<any> {
  if (!config) {
    return null;
  }

  let result: any = null;

  // 1. Menu (if present)
  if (config.menu) {
    // Render hints before menu interaction
    if (config.hints && config.hints.length > 0) {
      renderHints(config.hints);
    }

    result = await menu.radio({
      options: config.menu.options,
      allowLetterKeys: config.menu.allowLetterKeys ?? true,
      allowNumberKeys: config.menu.allowNumberKeys ?? true,
      preserveOnSelect: true
    });
  }
  // 2. Input (if present)
  else if (config.input) {
    // Render hints before input interaction
    if (config.hints && config.hints.length > 0) {
      renderHints(config.hints);
    }

    result = await input.text({
      prompt: config.input.prompt,
      defaultValue: config.input.defaultValue,
      allowEmpty: config.input.allowEmpty ?? false
    });
  }

  // 3. Ask (if present - usually after Menu or Input)
  if (config.ask) {
    const askResult = config.ask.horizontal
      ? await menu.booleanH(config.ask.question, config.ask.defaultValue ?? false)
      : await menu.booleanV(config.ask.question, config.ask.defaultValue ?? false);

    return { ...result, confirmed: askResult };
  }

  return result;
}

/**
 * Render complete page
 *
 * @example
 * ```typescript
 * const result = await renderPage({
 *   header: { type: 'simple', text: 'My Page' },
 *   mainArea: {
 *     type: 'display',
 *     render: () => console.log('Content')
 *   },
 *   footer: {
 *     menu: { options: ['1. Save', 'b. Back'] },
 *     hints: ['↑↓ Navigate  Enter Confirm']
 *   }
 * });
 * ```
 */
export async function renderPage(config: PageLayoutConfig): Promise<any> {
  // 1. Render Header
  renderHeader(config.header);

  // 2. Render Main Area
  await config.mainArea.render();

  // 3. Render Footer
  const footerResult = await renderFooter(config.footer);

  return footerResult;
}
