/**
 * Page Layout System - Simple Configuration API
 * Architecture: Header + Main Area + Footer
 *
 * This is the simple, configuration-based API that users want.
 * Just pass config objects, no need to create components manually.
 */

import { menuAPI as menu, inputAPI as input } from './api.js';
import { renderHeader as renderFullHeader, type HeaderConfig as FullHeaderConfig } from './components/display/header.js';
import { renderSimpleHeader, renderSectionHeader } from './components/display/headers.js';
import { renderHints } from './core/renderer.js';

/**
 * Header configuration
 */
export interface HeaderConfig {
  type: 'simple' | 'section' | 'full' | 'none';
  // For simple header
  text?: string;
  // For section header
  width?: number;
  // For full header (with ASCII art)
  asciiArt?: string[];
  title?: string;
  description?: string;
  version?: string;
  url?: string;
  menuTitle?: string;
}

/**
 * Main Area configuration
 */
export interface MainAreaConfig {
  type: 'menu' | 'display' | 'interactive';
  // For menu type
  menu?: {
    options: any[];
    allowLetterKeys?: boolean;
    allowNumberKeys?: boolean;
    preserveOnSelect?: boolean;
  };
  // For display/interactive type
  render?: () => void | Promise<void>;
}

/**
 * Footer configuration
 */
export interface FooterConfig {
  menu?: {
    options: any[];
    allowLetterKeys?: boolean;
    allowNumberKeys?: boolean;
    preserveOnSelect?: boolean;
  };
  ask?: {
    question: string;
    defaultValue?: boolean;
    horizontal?: boolean;
  };
  input?: {
    prompt: string;
    defaultValue?: string;
    allowEmpty?: boolean;
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
 * Render Header
 */
function renderHeaderSection(config?: HeaderConfig): void {
  if (!config || config.type === 'none') {
    return;
  }

  if (config.type === 'simple' && config.text) {
    renderSimpleHeader(config.text);
  } else if (config.type === 'section' && config.text) {
    // Add extra blank line before section header for spacing between menus
    console.log('');
    renderSectionHeader(config.text, config.width || 50);
  } else if (config.type === 'full') {
    // Render full header WITHOUT menuTitle
    renderFullHeader({
      asciiArt: config.asciiArt || [],
      title: config.title || '',
      description: config.description,
      version: config.version,
      url: config.url,
      menuTitle: undefined  // Don't render menuTitle in header
    });
  }
}

/**
 * Render Menu Title (separate from header)
 */
function renderMenuTitle(title?: string): void {
  if (title) {
    console.log('');
    console.log(`  ${title}`);
  }
}

/**
 * Render Main Area
 */
async function renderMainArea(config: MainAreaConfig, hints?: string[]): Promise<any> {
  if (config.type === 'menu' && config.menu) {
    // Menu in main area - pass hints from footer
    const result = await menu.radio({
      options: config.menu.options,
      allowLetterKeys: config.menu.allowLetterKeys ?? true,
      allowNumberKeys: config.menu.allowNumberKeys ?? true,
      preserveOnSelect: config.menu.preserveOnSelect ?? true
    }, hints);  // Pass hints as second parameter
    return result;
  } else if (config.render) {
    // Custom render function
    await config.render();
    return null;
  }
  return null;
}

/**
 * Render Footer
 */
async function renderFooterSection(config?: FooterConfig, hints?: string[]): Promise<any> {
  if (!config) {
    return null;
  }

  let result: any = null;

  // 1. Menu (if present)
  if (config.menu) {
    result = await menu.radio({
      options: config.menu.options,
      allowLetterKeys: config.menu.allowLetterKeys ?? true,
      allowNumberKeys: config.menu.allowNumberKeys ?? true,
      preserveOnSelect: config.menu.preserveOnSelect ?? true
    }, hints || config.hints);
  }
  // 2. Input (if present)
  else if (config.input) {
    result = await input.text({
      prompt: config.input.prompt,
      defaultValue: config.input.defaultValue,
      allowEmpty: config.input.allowEmpty ?? false
    });
  }
  // 3. Ask (if present)
  else if (config.ask) {
    const askResult = config.ask.horizontal
      ? await menu.booleanH(config.ask.question, config.ask.defaultValue ?? false)
      : await menu.booleanV(config.ask.question, config.ask.defaultValue ?? false);
    result = askResult;
  }

  return result;
}

/**
 * Render complete page with simple configuration API
 *
 * @example
 * ```typescript
 * const result = await renderPage({
 *   header: {
 *     type: 'full',
 *     asciiArt: ['...'],
 *     title: 'My App',
 *     description: 'Description',
 *     version: '1.0.0'
 *   },
 *   mainArea: {
 *     type: 'menu',
 *     menu: {
 *       options: ['Option 1', 'Option 2'],
 *       allowLetterKeys: true,
 *       allowNumberKeys: true
 *     }
 *   },
 *   footer: {
 *     hints: ['↑↓ Navigate', 'Enter Confirm']
 *   }
 * });
 * ```
 */
export async function renderPage(config: PageLayoutConfig): Promise<any> {
  // 1. Render Header (without menuTitle)
  renderHeaderSection(config.header);

  // 2. Render Menu Title (if provided)
  renderMenuTitle(config.header?.menuTitle);

  // 3. Determine where to render hints
  let mainResult: any = null;

  if (config.footer?.menu || config.footer?.ask || config.footer?.input) {
    // Footer has interactive element - render main area first, then footer with hints
    if (config.mainArea.type === 'menu' && config.mainArea.menu) {
      mainResult = await renderMainArea(config.mainArea, undefined);
    } else if (config.mainArea.render) {
      await config.mainArea.render();
      // Add newline after custom render to separate from footer menu
      // This ensures the escape codes from initTerminal don't interfere
      console.log('');
    }

    // Render footer with hints
    const footerResult = await renderFooterSection(config.footer, config.footer.hints);
    return footerResult || mainResult;
  } else {
    // Footer has no interactive element - render main area with hints from footer
    mainResult = await renderMainArea(config.mainArea, config.footer?.hints);
    return mainResult;
  }
}
