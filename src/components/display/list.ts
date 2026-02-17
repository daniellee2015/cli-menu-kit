/**
 * List Component
 * Displays items in a list format with optional bullets/numbers
 */

import { writeLine } from '../../core/terminal.js';
import { colors } from '../../core/colors.js';

/**
 * List item configuration
 */
export interface ListItem {
  /** Item text */
  text: string;
  /** Item indent level (0 = no indent) */
  indent?: number;
  /** Custom bullet/prefix */
  bullet?: string;
}

/**
 * List configuration
 */
export interface ListConfig {
  /** List items */
  items: (string | ListItem)[];
  /** List style */
  style?: 'bullet' | 'number' | 'none';
  /** Custom bullet character (for bullet style) */
  bulletChar?: string;
  /** Indent size in spaces */
  indentSize?: number;
}

/**
 * Render list component
 * @param config - List configuration
 */
export function renderList(config: ListConfig): void {
  const {
    items,
    style = 'bullet',
    bulletChar = '•',
    indentSize = 2
  } = config;

  if (items.length === 0) {
    return;
  }

  items.forEach((item, index) => {
    let text: string;
    let indent: number;
    let bullet: string | undefined;

    // Parse item
    if (typeof item === 'string') {
      text = item;
      indent = 0;
      bullet = undefined;
    } else {
      text = item.text;
      indent = item.indent || 0;
      bullet = item.bullet;
    }

    // Generate prefix based on style
    let prefix: string;
    if (bullet) {
      // Custom bullet
      prefix = bullet;
    } else {
      switch (style) {
        case 'number':
          prefix = `${index + 1}.`;
          break;
        case 'bullet':
          prefix = bulletChar;
          break;
        case 'none':
        default:
          prefix = '';
          break;
      }
    }

    // Build line with indent and prefix
    const indentStr = ' '.repeat(indent * indentSize);
    const line = prefix
      ? `${indentStr}${prefix} ${text}`
      : `${indentStr}${text}`;

    writeLine(line);
  });
}

/**
 * Create list configuration (factory function)
 */
export function createList(
  items: (string | ListItem)[],
  options?: {
    style?: 'bullet' | 'number' | 'none';
    bulletChar?: string;
    indentSize?: number;
  }
): ListConfig {
  return {
    items,
    style: options?.style ?? 'bullet',
    bulletChar: options?.bulletChar ?? '•',
    indentSize: options?.indentSize ?? 2
  };
}

/**
 * Create a simple bullet list
 */
export function createBulletList(items: string[]): ListConfig {
  return createList(items, { style: 'bullet' });
}

/**
 * Create a numbered list
 */
export function createNumberedList(items: string[]): ListConfig {
  return createList(items, { style: 'number' });
}
