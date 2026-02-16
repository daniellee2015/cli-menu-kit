/**
 * Headers - Display header components
 * Provides three header modes: full, section, and simple
 */

import { SimpleHeaderConfig, AsciiHeaderConfig } from '../../types/display.types.js';
import { writeLine } from '../../core/terminal.js';
import { colors, uiColors, colorize } from '../../core/colors.js';
import { getTerminalWidth } from '../../core/terminal.js';

/**
 * Render a simple header with equals signs
 * Format: === Title ===
 * @param text - Header text
 * @param color - Optional color (default: cyan)
 */
export function renderSimpleHeader(text: string, color?: string): void {
  const headerColor = color || uiColors.primary;
  const line = `=== ${text} ===`;
  writeLine(`${headerColor}${line}${colors.reset}`);
  writeLine('');
}

/**
 * Render a section header with double-line borders
 * Format:
 * ══════════════════════════════════════════════════
 *   Title
 * ══════════════════════════════════════════════════
 * @param text - Header text
 * @param width - Border width (default: 50)
 * @param color - Optional color (default: cyan)
 */
export function renderSectionHeader(text: string, width: number = 50, color?: string): void {
  const headerColor = color || uiColors.border;
  const border = '═'.repeat(width);

  writeLine(`${headerColor}${border}${colors.reset}`);
  writeLine(`  ${text}`);
  writeLine(`${headerColor}${border}${colors.reset}`);
  writeLine('');
}

/**
 * Render an ASCII art header with decorations (legacy)
 * @param config - Header configuration
 * @deprecated Use renderHeader from header.ts for full headers
 */
export function renderAsciiHeader(config: AsciiHeaderConfig): void {
  const {
    asciiArt,
    subtitle,
    version,
    url,
    borderChar = '═'
  } = config;

  const termWidth = getTerminalWidth();
  const border = borderChar.repeat(termWidth);

  // Top border
  writeLine(colors.cyan + border + colors.reset);
  writeLine('');

  // ASCII art (centered)
  const artLines = asciiArt.split('\n');
  artLines.forEach(line => {
    writeLine(colors.cyan + line + colors.reset);
  });

  // Subtitle if provided
  if (subtitle) {
    writeLine('');
    const padding = Math.floor((termWidth - subtitle.length) / 2);
    writeLine(' '.repeat(padding) + colors.brightCyan + subtitle + colors.reset);
  }

  writeLine('');

  // Bottom border
  writeLine(colors.cyan + border + colors.reset);

  // Footer info (version and URL)
  if (version || url) {
    const footerParts: string[] = [];
    if (version) footerParts.push(`Version: ${version}`);
    if (url) footerParts.push(url);

    const footer = footerParts.join('  |  ');
    const footerPadding = Math.floor((termWidth - footer.length) / 2);
    writeLine('');
    writeLine(' '.repeat(footerPadding) + colors.dim + footer + colors.reset);
  }

  writeLine('');
}

/**
 * Create a simple header (convenience function)
 * @param text - Header text
 * @param color - Optional color
 */
export function createSimpleHeader(text: string, color?: string): void {
  renderSimpleHeader(text, color);
}

/**
 * Create a section header (convenience function)
 * @param text - Header text
 * @param width - Border width
 * @param color - Optional color
 */
export function createSectionHeader(text: string, width?: number, color?: string): void {
  renderSectionHeader(text, width, color);
}

/**
 * Create an ASCII header (convenience function)
 * @param asciiArt - ASCII art string
 * @param options - Optional configuration
 * @deprecated Use renderHeader from header.ts for full headers
 */
export function createAsciiHeader(
  asciiArt: string,
  options?: {
    subtitle?: string;
    version?: string;
    url?: string;
    borderChar?: string;
  }
): void {
  renderAsciiHeader({
    asciiArt,
    ...options
  });
}
