/**
 * CheckboxTableMenu - Multi-select menu with table display
 * Combines checkbox selection with formatted table layout
 */

import { CheckboxTableMenuConfig, CheckboxTableMenuResult } from '../../types/menu.types.js';
import { initTerminal, restoreTerminal, clearMenu, TerminalState } from '../../core/terminal.js';
import { KEY_CODES, isEnter, isCtrlC, isSpace } from '../../core/keyboard.js';
import { renderBlankLines, renderSectionLabel, renderHints, padText } from '../../core/renderer.js';
import { colors } from '../../core/colors.js';
import { t } from '../../i18n/registry.js';

/**
 * Calculate column widths based on content
 */
function calculateColumnWidths(
  columns: CheckboxTableMenuConfig['columns'],
  data: Record<string, any>[],
  mode: 'auto' | 'fixed'
): number[] {
  return columns.map((col) => {
    // Use specified width if provided
    if (col.width) return col.width;

    if (mode === 'fixed') {
      // Use default width for fixed mode
      return 20;
    }

    // Auto-calculate based on header and data
    const headerWidth = col.header.length;
    const dataWidth = Math.max(
      ...data.map(row => String(row[col.key] || '').length),
      0
    );
    // Add padding and set reasonable limits
    return Math.min(Math.max(headerWidth, dataWidth) + 2, 50);
  });
}

/**
 * Build options array with separators inserted
 */
function buildOptionsWithSeparators(
  data: Record<string, any>[],
  separators?: Array<{ beforeIndex: number; label: string; description?: string }>
): Array<{ type: 'data' | 'separator'; data?: any; label?: string; description?: string; originalIndex?: number }> {
  const result: Array<{ type: 'data' | 'separator'; data?: any; label?: string; description?: string; originalIndex?: number }> = [];
  const sortedSeparators = (separators || []).sort((a, b) => a.beforeIndex - b.beforeIndex);

  let sepIndex = 0;
  for (let i = 0; i < data.length; i++) {
    // Insert separator if needed
    while (sepIndex < sortedSeparators.length && sortedSeparators[sepIndex].beforeIndex === i) {
      result.push({
        type: 'separator',
        label: sortedSeparators[sepIndex].label,
        description: sortedSeparators[sepIndex].description
      });
      sepIndex++;
    }

    // Add data row
    result.push({
      type: 'data',
      data: data[i],
      originalIndex: i
    });
  }

  return result;
}

/**
 * Render table header
 */
function renderTableHeader(
  columns: CheckboxTableMenuConfig['columns'],
  columnWidths: number[],
  checkboxWidth: number,
  showHeaderSeparator: boolean
): number {
  let lineCount = 0;

  // Header row
  let headerLine = ''.padEnd(checkboxWidth); // Space for checkbox column
  columns.forEach((col, index) => {
    const width = columnWidths[index];
    const align = col.align || 'left';
    const paddedHeader = padText(col.header, width, align);
    headerLine += `${colors.cyan}${colors.bold}${paddedHeader}${colors.reset}`;
  });
  process.stdout.write(`  ${headerLine}\n`);
  lineCount++;

  // Separator line
  if (showHeaderSeparator) {
    const totalWidth = checkboxWidth + columnWidths.reduce((sum, w) => sum + w, 0);
    process.stdout.write(`  ${colors.dim}${'─'.repeat(totalWidth)}${colors.reset}\n`);
    lineCount++;
  }

  // Blank line after header
  renderBlankLines(1);
  lineCount++;

  return lineCount;
}

/**
 * Render a table row with checkbox
 */
