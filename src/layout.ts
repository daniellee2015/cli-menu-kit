/**
 * Page Layout System
 * 通用页面布局：Header + Main Area + Footer
 */

import { menuAPI as menu, inputAPI as input } from './api.js';
import { renderSimpleHeader, renderSectionHeader } from './components/display/headers.js';

/**
 * Header 配置
 */
export interface HeaderConfig {
  type: 'simple' | 'section' | 'none';
  text?: string;
  width?: number;
}

/**
 * Main Area 配置
 */
export interface MainAreaConfig {
  type: 'menu' | 'display' | 'interactive';
  render: () => void | Promise<void>;
}

/**
 * Footer 配置
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
 * 完整页面布局配置
 */
export interface PageLayoutConfig {
  header?: HeaderConfig;
  mainArea: MainAreaConfig;
  footer?: FooterConfig;
}

/**
 * 渲染 Header
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
 * 渲染 Footer
 * 返回用户的选择/输入结果
 */
async function renderFooter(config?: FooterConfig): Promise<any> {
  if (!config) {
    return null;
  }

  let result: any = null;

  // 1. Menu (如果有)
  if (config.menu) {
    result = await menu.radio({
      options: config.menu.options,
      allowLetterKeys: config.menu.allowLetterKeys ?? true,
      allowNumberKeys: config.menu.allowNumberKeys ?? true,
      preserveOnSelect: true
    });
  }
  // 2. Input (如果有)
  else if (config.input) {
    result = await input.text({
      prompt: config.input.prompt,
      defaultValue: config.input.defaultValue,
      allowEmpty: config.input.allowEmpty ?? false
    });
  }

  // 3. Ask (如果有 - 通常在 Menu 或 Input 之后)
  if (config.ask) {
    const askResult = config.ask.horizontal
      ? await menu.booleanH(config.ask.question, config.ask.defaultValue ?? false)
      : await menu.booleanV(config.ask.question, config.ask.defaultValue ?? false);

    return { ...result, confirmed: askResult };
  }

  return result;
}

/**
 * 渲染完整页面
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
