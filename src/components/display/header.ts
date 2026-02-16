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

  // Title (left-aligned with 2 spaces padding, black text)
  if (title) {
    const paddedTitle = `  ${title}`.padEnd(boxWidth - 2, ' ');
    writeLine(`${boldColor}║${colors.reset}${paddedTitle}${boldColor}║${colors.reset}`);
    writeLine(`${boldColor}║${' '.repeat(boxWidth - 2)}║${colors.reset}`);
  }

  // Description (left-aligned with 2 spaces padding, gray text)
  if (description) {
    const paddedDesc = `  ${colors.dim}${description}${colors.reset}`.padEnd(boxWidth - 2 + colors.dim.length + colors.reset.length, ' ');
    writeLine(`${boldColor}║${paddedDesc}║${colors.reset}`);
    writeLine(`${boldColor}║${' '.repeat(boxWidth - 2)}║${colors.reset}`);
  }

  // Bottom border
  writeLine(`${boldColor}╚${'═'.repeat(boxWidth - 2)}╝${colors.reset}`);

  // Blank line after box
  writeLine('');

  // Version and URL (outside the box, with colors)
  if (version || url) {
    const versionText = version ? `${colors.cyan}Version: ${version}${colors.reset}` : '';
    const urlText = url ? `${colors.blue}${url}${colors.reset}` : '';
    const separator = version && url ? `${colors.dim}  |  ${colors.reset}` : '';
    writeLine(`  ${versionText}${separator}${urlText}`);
  }

  // Menu title (optional)
  if (menuTitle) {
    writeLine('');
    writeLine(`${color}  ${menuTitle}${colors.reset}`);
  }
}
