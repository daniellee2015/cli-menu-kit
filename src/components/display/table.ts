/**
 * Table Component
 * Displays data in a table format with headers and rows
 */

import { writeLine } from '../../core/terminal.js';
import { colors } from '../../core/colors.js';

/**
 * Table column configuration
 */
export interface TableColumn {
  /** Column header */
  header: string;
  /** Column key in data object */
  key: string;
  /** Column width (optional, auto-calculated if not provided) */
  width?: number;
  /** Text alignment */
  align?: 'left' | 'center' | 'right';
}

/**
 * Table configuration
 */
export interface TableConfig {
  /** Table columns */
  columns: TableColumn[];
  /** Table data rows */
  data: Record<string, any>[];
  /** Show table borders */
  showBorders?: boolean;
  /** Show header separator */
  showHeaderSeparator?: boolean;
}

/**
 * Render table component
 * @param config - Table configuration
 */
export function renderTable(config: TableConfig): void {
  const { columns, data, showBorders = true, showHeaderSeparator = true } = config;

  if (columns.length === 0 || data.length === 0) {
    return;
  }

  // Calculate column widths
  const columnWidths = columns.map((col, index) => {
    if (col.width) return col.width;

    // Auto-calculate width based on header and data
    const headerWidth = col.header.length;
    const dataWidth = Math.max(
      ...data.map(row => String(row[col.key] || '').length)
    );
    return Math.max(headerWidth, dataWidth) + 2; // +2 for padding
  });

  // Render top border
  if (showBorders) {
    const border = columnWidths.map(w => '─'.repeat(w)).join('┬');
    writeLine(`┌${border}┐`);
  }

  // Render header
  const headerCells = columns.map((col, index) => {
    const width = columnWidths[index];
    const align = col.align || 'left';
    return alignText(col.header, width, align);
  });

  if (showBorders) {
    writeLine(`│${headerCells.join('│')}│`);
  } else {
    writeLine(headerCells.join(' '));
  }

  // Render header separator
  if (showHeaderSeparator) {
    if (showBorders) {
      const separator = columnWidths.map(w => '─'.repeat(w)).join('┼');
      writeLine(`├${separator}┤`);
    } else {
      const separator = columnWidths.map(w => '─'.repeat(w)).join(' ');
      writeLine(separator);
    }
  }

  // Render data rows
  data.forEach((row, rowIndex) => {
    const cells = columns.map((col, colIndex) => {
      const width = columnWidths[colIndex];
      const align = col.align || 'left';
      const value = String(row[col.key] || '');
      return alignText(value, width, align);
    });

    if (showBorders) {
      writeLine(`│${cells.join('│')}│`);
    } else {
      writeLine(cells.join(' '));
    }
  });

  // Render bottom border
  if (showBorders) {
    const border = columnWidths.map(w => '─'.repeat(w)).join('┴');
    writeLine(`└${border}┘`);
  }
}

/**
 * Align text within a given width
 */
function alignText(text: string, width: number, align: 'left' | 'center' | 'right'): string {
  const padding = width - text.length;

  if (padding <= 0) {
    return text.substring(0, width);
  }

  switch (align) {
    case 'center':
      const leftPad = Math.floor(padding / 2);
      const rightPad = padding - leftPad;
      return ' '.repeat(leftPad) + text + ' '.repeat(rightPad);
    case 'right':
      return ' '.repeat(padding) + text;
    case 'left':
    default:
      return text + ' '.repeat(padding);
  }
}

/**
 * Create table configuration (factory function)
 */
export function createTable(
  columns: TableColumn[],
  data: Record<string, any>[],
  options?: { showBorders?: boolean; showHeaderSeparator?: boolean }
): TableConfig {
  return {
    columns,
    data,
    showBorders: options?.showBorders ?? true,
    showHeaderSeparator: options?.showHeaderSeparator ?? true
  };
}
