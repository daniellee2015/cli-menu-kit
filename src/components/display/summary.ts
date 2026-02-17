/**
 * Summary - Summary table component
 * Displays statistics and information in a bordered box
 */

import { SummaryTableConfig } from '../../types/display.types.js';
import { writeLine } from '../../core/terminal.js';
import { colors } from '../../core/colors.js';
import { getTerminalWidth } from '../../core/terminal.js';

/**
 * Wrap text to fit within a specific width
 */
function wrapText(text: string, maxWidth: number): string[] {
  const words = text.split(' ');
  const lines: string[] = [];
  let currentLine = '';

  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    if (testLine.length <= maxWidth) {
      currentLine = testLine;
    } else {
      if (currentLine) {
        lines.push(currentLine);
      }
      currentLine = word;
    }
  }

  if (currentLine) {
    lines.push(currentLine);
  }

  return lines;
}

/**
 * Render a summary table
 * @param config - Summary table configuration
 */
export function renderSummaryTable(config: SummaryTableConfig): void {
  const { title, titleAlign = 'center', sections, width } = config;

  const termWidth = getTerminalWidth();
  // Use full terminal width minus padding, or specified width
  const boxWidth = width || Math.max(60, termWidth - 4);

  // Calculate content width (excluding borders and padding)
  const contentWidth = boxWidth - 4;

  // Top border
  writeLine(`╭${'─'.repeat(boxWidth - 2)}╮`);

  // Empty line
  writeLine(`│${' '.repeat(boxWidth - 2)}│`);

  // Title if provided
  if (title) {
    let titleLine: string;
    let remainingSpace: number;

    if (titleAlign === 'left') {
      titleLine = `  ${colors.cyan}${title}${colors.reset}`;
      const plainTitle = title;
      remainingSpace = boxWidth - plainTitle.length - 4;
    } else if (titleAlign === 'right') {
      const plainTitle = title;
      const rightPadding = contentWidth - plainTitle.length;
      titleLine = ' '.repeat(rightPadding + 2) + colors.cyan + title + colors.reset;
      remainingSpace = 2;
    } else {
      // center (default)
      const titlePadding = Math.floor((contentWidth - title.length) / 2);
      titleLine = ' '.repeat(titlePadding + 2) + colors.cyan + title + colors.reset;
      remainingSpace = boxWidth - titlePadding - title.length - 4;
    }

    writeLine(`│${titleLine}${' '.repeat(remainingSpace)}│`);
    writeLine(`│${' '.repeat(boxWidth - 2)}│`);
  }

  // Sections
  sections.forEach((section, sectionIndex) => {
    // Section header if provided
    if (section.header) {
      const headerLine = `  ${colors.brightCyan}${section.header}${colors.reset}`;
      const remainingSpace = boxWidth - section.header.length - 4;
      writeLine(`│${headerLine}${' '.repeat(remainingSpace)}│`);
    }

    // Section items
    section.items.forEach(item => {
      const keyPadding = 15;
      const valueMaxWidth = contentWidth - keyPadding - 2; // 2 for leading spaces

      // Check if value needs wrapping
      const plainValue = item.value.replace(/\x1b\[[0-9;]*m/g, '');

      if (plainValue.length > valueMaxWidth) {
        // Wrap the value
        const wrappedLines = wrapText(plainValue, valueMaxWidth);

        // First line with key
        const firstLine = `  ${item.key}:${' '.repeat(Math.max(1, keyPadding - item.key.length))}${wrappedLines[0]}`;
        const plainFirstLine = firstLine.replace(/\x1b\[[0-9;]*m/g, '');
        const remainingSpace = boxWidth - plainFirstLine.length - 2;
        writeLine(`│${firstLine}${' '.repeat(Math.max(0, remainingSpace))}│`);

        // Subsequent lines with indentation
        for (let i = 1; i < wrappedLines.length; i++) {
          const continuationLine = `  ${' '.repeat(keyPadding)}${wrappedLines[i]}`;
          const plainContinuationLine = continuationLine.replace(/\x1b\[[0-9;]*m/g, '');
          const contRemainingSpace = boxWidth - plainContinuationLine.length - 2;
          writeLine(`│${continuationLine}${' '.repeat(Math.max(0, contRemainingSpace))}│`);
        }
      } else {
        // No wrapping needed
        const itemLine = `  ${item.key}:${' '.repeat(Math.max(1, keyPadding - item.key.length))}${item.value}`;
        const plainItemLine = itemLine.replace(/\x1b\[[0-9;]*m/g, '');
        const remainingSpace = boxWidth - plainItemLine.length - 2;
        writeLine(`│${itemLine}${' '.repeat(Math.max(0, remainingSpace))}│`);
      }
    });

    // Add spacing between sections (except after last section)
    if (sectionIndex < sections.length - 1) {
      writeLine(`│${' '.repeat(boxWidth - 2)}│`);
    }
  });

  // Empty line
  writeLine(`│${' '.repeat(boxWidth - 2)}│`);

  // Bottom border
  writeLine(`╰${'─'.repeat(boxWidth - 2)}╯`);
}

/**
 * Create a summary table
 * @param title - Optional title
 * @param sections - Array of sections with items
 * @param width - Optional width
 */
export function createSummaryTable(
  title: string | undefined,
  sections: Array<{
    header?: string;
    items: Array<{ key: string; value: string }>;
  }>,
  width?: number
): void {
  renderSummaryTable({ title, sections, width });
}

/**
 * Create a simple summary table with one section
 * @param title - Optional title
 * @param items - Key-value pairs
 * @param width - Optional width
 */
export function createSimpleSummary(
  title: string | undefined,
  items: Array<{ key: string; value: string }>,
  width?: number
): void {
  renderSummaryTable({
    title,
    sections: [{ items }],
    width
  });
}
