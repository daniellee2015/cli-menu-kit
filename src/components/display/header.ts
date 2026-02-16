/**
 * Header component for CLI applications
 * Displays ASCII art, title, description, version and URL
 */

import { colors } from '../../core/colors.js';
import { writeLine } from '../../core/terminal.js';

/**
 * Header configuration
 */
export interface HeaderConfig {
  /** ASCII art lines (array of strings) */
  asciiArt?: string[];
  /** Application title */
  title?: string;
  /** Application description */
  description?: string;
  /** Version number */
  version?: string;
  /** Project URL */
  url?: string;
  /** Optional menu title (e.g., "请选择功能:") */
  menuTitle?: string;
  /** Box width (default: 60) */
  boxWidth?: number;
  /** Header color (default: cyan) */
  color?: string;
}

/**
 * Render a boxed header with ASCII art, title, and description
 * @param config - Header configuration
 */
export function renderHeader(config: HeaderConfig): void {
  const {
    asciiArt = [],
    title = '',
    description = '',
    version,
    url,
    menuTitle,
    boxWidth = 60,
    color = colors.cyan
  } = config;

  const boldColor = `${color}${colors.bold}`;

  // Top border
  writeLine('');
  writeLine(`${boldColor}╔${'═'.repeat(boxWidth - 2)}╗${colors.reset}`);

  // Empty line
  writeLine(`${boldColor}║${' '.repeat(boxWidth - 2)}║${colors.reset}`);

  // ASCII art (left-aligned with 2 spaces padding)
  if (asciiArt.length > 0) {
    asciiArt.forEach(line => {
      const paddedLine = `  ${line}`.padEnd(boxWidth - 2, ' ');
      writeLine(`${boldColor}║${paddedLine}║${colors.reset}`);
    });
    writeLine(`${boldColor}║${' '.repeat(boxWidth - 2)}║${colors.reset}`);
  }

  // Title (left-aligned with 2 spaces padding)
  if (title) {
    const paddedTitle = `  ${title}`.padEnd(boxWidth - 2, ' ');
    writeLine(`${boldColor}║${paddedTitle}║${colors.reset}`);
    writeLine(`${boldColor}║${' '.repeat(boxWidth - 2)}║${colors.reset}`);
  }

  // Description (left-aligned with 2 spaces padding)
  if (description) {
    const paddedDesc = `  ${description}`.padEnd(boxWidth - 2, ' ');
    writeLine(`${boldColor}║${paddedDesc}║${colors.reset}`);
    writeLine(`${boldColor}║${' '.repeat(boxWidth - 2)}║${colors.reset}`);
  }

  // Bottom border
  writeLine(`${boldColor}╚${'═'.repeat(boxWidth - 2)}╝${colors.reset}`);

  // Version and URL (outside the box, dimmed)
  if (version || url) {
    const versionText = version ? `Version: ${version}` : '';
    const urlText = url || '';
    const separator = version && url ? '  |  ' : '';
    writeLine(`${colors.dim}  ${versionText}${separator}${urlText}${colors.reset}`);
  }

  writeLine('');

  // Menu title (optional)
  if (menuTitle) {
    writeLine(`${color}  ${menuTitle}${colors.reset}`);
  }
}
