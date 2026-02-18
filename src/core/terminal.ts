/**
 * Terminal control utilities for CLI Menu Kit
 * Handles cursor movement, screen clearing, and terminal state
 */

/**
 * Terminal state tracking
 */
export interface TerminalState {
  stdin: NodeJS.ReadStream;
  renderedLines: number;
  isRawMode: boolean;
  useAltScreen: boolean;
}

/**
 * Initialize terminal for interactive mode
 * @param useAltScreen - Whether to use alternate screen buffer (prevents scroll issues)
 * @returns Terminal state object
 */
export function initTerminal(useAltScreen: boolean = false): TerminalState {
  const stdin = process.stdin;

  // Disable all mouse tracking modes BEFORE enabling raw mode
  process.stdout.write('\x1b[?1000l'); // Disable normal mouse tracking
  process.stdout.write('\x1b[?1001l'); // Disable highlight mouse tracking
  process.stdout.write('\x1b[?1002l'); // Disable button event tracking
  process.stdout.write('\x1b[?1003l'); // Disable any event tracking
  process.stdout.write('\x1b[?1004l'); // Disable focus events
  process.stdout.write('\x1b[?1005l'); // Disable UTF-8 mouse mode
  process.stdout.write('\x1b[?1006l'); // Disable SGR extended mouse mode
  process.stdout.write('\x1b[?1015l'); // Disable urxvt mouse mode

  // Enable raw mode for character-by-character input
  stdin.setRawMode(true);
  stdin.resume();
  stdin.setEncoding('utf8');

  // Use alternate screen buffer if requested
  if (useAltScreen) {
    process.stdout.write('\x1b[?1049h'); // Enable alternate screen
    process.stdout.write('\x1b[H');      // Move cursor to home
  }

  // Hide cursor
  process.stdout.write('\x1b[?25l');

  return {
    stdin,
    renderedLines: 0,
    isRawMode: true,
    useAltScreen
  };
}

/**
 * Restore terminal to normal mode
 * @param state - Terminal state
 */
export function restoreTerminal(state: TerminalState): void {
  if (state.isRawMode) {
    state.stdin.setRawMode(false);
    state.isRawMode = false;
  }

  // Restore alternate screen if it was used
  if (state.useAltScreen) {
    process.stdout.write('\x1b[?1049l'); // Disable alternate screen
  }

  // Show cursor
  process.stdout.write('\x1b[?25h');

  state.stdin.pause();
}

/**
 * Clear the current menu display
 * Only clears the lines that were rendered by this menu
 * @param state - Terminal state
 */
export function clearMenu(state: TerminalState): void {
  if (state.renderedLines > 0) {
    // Move cursor up to the start of the menu
    process.stdout.write(`\x1b[${state.renderedLines}A`);

    // Clear each line individually
    for (let i = 0; i < state.renderedLines; i++) {
      process.stdout.write('\x1b[2K'); // Clear entire line
      if (i < state.renderedLines - 1) {
        process.stdout.write('\x1b[1B'); // Move down one line
      }
    }

    // Move cursor back to start position
    // After loop, cursor is at the last rendered line
    // To get back to line 1, move up (renderedLines - 1)
    // Note: \x1b[0A defaults to 1 in ANSI spec, so skip when renderedLines === 1
    if (state.renderedLines > 1) {
      process.stdout.write(`\x1b[${state.renderedLines - 1}A`);
    }

    state.renderedLines = 0;
  }
}

/**
 * Clear a specific number of lines
 * @param lines - Number of lines to clear
 */
export function clearLines(lines: number): void {
  if (lines > 0) {
    process.stdout.write(`\x1b[${lines}A`);
    process.stdout.write('\x1b[J');
  }
}

/**
 * Move cursor up by N lines
 * @param lines - Number of lines to move up
 */
export function moveCursorUp(lines: number): void {
  if (lines > 0) {
    process.stdout.write(`\x1b[${lines}A`);
  }
}

/**
 * Move cursor down by N lines
 * @param lines - Number of lines to move down
 */
export function moveCursorDown(lines: number): void {
  if (lines > 0) {
    process.stdout.write(`\x1b[${lines}B`);
  }
}

/**
 * Move cursor to beginning of line
 */
export function moveCursorToLineStart(): void {
  process.stdout.write('\r');
}

/**
 * Clear current line
 */
export function clearCurrentLine(): void {
  process.stdout.write('\r\x1b[K');
}

/**
 * Hide cursor
 */
export function hideCursor(): void {
  process.stdout.write('\x1b[?25l');
}

/**
 * Show cursor
 */
export function showCursor(): void {
  process.stdout.write('\x1b[?25h');
}

/**
 * Write text without newline
 * @param text - Text to write
 */
export function write(text: string): void {
  process.stdout.write(text);
}

/**
 * Write text with newline
 * @param text - Text to write
 */
export function writeLine(text: string): void {
  process.stdout.write(text + '\n');
}

/**
 * Get terminal width
 * @returns Terminal width in columns
 */
export function getTerminalWidth(): number {
  return process.stdout.columns || 80;
}

/**
 * Get terminal height
 * @returns Terminal height in rows
 */
export function getTerminalHeight(): number {
  return process.stdout.rows || 24;
}

/**
 * Clear entire screen
 */
export function clearScreen(): void {
  process.stdout.write('\x1b[2J\x1b[H');
}

/**
 * Exit with cleanup and goodbye message
 * @param state - Terminal state
 * @param onData - Data listener to remove
 * @param showGoodbyeFn - Function to show goodbye message
 */
export function exitWithGoodbye(
  state: TerminalState,
  onData: (key: string) => void,
  showGoodbyeFn: () => void
): void {
  // Remove listener
  state.stdin.removeListener('data', onData);

  // Clear menu
  clearMenu(state);

  // Restore terminal
  restoreTerminal(state);

  // Show goodbye message
  showGoodbyeFn();

  // Exit
  process.exit(0);
}
