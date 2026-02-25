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

const ANSI_ESCAPE_PATTERN =
  /[\u001B\u009B][[\]()#;?]*(?:(?:[a-zA-Z\d]*(?:;[a-zA-Z\d]*)*)?\u0007|(?:\d{1,4}(?:;\d{0,4})*)?[\dA-PR-TZcf-nq-uy=><~])/g;
const TAB_WIDTH = 4;

/**
 * Remove ANSI escape sequences from a string.
 * This is required when calculating the visible width in terminal cells.
 */
export function stripAnsi(text: string): string {
  return text.replace(ANSI_ESCAPE_PATTERN, '');
}

function isCombiningCodePoint(codePoint: number): boolean {
  return (
    (codePoint >= 0x0300 && codePoint <= 0x036F) || // Combining Diacritical Marks
    (codePoint >= 0x1AB0 && codePoint <= 0x1AFF) || // Combining Diacritical Marks Extended
    (codePoint >= 0x1DC0 && codePoint <= 0x1DFF) || // Combining Diacritical Marks Supplement
    (codePoint >= 0x20D0 && codePoint <= 0x20FF) || // Combining Diacritical Marks for Symbols
    (codePoint >= 0xFE20 && codePoint <= 0xFE2F) // Combining Half Marks
  );
}

function isFullWidthCodePoint(codePoint: number): boolean {
  if (codePoint < 0x1100) {
    return false;
  }

  return (
    codePoint <= 0x115F ||
    codePoint === 0x2329 ||
    codePoint === 0x232A ||
    ((codePoint >= 0x2E80 && codePoint <= 0x3247) && codePoint !== 0x303F) ||
    (codePoint >= 0x3250 && codePoint <= 0x4DBF) ||
    (codePoint >= 0x4E00 && codePoint <= 0xA4C6) ||
    (codePoint >= 0xA960 && codePoint <= 0xA97C) ||
    (codePoint >= 0xAC00 && codePoint <= 0xD7A3) ||
    (codePoint >= 0xF900 && codePoint <= 0xFAFF) ||
    (codePoint >= 0xFE10 && codePoint <= 0xFE19) ||
    (codePoint >= 0xFE30 && codePoint <= 0xFE6B) ||
    (codePoint >= 0xFF01 && codePoint <= 0xFF60) ||
    (codePoint >= 0xFFE0 && codePoint <= 0xFFE6) ||
    (codePoint >= 0x1B000 && codePoint <= 0x1B001) ||
    (codePoint >= 0x1F200 && codePoint <= 0x1F251) ||
    (codePoint >= 0x20000 && codePoint <= 0x3FFFD)
  );
}

function getCharacterWidth(char: string, currentLineWidth: number): number {
  if (char === '\t') {
    const remainder = currentLineWidth % TAB_WIDTH;
    return remainder === 0 ? TAB_WIDTH : TAB_WIDTH - remainder;
  }

  const codePoint = char.codePointAt(0);
  if (codePoint === undefined) {
    return 0;
  }

  // Control characters and zero-width joiners/modifiers.
  if (
    codePoint <= 0x001F ||
    (codePoint >= 0x007F && codePoint <= 0x009F) ||
    codePoint === 0x200D ||
    (codePoint >= 0xFE00 && codePoint <= 0xFE0F) ||
    isCombiningCodePoint(codePoint)
  ) {
    return 0;
  }

  if (isFullWidthCodePoint(codePoint) || (codePoint >= 0x1F300 && codePoint <= 0x1FAFF)) {
    return 2;
  }

  return 1;
}

/**
 * Calculate the visible width of a string in terminal cells.
 */
export function getDisplayWidth(text: string): number {
  const plain = stripAnsi(text);
  let width = 0;

  for (const char of plain) {
    width += getCharacterWidth(char, width);
  }

  return width;
}

/**
 * Count how many visual rows the text occupies after terminal wrapping.
 */
export function countVisualLines(text: string, terminalWidth: number = getTerminalWidth()): number {
  const width = Math.max(1, terminalWidth);
  const lines = text.split(/\r\n|\r|\n/);
  let lineCount = 0;

  for (const line of lines) {
    const visualWidth = getDisplayWidth(line);
    lineCount += Math.max(1, Math.ceil(visualWidth / width));
  }

  return lineCount;
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
