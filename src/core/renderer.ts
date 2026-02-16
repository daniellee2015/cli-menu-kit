/**
 * Base rendering functions for CLI Menu Kit
 * Provides utilities for rendering menu components
 */

import { colors } from './colors.js';
import { writeLine, write } from './terminal.js';

/**
 * Render a blank line
 * @param count - Number of blank lines (default: 1)
 */
export function renderBlankLines(count: number = 1): void {
  for (let i = 0; i < count; i++) {
    writeLine('');
  }
}

/**
 * Render a header
 * @param text - Header text
 * @param color - Optional color
 */
export function renderHeader(text: string, color?: string): void {
  if (color) {
    writeLine(`${color}${text}${colors.reset}`);
  } else {
    writeLine(text);
  }
}

/**
 * Render an option line
 * @param text - Option text
 * @param isSelected - Whether option is selected
 * @param isHighlighted - Whether option is highlighted (cursor on it)
 * @param prefix - Optional prefix (e.g., "1. ", "A. ")
 */
export function renderOption(
  text: string,
  isSelected: boolean,
  isHighlighted: boolean,
  prefix?: string
): void {
  let line = '';

  // Add cursor indicator if highlighted
  if (isHighlighted) {
    line += `${colors.cyan}❯ ${colors.reset}`;
  } else {
    line += '  ';
  }

  // Add checkbox for multi-select
  if (isSelected !== undefined && typeof isSelected === 'boolean') {
    line += isSelected ? `${colors.green}◉${colors.reset} ` : `${colors.dim}○${colors.reset} `;
  }

  // Add prefix if provided
  if (prefix) {
    line += `${colors.dim}${prefix}${colors.reset}`;
  }

  // Add option text
  if (isHighlighted) {
    line += `${colors.cyan}${text}${colors.reset}`;
  } else {
    line += text;
  }

  writeLine(line);
}

/**
 * Render input prompt
 * @param prompt - Prompt text
 * @param value - Current input value
 * @param showCursor - Whether to show cursor
 */
export function renderInputPrompt(
  prompt: string,
  value: string,
  showCursor: boolean = false
): void {
  let line = `  ${prompt} `;

  if (value) {
    line += `${colors.cyan}${value}${colors.reset}`;
  }

  if (showCursor) {
    line += `${colors.cyan}_${colors.reset}`;
  }

  writeLine(line);
}

/**
 * Render hints
 * @param hints - Array of hint strings
 */
export function renderHints(hints: string[]): void {
  if (hints.length === 0) return;

  // Format each hint: symbols/numbers in black, text in gray
  const formattedHints = hints.map(hint => {
    const parts = hint.split(' ');
    if (parts.length >= 2) {
      // First part (symbols/numbers) in normal color, rest in dim
      const symbols = parts[0];
      const text = parts.slice(1).join(' ');
      return `${symbols} ${colors.dim}${text}${colors.reset}`;
    }
    // If no space, keep entire hint in dim
    return `${colors.dim}${hint}${colors.reset}`;
  });

  const hintLine = `  ${formattedHints.join(' • ')}`;
  writeLine(hintLine);
}

/**
 * Render a separator line
 * @param char - Character to use for separator
 * @param width - Width of separator (default: terminal width)
 */
export function renderSeparator(char: string = '─', width?: number): void {
  const termWidth = process.stdout.columns || 80;
  const sepWidth = width || termWidth;
  writeLine(char.repeat(sepWidth));
}

/**
 * Render a section label (menu grouping)
 * @param label - Label text (optional)
 */
export function renderSectionLabel(label?: string): void {
  if (label) {
    const totalWidth = 30; // Fixed total width for consistency
    const padding = 2; // Spaces around label
    const labelWithPadding = ` ${label} `;
    const labelLength = labelWithPadding.length;
    const dashesTotal = totalWidth - labelLength;
    const dashesLeft = Math.floor(dashesTotal / 2);
    const dashesRight = dashesTotal - dashesLeft;

    const line = `  ${colors.dim}${'─'.repeat(dashesLeft)}${labelWithPadding}${'─'.repeat(dashesRight)}${colors.reset}`;
    writeLine(line);
  } else {
    writeLine('');
  }
}

/**
 * Render a message with icon
 * @param type - Message type (success, error, warning, info, question)
 * @param message - Message text
 */
export function renderMessage(
  type: 'success' | 'error' | 'warning' | 'info' | 'question',
  message: string
): void {
  let icon = '';
  let color: string = colors.reset;

  switch (type) {
    case 'success':
      icon = '✓';
      color = colors.green;
      break;
    case 'error':
      icon = '✗';
      color = colors.red;
      break;
    case 'warning':
      icon = '⚠';
      color = colors.yellow;
      break;
    case 'info':
      icon = 'ℹ';
      color = colors.blue;
      break;
    case 'question':
      icon = '?';
      color = colors.yellow;
      break;
  }

  writeLine(`${color}${icon}${colors.reset} ${message}`);
}

/**
 * Render progress indicator
 * @param steps - Array of step names
 * @param currentStep - Index of current step
 */
export function renderProgress(steps: string[], currentStep: number): void {
  const parts: string[] = [];

  steps.forEach((step, index) => {
    if (index === currentStep) {
      parts.push(`${colors.cyan}${step}${colors.reset}`);
    } else if (index < currentStep) {
      parts.push(step);
    } else {
      parts.push(`${colors.dim}${step}${colors.reset}`);
    }
  });

  writeLine(`  ${parts.join(` ${colors.dim}→${colors.reset} `)}`);
}

/**
 * Render a box with content
 * @param content - Array of content lines
 * @param title - Optional title
 * @param width - Box width (default: auto)
 */
export function renderBox(content: string[], title?: string, width?: number): void {
  const termWidth = process.stdout.columns || 80;
  const boxWidth = width || Math.min(termWidth - 4, 60);

  // Top border
  writeLine(`╭${'─'.repeat(boxWidth - 2)}╮`);

  // Title if provided
  if (title) {
    const padding = Math.floor((boxWidth - title.length - 2) / 2);
    writeLine(`│${' '.repeat(padding)}${title}${' '.repeat(boxWidth - padding - title.length - 2)}│`);
    writeLine(`│${' '.repeat(boxWidth - 2)}│`);
  }

  // Content
  content.forEach(line => {
    const padding = boxWidth - line.length - 4;
    writeLine(`│  ${line}${' '.repeat(padding)}│`);
  });

  // Bottom border
  writeLine(`╰${'─'.repeat(boxWidth - 2)}╯`);
}

/**
 * Count lines in rendered output
 * @param text - Text to count lines in
 * @returns Number of lines
 */
export function countLines(text: string): number {
  return text.split('\n').length;
}

/**
 * Pad text to width
 * @param text - Text to pad
 * @param width - Target width
 * @param align - Alignment (left, center, right)
 * @returns Padded text
 */
export function padText(text: string, width: number, align: 'left' | 'center' | 'right' = 'left'): string {
  if (text.length >= width) return text;

  const padding = width - text.length;

  switch (align) {
    case 'left':
      return text + ' '.repeat(padding);
    case 'right':
      return ' '.repeat(padding) + text;
    case 'center':
      const leftPad = Math.floor(padding / 2);
      const rightPad = padding - leftPad;
      return ' '.repeat(leftPad) + text + ' '.repeat(rightPad);
  }
}
