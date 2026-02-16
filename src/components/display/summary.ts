/**
 * Summary - Summary table component
 * Displays statistics and information in a bordered box
 */

import { SummaryTableConfig } from '../../types/display.types.js';
import { writeLine } from '../../core/terminal.js';
import { colors } from '../../core/colors.js';
import { getTerminalWidth } from '../../core/terminal.js';

/**
 * Render a summary table
 * @param config - Summary table configuration
 */
export function renderSummaryTable(config: SummaryTableConfig): void {
  const { title, sections, width } = config;

  const termWidth = getTerminalWidth();
  const boxWidth = width || Math.min(termWidth - 4, 60);

  // Calculate content width (excluding borders and padding)
  const contentWidth = boxWidth - 4;

  // Top border
  writeLine(`╭${'─'.repeat(boxWidth - 2)}╮`);

  // Empty line
  writeLine(`│${' '.repeat(boxWidth - 2)}│`);

  // Title if provided
  if (title) {
    const titlePadding = Math.floor((contentWidth - title.length) / 2);
    const titleLine = ' '.repeat(titlePadding + 2) + colors.cyan + title + colors.reset;
    const remainingSpace = boxWidth - titlePadding - title.length - 4;
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
      const itemLine = `  ${item.key}:${' '.repeat(Math.max(1, 15 - item.key.length))}${item.value}`;

      // Remove ANSI codes for length calculation
      const plainItemLine = itemLine.replace(/\x1b\[[0-9;]*m/g, '');
      const remainingSpace = boxWidth - plainItemLine.length - 2;

      writeLine(`│${itemLine}${' '.repeat(Math.max(0, remainingSpace))}│`);
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
