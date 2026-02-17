/**
 * Full Header Component - New Architecture Version
 * Returns string arrays instead of writing to stdout
 */

import { Component, Rect } from '../../layout.js';
import { colors } from '../../core/colors.js';

export interface FullHeaderConfig {
  asciiArt: string[];
  title: string;
  description?: string;
  version?: string;
  url?: string;
}

export function createFullHeaderComponentV2(config: FullHeaderConfig): Component {
  return {
    type: 'full-header',
    regionId: 'header',
    render: (rect: Rect): string[] => {
      const lines: string[] = [];

      // ASCII Art
      config.asciiArt.forEach(line => {
        lines.push(`${colors.cyan}${line}${colors.reset}`);
      });

      // Empty line
      lines.push('');

      // Title and description
      const titleLine = config.version
        ? `${colors.bold}${config.title}${colors.reset} ${colors.dim}v${config.version}${colors.reset}`
        : `${colors.bold}${config.title}${colors.reset}`;

      lines.push(titleLine);

      if (config.description) {
        lines.push(`${colors.dim}${config.description}${colors.reset}`);
      }

      if (config.url) {
        lines.push(`${colors.dim}${config.url}${colors.reset}`);
      }

      // Separator
      lines.push('');
      lines.push(`${colors.dim}${'─'.repeat(Math.min(rect.width, 80))}${colors.reset}`);

      return lines;
    },
    config
  };
}
