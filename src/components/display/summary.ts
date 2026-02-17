/**
 * Summary - Summary table component
 * Displays statistics and information in a bordered box
 */

import { SummaryTableConfig } from '../../types/display.types.js';
import { writeLine } from '../../core/terminal.js';
import { colors } from '../../core/colors.js';
import { getTerminalWidth } from '../../core/terminal.js';

/**
 * Wrap text to fit within a specific width, preserving ANSI color codes
 */
function wrapTextWithColors(text: string, maxWidth: number): string[] {
  // Extract ANSI codes and plain text
  const ansiRegex = /\x1b\[[0-9;]*m/g;
  const plainText = text.replace(ansiRegex, '');

  // If plain text fits, return as-is
  if (plainText.length <= maxWidth) {
    return [text];
  }

  // Find all ANSI codes and their positions in the original text
  const codes: Array<{ pos: number; code: string }> = [];
  let match;
  let offset = 0;
  const textCopy = text;

  while ((match = ansiRegex.exec(textCopy)) !== null) {
    // Calculate position in plain text
    const plainPos = match.index - offset;
    codes.push({ pos: plainPos, code: match[0] });
    offset += match[0].length;
  }

  // Wrap plain text by words
  const words = plainText.split(' ');
  const lines: string[] = [];
  let currentLine = '';
  let currentPos = 0;

  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    if (testLine.length <= maxWidth) {
      currentLine = testLine;
    } else {
      if (currentLine) {
        lines.push(currentLine);
        currentPos += currentLine.length + 1; // +1 for space
      }
      currentLine = word;
    }
  }

  if (currentLine) {
    lines.push(currentLine);
  }

  // Re-insert ANSI codes into wrapped lines
  const result: string[] = [];
  let lineStart = 0;
  let activeColor = '';

  for (const line of lines) {
    const lineEnd = lineStart + line.length;
    let coloredLine = activeColor; // Start with active color from previous line

    // Find codes that apply to this line
    let lastPos = 0;
    for (const { pos, code } of codes) {
      if (pos >= lineStart && pos < lineEnd) {
        const relPos = pos - lineStart;
        coloredLine += line.substring(lastPos, relPos) + code;
        lastPos = relPos;

        // Track active color (reset or new color)
        if (code === '\x1b[0m') {
          activeColor = '';
        } else {
          activeColor = code;
        }
      }
    }

    coloredLine += line.substring(lastPos);

    // Add reset at end if there's an active color
    if (activeColor && activeColor !== '\x1b[0m') {
      coloredLine += '\x1b[0m';
    }

    result.push(coloredLine);
    lineStart = lineEnd + 1; // +1 for space between words
  }

  return result;
}

/**
 * Wrap text to fit within a specific width (plain text only)
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
  const { title, titleAlign = 'center', sections, width, colors: colorConfig } = config;

  // Default colors
  const defaultColors = {
    title: 'cyan+bold',
    sectionHeader: '',  // No color (default/black)
    key: 'cyan',
    value: ''  // No color (default/black)
  };

  // Merge with provided colors
  const finalColors = { ...defaultColors, ...colorConfig };

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
    // Parse color configuration (supports "color" or "color+style" format)
    let titleColor = '';
    if (finalColors.title) {
      const parts = finalColors.title.split('+');
      titleColor = parts.map(part => colors[part.trim() as keyof typeof colors] || '').join('');
    }
    const resetColor = titleColor ? colors.reset : '';
    let titleLine: string;
    let remainingSpace: number;

    if (titleAlign === 'left') {
      titleLine = `  ${titleColor}${title}${resetColor}`;
      const plainTitle = title;
      remainingSpace = boxWidth - plainTitle.length - 4;
    } else if (titleAlign === 'right') {
      const plainTitle = title;
      const rightPadding = contentWidth - plainTitle.length;
      titleLine = ' '.repeat(rightPadding + 2) + titleColor + title + resetColor;
      remainingSpace = 2;
    } else {
      // center (default)
      const titlePadding = Math.floor((contentWidth - title.length) / 2);
      titleLine = ' '.repeat(titlePadding + 2) + titleColor + title + resetColor;
      remainingSpace = boxWidth - titlePadding - title.length - 4;
    }

    writeLine(`│${titleLine}${' '.repeat(remainingSpace)}│`);
    writeLine(`│${' '.repeat(boxWidth - 2)}│`);
  }

  // Calculate global keyPadding based on longest key across ALL sections
  const allKeys = sections.flatMap(section => section.items.map(item => item.key));
  const maxKeyLength = Math.max(...allKeys.map(key => key.length));
  const keyPadding = maxKeyLength + 3; // +3 for colon and spacing

  // Sections
  sections.forEach((section, sectionIndex) => {
    // Section header if provided
    if (section.header) {
      const headerColor = finalColors.sectionHeader ? colors[finalColors.sectionHeader as keyof typeof colors] || '' : '';
      const resetColor = headerColor ? colors.reset : '';
      const headerLine = `  ${headerColor}${section.header}${resetColor}`;
      const remainingSpace = boxWidth - section.header.length - 4;
      writeLine(`│${headerLine}${' '.repeat(remainingSpace)}│`);
    }

    // Section items (using global keyPadding)
    section.items.forEach(item => {
      const valueMaxWidth = contentWidth - keyPadding - 2; // 2 for leading spaces

      // Check if value needs wrapping
      const plainValue = item.value.replace(/\x1b\[[0-9;]*m/g, '');

      if (plainValue.length > valueMaxWidth) {
        // Wrap the value (preserving colors if present)
        const wrappedLines = wrapTextWithColors(item.value, valueMaxWidth);

        // First line with key
        const keyColor = finalColors.key ? colors[finalColors.key as keyof typeof colors] || '' : '';
        const keyResetColor = keyColor ? colors.reset : '';

        // wrappedLines already contain colors, don't add valueColor
        const firstLine = `  ${keyColor}${item.key}:${keyResetColor}${' '.repeat(Math.max(1, keyPadding - item.key.length))}${wrappedLines[0]}`;
        const plainFirstLine = firstLine.replace(/\x1b\[[0-9;]*m/g, '');
        const remainingSpace = boxWidth - plainFirstLine.length - 2;
        writeLine(`│${firstLine}${' '.repeat(Math.max(0, remainingSpace))}│`);

        // Subsequent lines with indentation
        for (let i = 1; i < wrappedLines.length; i++) {
          const continuationLine = `  ${' '.repeat(keyPadding + 1)}${wrappedLines[i]}`;
          const plainContinuationLine = continuationLine.replace(/\x1b\[[0-9;]*m/g, '');
          const contRemainingSpace = boxWidth - plainContinuationLine.length - 2;
          writeLine(`│${continuationLine}${' '.repeat(Math.max(0, contRemainingSpace))}│`);
        }
      } else {
        // No wrapping needed
        const keyColor = finalColors.key ? colors[finalColors.key as keyof typeof colors] || '' : '';
        const keyResetColor = keyColor ? colors.reset : '';
        const valueColor = finalColors.value ? colors[finalColors.value as keyof typeof colors] || '' : '';
        const valueResetColor = valueColor ? colors.reset : '';

        // Only wrap value with color if valueColor is set, otherwise preserve original colors in item.value
        const coloredValue = valueColor ? `${valueColor}${item.value}${valueResetColor}` : item.value;
        const itemLine = `  ${keyColor}${item.key}:${keyResetColor}${' '.repeat(Math.max(1, keyPadding - item.key.length))}${coloredValue}`;
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
