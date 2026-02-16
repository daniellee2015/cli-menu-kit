/**
 * CLI Menu Kit - Core Utilities
 * Shared rendering and terminal control functions
 */

import { colors, theme } from './components';

/**
 * Terminal control utilities
 */
export interface TerminalState {
  stdin: NodeJS.ReadStream;
  renderedLines: number;
  isFirstRender: boolean;
}

export function setupTerminal(): TerminalState {
  const stdin = process.stdin;
  stdin.setRawMode(true);
  stdin.resume();
  stdin.setEncoding('utf8');

  // Hide cursor
  process.stdout.write('\x1b[?25l');

  return {
    stdin,
    renderedLines: 0,
    isFirstRender: true
  };
}

export function cleanupTerminal(state: TerminalState, onData: (key: string) => void): void {
  state.stdin.setRawMode(false);
  state.stdin.removeListener('data', onData);

  // Clear rendered content
  if (state.renderedLines > 0) {
    process.stdout.write(`\x1b[${state.renderedLines}A`);
    process.stdout.write('\x1b[J');
  }

  // Show cursor
  process.stdout.write('\x1b[?25h');
}

export function moveCursorUp(state: TerminalState): void {
  if (!state.isFirstRender && state.renderedLines > 0) {
    process.stdout.write(`\x1b[${state.renderedLines}A`);
  }
}

/**
 * Header rendering
 */
export function renderHeader(title: string | undefined): number {
  if (!title) return 0;

  const titleLines = title.split('\n');
  titleLines.forEach(line => {
    process.stdout.write('\x1b[2K\r');
    console.log(`  ${theme.primary}${line}${colors.reset}`);
  });
  process.stdout.write('\x1b[2K');
  console.log();

  return titleLines.length + 1; // +1 for empty line
}

/**
 * Option rendering for single-select menus
 */
export interface RenderOptionConfig {
  index: number;
  isSelected: boolean;
  showNumber?: boolean;
}

export function renderSingleOption(
  option: string | { label: string; value?: any },
  config: RenderOptionConfig
): void {
  const { index, isSelected, showNumber = true } = config;

  process.stdout.write('\x1b[2K\r');
  const prefix = isSelected ? `${theme.active}❯ ` : '  ';
  const numColor = isSelected ? theme.active : theme.primary;
  const titleColor = isSelected ? theme.active : theme.title;

  if (typeof option === 'string') {
    // Check if option already has number prefix
    const numMatch = option.match(/^(\d+\.\s*)(.+)$/);
    if (numMatch) {
      const num = numMatch[1];
      const rest = numMatch[2];
      const descMatch = rest.match(/^([^-]+)(\s*-\s*.+)?$/);
      if (descMatch && descMatch[2]) {
        const title = descMatch[1];
        const desc = descMatch[2];
        console.log(`${prefix}${numColor}${num}${titleColor}${title}${theme.muted}${desc}${colors.reset}`);
      } else {
        console.log(`${prefix}${numColor}${num}${titleColor}${rest}${colors.reset}`);
      }
    } else {
      // No number prefix, add one if showNumber is true
      const match = option.match(/^([^-]+)(\s*-\s*.+)?$/);
      if (match && match[2]) {
        const title = match[1];
        const desc = match[2];
        const numPrefix = showNumber ? `${numColor}${index + 1}.${colors.reset} ` : '';
        console.log(`${prefix}${numPrefix}${titleColor}${title}${theme.muted}${desc}${colors.reset}`);
      } else {
        const numPrefix = showNumber ? `${numColor}${index + 1}.${colors.reset} ` : '';
        console.log(`${prefix}${numPrefix}${titleColor}${option}${colors.reset}`);
      }
    }
  } else if (option.label) {
    // Handle MenuOption objects
    const match = option.label.match(/^([^.]+\.\s*)([^-]+)(\s*-\s*.+)?$/);
    if (match) {
      const num = match[1];
      const title = match[2];
      const desc = match[3] || '';
      console.log(`${prefix}${numColor}${num}${titleColor}${title}${theme.muted}${desc}${colors.reset}`);
    } else {
      const numPrefix = showNumber ? `${numColor}${index + 1}.${colors.reset} ` : '';
      console.log(`${prefix}${numPrefix}${titleColor}${option.label}${colors.reset}`);
    }
  }
}

/**
 * Keyboard navigation helpers
 */
export function handleVerticalNavigation(
  key: string,
  currentIndex: number,
  maxIndex: number
): number | null {
  if (key === '\u001b[A') {
    // Up arrow
    return currentIndex > 0 ? currentIndex - 1 : maxIndex;
  } else if (key === '\u001b[B') {
    // Down arrow
    return currentIndex < maxIndex ? currentIndex + 1 : 0;
  }
  return null;
}

export function handleNumberInput(
  key: string,
  maxNumber: number
): number | null {
  if (key.match(/^[0-9]$/)) {
    const num = parseInt(key);
    if (num >= 1 && num <= maxNumber) {
      return num - 1; // Convert to 0-based index
    }
  }
  return null;
}

export function handleLetterInput(
  key: string,
  options: Array<string | { label: string; value?: any }>
): number | null {
  if (key.match(/^[a-zA-Z]$/)) {
    const letter = key.toUpperCase();
    for (let i = 0; i < options.length; i++) {
      const option = options[i];
      if (typeof option !== 'string' && option.label) {
        const match = option.label.match(/^([A-Z])\./);
        if (match && match[1] === letter) {
          return i;
        }
      }
    }
  }
  return null;
}

/**
 * Input prompt rendering
 */
export function renderInputPrompt(text: string, showCursor: boolean = true): void {
  process.stdout.write('\x1b[2K');
  console.log();
  process.stdout.write('\x1b[2K\r');
  process.stdout.write(`  ${theme.muted}${text}${colors.reset}`);
  if (showCursor) {
    process.stdout.write(`${theme.active}_${colors.reset}`);
  }
  console.log();
}

/**
 * Hints rendering
 */
export function renderHints(hintText: string): number {
  if (!hintText) return 0;

  process.stdout.write('\x1b[2K');
  console.log();
  const indent = '  ';
  const indentedHint = hintText.split('\n').map(line => indent + line).join('\n');
  const hintLinesArray = indentedHint.split('\n');
  hintLinesArray.forEach(line => {
    process.stdout.write('\x1b[2K\r');
    console.log(line);
  });

  return 1 + hintLinesArray.length; // +1 for empty line before hints
}

/**
 * Graceful exit with goodbye message
 */
export function exitWithGoodbye(
  state: TerminalState,
  onData: (key: string) => void,
  showGoodbyeFn: () => void
): void {
  // Clean up terminal
  state.stdin.setRawMode(false);
  state.stdin.removeListener('data', onData);

  // Clear rendered content
  if (state.renderedLines > 0) {
    process.stdout.write(`\x1b[${state.renderedLines}A`);
    process.stdout.write('\x1b[J');
  }

  // Show cursor
  process.stdout.write('\x1b[?25h');

  // Show goodbye message
  showGoodbyeFn();

  // Exit
  process.exit(0);
}
