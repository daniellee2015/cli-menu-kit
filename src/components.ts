/**
 * CLI Menu Kit - UI Components
 * Handles all display-related UI components
 */

import { Colors, Theme, Symbols, HintKey } from './types';

// ANSI Colors
export const colors: Colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  gray: '\x1b[90m',
};

// Additional color codes
const colorCodes = {
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  magenta: '\x1b[35m',
};

// Theme colors
export const theme: Theme = {
  active: `${colorCodes.bright}${colors.cyan}`,  // Selected item - bright cyan
  primary: colors.cyan,                           // Standard - cyan (numbers, separators)
  title: colors.reset,                            // Title - white (menu titles)
  muted: colors.gray,                             // Auxiliary - gray (descriptions, hints)
  success: colors.green,                          // Success - green
  warning: colors.yellow,                         // Warning - yellow
  error: colors.red,                              // Error - red
};

// Message symbols with colors
export const symbols: Symbols = {
  success: { icon: '✓', color: colors.green },
  error: { icon: 'x', color: colors.red },
  warning: { icon: '!', color: colors.yellow },
  info: { icon: 'ℹ', color: colors.blue },
};

/**
 * Format section title with separator
 */
export function formatSection(text: string): string {
  const separator = '─'.repeat(10);
  return `${separator} ${text} ${separator}`;
}

/**
 * Build hint text for interactive menus
 */
export function buildHint(keys: HintKey[], lang: 'zh' | 'en' = 'zh'): string {
  const hints = {
    zh: {
      arrows: `${colors.reset}↑↓${theme.muted} 方向键`,
      space: `${colors.reset}空格${theme.muted} 选中/取消`,
      number: `${colors.reset}0-9${theme.muted} 输入序号`,
      letter: `${colors.reset}字母${theme.muted} 快捷键`,
      all: `${colors.reset}A${theme.muted} 全选`,
      invert: `${colors.reset}I${theme.muted} 反选`,
      enter: `${colors.reset}⏎${theme.muted} 确认`,
      esc: `${colors.reset}Esc${theme.muted} 退出`,
    },
    en: {
      arrows: `${colors.reset}↑↓${theme.muted} Navigate`,
      space: `${colors.reset}Space${theme.muted} Select`,
      number: `${colors.reset}0-9${theme.muted} Type number`,
      letter: `${colors.reset}Letter${theme.muted} Shortcut`,
      all: `${colors.reset}A${theme.muted} All`,
      invert: `${colors.reset}I${theme.muted} Invert`,
      enter: `${colors.reset}⏎${theme.muted} Submit`,
      esc: `${colors.reset}Esc${theme.muted} Exit`,
    }
  };

  const langHints = hints[lang] || hints.zh;
  const parts = keys.map(key => langHints[key]).filter(Boolean);

  return parts.join(` ${theme.muted}•${colors.reset} `) + colors.reset;
}

/**
 * Show submenu title with section format
 */
export function showSubMenuTitle(title: string, lang: 'zh' | 'en', indent: string = '  '): void {
  console.log();
  console.log(`${indent}${theme.primary}${formatSection(title)}${colors.reset}`);
  console.log();
}

/**
 * Show progress indicator
 */
export function showProgress(steps: string[], currentStep: number, lang: 'zh' | 'en', indent: string = '  '): void {
  const progress = steps.map((step, index) => {
    if (index <= currentStep) {
      return `${colors.reset}${step}${colors.reset}`;
    } else {
      return `${theme.muted}${step}${colors.reset}`;
    }
  }).join(` ${theme.muted}→${colors.reset} `);

  console.log(`${indent}${progress}`);
  console.log();
}

/**
 * Show info message
 */
export function showInfo(message: string, indent: string = ''): void {
  console.log(`${indent}${symbols.info.color}${symbols.info.icon} ${message}${colors.reset}`);
}

/**
 * Show success message
 */
export function showSuccess(message: string, indent: string = ''): void {
  console.log(`${indent}${symbols.success.color}${symbols.success.icon} ${message}${colors.reset}`);
}

/**
 * Show error message
 */
export function showError(message: string, indent: string = ''): void {
  console.log(`${indent}${symbols.error.color}${symbols.error.icon} ${message}${colors.reset}`);
}

/**
 * Show warning message
 */
export function showWarning(message: string, indent: string = ''): void {
  console.log(`${indent}${symbols.warning.color}${symbols.warning.icon} ${message}${colors.reset}`);
}

/**
 * Show goodbye message
 */
export function showGoodbye(lang: 'zh' | 'en' = 'zh'): void {
  console.log('\n');
  const message = lang === 'zh'
    ? '👋 感谢使用，再见！'
    : '👋 Thank you for using CLI Menu Kit. Goodbye!';
  console.log(`${theme.active}${message}${colors.reset}`);
  console.log();
}

/**
 * Print header with ASCII art
 */
export interface HeaderOptions {
  asciiArt: string[];
  title: string;
  subtitle?: string;
  version?: string;
  github?: string;
}

export function printHeader(options: HeaderOptions): void {
  const { asciiArt, title, subtitle, version, github } = options;
  const indent = '  ';

  console.log(`${theme.primary}${'═'.repeat(71)}${colors.reset}`);
  console.log();

  asciiArt.forEach(line => {
    console.log(`${indent}${theme.active}${line}${colors.reset}`);
  });
  console.log();

  console.log(`${indent}${colorCodes.bright}${title}${colors.reset}${subtitle ? `  ${theme.muted}${subtitle}${colors.reset}` : ''}`);
  console.log();

  console.log(`${theme.primary}${'═'.repeat(71)}${colors.reset}`);
  console.log();

  if (version || github) {
    const versionText = version ? `${theme.muted}Version: ${colors.reset}${theme.primary}${version}${colors.reset}` : '';
    const githubText = github ? `${theme.primary}${github}${colors.reset}` : '';
    const separator = version && github ? `  ${theme.muted}|${colors.reset}  ` : '';
    console.log(`${indent}${versionText}${separator}${githubText}`);
    console.log();
  }
}