function renderTableRow(
  rowData: Record<string, any>,
  columns: CheckboxTableMenuConfig['columns'],
  columnWidths: number[],
  isSelected: boolean,
  isHighlighted: boolean,
  checkboxWidth: number
): void {
  let line = '';

  // Cursor indicator with background for highlighted row
  if (isHighlighted) {
    line += `${colors.cyan}${colors.bold}❯ ${colors.reset}`;
  } else {
    line += '  ';
  }

  // Checkbox
  line += isSelected
    ? `${colors.green}◉${colors.reset} `
    : `${colors.dim}○${colors.reset} `;

  // Table cells with background for highlighted row
  columns.forEach((col, colIndex) => {
    const value = String(rowData[col.key] || '');
    const width = columnWidths[colIndex];
    const align = col.align || 'left';

    // Truncate if too long
    const truncated = value.length > width ? value.substring(0, width - 3) + '...' : value;
    const paddedValue = padText(truncated, width, align);

    // Apply color and background based on state
    if (isHighlighted) {
      // Highlighted row: cyan text with reverse video (background)
      line += `${colors.cyan}${colors.bold}\x1b[7m${paddedValue}\x1b[27m${colors.reset}`;
    } else if (isSelected) {
      // Selected but not highlighted: normal text
      line += `${colors.reset}${paddedValue}${colors.reset}`;
    } else {
      // Not selected: dim text
      line += `${colors.dim}${paddedValue}${colors.reset}`;
    }
  });

  process.stdout.write(line + '\n');
}

/**
 * Show a checkbox table menu (multi-select with table display)
 * @param config - Menu configuration
 * @param hints - Optional hints to display at the bottom (for Page Layout use)
 * @returns Promise resolving to selected rows
 */
