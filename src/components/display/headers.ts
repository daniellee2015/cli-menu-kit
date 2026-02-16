/**
 * Headers - Display header components
 * Provides simple and ASCII art headers
 */

import { SimpleHeaderConfig, AsciiHeaderConfig } from '../../types/display.types.js';
import { writeLine } from '../../core/terminal.js';
import { colors, colorize } from '../../core/colors.js';
import { getTerminalWidth } from '../../core/terminal.js';

/**
 * Render a simple header
 * @param config - Header configuration
 */
export function renderSimpleHeader(config: SimpleHeaderConfig): void {
  const { text, color } = config;

  if (color) {
    writeLine(colorize(text, color));
  } else {
    writeLine(text);
  }
}

/**
 * Render an ASCII art header with decorations
 * @param config - Header configuration
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
 * Create a simple header
 * @param text - Header text
 * @param color - Optional color
 */
export function createSimpleHeader(text: string, color?: string): void {
  renderSimpleHeader({ text, color });
}

/**
 * Create an ASCII header
 * @param asciiArt - ASCII art string
 * @param options - Optional configuration
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