export async function showCheckboxTableMenu(
  config: CheckboxTableMenuConfig,
  hints?: string[]
): Promise<CheckboxTableMenuResult> {
  const {
    columns,
    data,
    idKey,
    defaultSelected = [],
    minSelections = 0,
    maxSelections,
    allowSelectAll = true,
    allowInvert = true,
    showBorders = false,
    showHeaderSeparator = true,
    separators,
    separatorAlign = 'center',
    widthMode = 'fixed',
    checkboxWidth = 4,
    title,
    prompt,
    separatorWidth = 30,
    onExit,
    preserveOnSelect = false
  } = config;

  // Validate data
  if (!data || data.length === 0) {
    throw new Error('CheckboxTableMenu requires at least one data row');
  }
  if (!columns || columns.length === 0) {
    throw new Error('CheckboxTableMenu requires at least one column');
  }

  // Calculate column widths
  const columnWidths = calculateColumnWidths(columns, data, widthMode);

  // Calculate total table width for separators
  const totalTableWidth = checkboxWidth + columnWidths.reduce((sum, w) => sum + w, 0);

  // Build options with separators
  const optionsWithSeparators = buildOptionsWithSeparators(data, separators);

  // Initialize state
  let cursorIndex = 0;
  const selected = new Set<number>();

  // Map default selected (can be indices or IDs)
  defaultSelected.forEach(item => {
    if (typeof item === 'number') {
      selected.add(item);
    } else if (idKey) {
      const index = data.findIndex(row => row[idKey] === item);
      if (index >= 0) selected.add(index);
    }
  });

  const state = initTerminal(); // Use normal mode (inline rendering)

  // Get selectable indices (skip separators)
  const selectableIndices: number[] = [];
  optionsWithSeparators.forEach((item, index) => {
    if (item.type === 'data') {
      selectableIndices.push(index);
    }
  });

  // Ensure cursorIndex points to a selectable option
  if (!selectableIndices.includes(cursorIndex)) {
    cursorIndex = selectableIndices[0] || 0;
  }

  // Helper function to get next/previous selectable index
  const getNextSelectableIndex = (currentIndex: number, direction: 'up' | 'down'): number => {
    let nextIndex = currentIndex;
    const maxAttempts = optionsWithSeparators.length;
    let attempts = 0;

    do {
      if (direction === 'up') {
        nextIndex = nextIndex > 0 ? nextIndex - 1 : optionsWithSeparators.length - 1;
      } else {
        nextIndex = nextIndex < optionsWithSeparators.length - 1 ? nextIndex + 1 : 0;
      }
      attempts++;
    } while (!selectableIndices.includes(nextIndex) && attempts < maxAttempts);

    return selectableIndices.includes(nextIndex) ? nextIndex : currentIndex;
  };

  // Render function with virtual scrolling
  const render = () => {
    // Clear previous render
    if (state.renderedLines > 0) {
      clearMenu(state);
    }
    let lineCount = 0;

    // Render title if provided
    if (title) {
      renderBlankLines(1);
      lineCount++;
    }

    // Render prompt if provided
    if (prompt) {
      process.stdout.write(`  ${colors.dim}${prompt}${colors.reset}\n`);
      lineCount++;
      renderBlankLines(1);
      lineCount++;
    }

    // Render table header
    lineCount += renderTableHeader(columns, columnWidths, checkboxWidth, showHeaderSeparator);

    // Virtual scrolling: calculate visible range with stable height
    const TARGET_LINES = 30; // Target line count for stable height
    const totalItems = optionsWithSeparators.length;

    let visibleStart = 0;
    let visibleEnd = totalItems;

    // Calculate line count for each item (consistent count for window calculation)
    const getItemLineCount = (index: number): number => {
      const item = optionsWithSeparators[index];
      if (item.type === 'separator') {
        let lines = 1; // title line
        if (index > 0) lines++; // blank line before (except very first item)
        if (item.description) lines++; // description line
        return lines;
      }
      return 1; // data row
    };

    // Only apply virtual scrolling if content would exceed reasonable height
    const estimatedTotalLines = optionsWithSeparators.reduce((sum, item, idx) => {
      return sum + getItemLineCount(idx);
    }, 0);

    if (estimatedTotalLines > TARGET_LINES) {
      // Line-based window: maintain constant line count
      let currentLines = getItemLineCount(cursorIndex);
      visibleStart = cursorIndex;
      visibleEnd = cursorIndex + 1;

      // Expand downward first (until we reach target or end)
      while (visibleEnd < totalItems && currentLines < TARGET_LINES) {
        const nextLines = getItemLineCount(visibleEnd);
        if (currentLines + nextLines <= TARGET_LINES) {
          currentLines += nextLines;
          visibleEnd++;
        } else {
          break;
        }
      }

      // Then expand upward (fill remaining space)
      while (visibleStart > 0 && currentLines < TARGET_LINES) {
        const prevLines = getItemLineCount(visibleStart - 1);
        if (currentLines + prevLines <= TARGET_LINES) {
          visibleStart--;
          currentLines += prevLines;
        } else {
          break;
        }
      }

      // If we still have space and can't expand upward, try expanding downward more
      while (visibleEnd < totalItems && currentLines < TARGET_LINES) {
        const nextLines = getItemLineCount(visibleEnd);
        if (currentLines + nextLines <= TARGET_LINES) {
          currentLines += nextLines;
          visibleEnd++;
        } else {
          break;
        }
      }
    }

    // Render visible options
    for (let index = visibleStart; index < visibleEnd; index++) {
      const item = optionsWithSeparators[index];

      if (item.type === 'separator') {
        // Add blank line before separator (except for the first visible one)
        if (index > visibleStart) {
          renderBlankLines(1);
          lineCount++;
        }
        // Render separator with configured alignment
        renderSectionLabel(item.label || '', totalTableWidth, separatorAlign);
        lineCount++;
        // Render description if provided (with same alignment)
        if (item.description) {
          const descLength = item.description.length;
          let padding = 0;

          switch (separatorAlign) {
            case 'left':
              padding = 2; // Just left margin
              break;
            case 'right':
              padding = Math.max(0, totalTableWidth - descLength);
              break;
            case 'center':
            default:
              padding = Math.max(0, Math.floor((totalTableWidth - descLength) / 2)) + 2;
              break;
          }

          const alignedDesc = ' '.repeat(padding) + item.description;
          process.stdout.write(`${colors.dim}${alignedDesc}${colors.reset}\n`);
          lineCount++;
        }
      } else {
        // Render data row
        const originalIndex = item.originalIndex!;
        const isSelected = selected.has(originalIndex);
        const isHighlighted = index === cursorIndex;
        renderTableRow(item.data!, columns, columnWidths, isSelected, isHighlighted, checkboxWidth);
        lineCount++;
      }
    }

    // Show scroll indicator if content is truncated
    if (visibleStart > 0 || visibleEnd < totalItems) {
      renderBlankLines(1);
      lineCount++;

      // Calculate current position among selectable items
      const selectableBeforeCursor = selectableIndices.filter(i => i <= cursorIndex).length;
      const totalSelectable = selectableIndices.length;

      const scrollInfo = `  ${colors.dim}[第 ${selectableBeforeCursor}/${totalSelectable} 项 | ↑↓ 滚动查看更多]${colors.reset}`;
      process.stdout.write(scrollInfo + '\n');
      lineCount++;
    }

    // Render hints if provided
    if (hints && hints.length > 0) {
      renderBlankLines(1);
      lineCount++;
      renderHints(hints);
      lineCount += 1;
    }

    state.renderedLines = lineCount;
  };

  // Initial render
  render();

  // Keyboard input handling
  return new Promise((resolve) => {
    const onData = (key: string) => {
      if (isCtrlC(key)) {
        state.stdin.removeListener('data', onData);
        clearMenu(state);
        restoreTerminal(state);
        if (onExit) onExit();
        process.exit(0);
      }

      if (isEnter(key)) {
        // Validate minimum selections
        if (selected.size < minSelections) {
          // TODO: Show error message
          return;
        }

        // Clean up
        state.stdin.removeListener('data', onData);
        if (!preserveOnSelect) {
          clearMenu(state);
        }
        restoreTerminal(state);

        // Build result
        const selectedIndices = Array.from(selected).sort((a, b) => a - b);
        const selectedRows = selectedIndices.map(i => data[i]);
        const result: CheckboxTableMenuResult = {
          indices: selectedIndices,
          rows: selectedRows
        };

        if (idKey) {
          result.ids = selectedRows.map(row => row[idKey]);
        }

        resolve(result);
        return;
      }

      if (isSpace(key)) {
        // Toggle selection for current row
        const currentItem = optionsWithSeparators[cursorIndex];
        if (currentItem.type === 'data') {
          const originalIndex = currentItem.originalIndex!;
          if (selected.has(originalIndex)) {
            selected.delete(originalIndex);
          } else {
            // Check max selections
            if (!maxSelections || selected.size < maxSelections) {
              selected.add(originalIndex);
            }
          }
          render();
        }
        return;
      }

      // Arrow keys
      if (key === KEY_CODES.UP) {
        cursorIndex = getNextSelectableIndex(cursorIndex, 'up');
        render();
        return;
      }

      if (key === KEY_CODES.DOWN) {
        cursorIndex = getNextSelectableIndex(cursorIndex, 'down');
        render();
        return;
      }

      // Select all (A key)
      if (allowSelectAll && (key === 'a' || key === 'A')) {
        if (selected.size === data.length) {
          // Deselect all
          selected.clear();
        } else {
          // Select all
          data.forEach((_, index) => {
            if (!maxSelections || selected.size < maxSelections) {
              selected.add(index);
            }
          });
        }
        render();
        return;
      }

      // Invert selection (I key)
      if (allowInvert && (key === 'i' || key === 'I')) {
        const newSelected = new Set<number>();
        data.forEach((_, index) => {
          if (!selected.has(index)) {
            if (!maxSelections || newSelected.size < maxSelections) {
              newSelected.add(index);
            }
          }
        });
        selected.clear();
        newSelected.forEach(i => selected.add(i));
        render();
        return;
      }
    };

    state.stdin.on('data', onData);
  });
}

