/**
 * Keyboard handling utilities for CLI Menu Kit
 * Handles key detection and special key combinations
 */

/**
 * Key codes for special keys
 */
export const KEY_CODES = {
  // Arrow keys
  UP: '\x1b[A',
  DOWN: '\x1b[B',
  RIGHT: '\x1b[C',
  LEFT: '\x1b[D',

  // Control keys
  ENTER: '\r',
  SPACE: ' ',
  BACKSPACE: '\x7f',
  DELETE: '\x1b[3~',
  ESCAPE: '\x1b',
  TAB: '\t',

  // Ctrl combinations
  CTRL_C: '\x03',
  CTRL_D: '\x04',
  CTRL_Z: '\x1a',
  CTRL_A: '\x01',
  CTRL_E: '\x05',
  CTRL_U: '\x15',
  CTRL_K: '\x0b',
  CTRL_L: '\x0c',

  // Home/End
  HOME: '\x1b[H',
  END: '\x1b[F'
} as const;

/**
 * Check if key is an arrow key
 * @param key - Key input
 * @returns True if arrow key
 */
export function isArrowKey(key: string): boolean {
  return key === KEY_CODES.UP || key === KEY_CODES.DOWN ||
         key === KEY_CODES.LEFT || key === KEY_CODES.RIGHT;
}

/**
 * Check if key is a number key (0-9)
 * @param key - Key input
 * @returns True if number key
 */
export function isNumberKey(key: string): boolean {
  return /^[0-9]$/.test(key);
}

/**
 * Check if key is a letter key (a-z, A-Z)
 * @param key - Key input
 * @returns True if letter key
 */
export function isLetterKey(key: string): boolean {
  return /^[a-zA-Z]$/.test(key);
}

/**
 * Check if key is alphanumeric (0-9, a-z, A-Z)
 * @param key - Key input
 * @returns True if alphanumeric
 */
export function isAlphanumeric(key: string): boolean {
  return /^[0-9a-zA-Z]$/.test(key);
}

/**
 * Check if key is printable character
 * @param key - Key input
 * @returns True if printable
 */
export function isPrintable(key: string): boolean {
  return key.length === 1 && key >= ' ' && key <= '~';
}

/**
 * Check if key is Ctrl+C
 * @param key - Key input
 * @returns True if Ctrl+C
 */
export function isCtrlC(key: string): boolean {
  return key === KEY_CODES.CTRL_C;
}

/**
 * Check if key is Enter
 * @param key - Key input
 * @returns True if Enter
 */
export function isEnter(key: string): boolean {
  return key === KEY_CODES.ENTER || key === '\n';
}

/**
 * Check if key is Space
 * @param key - Key input
 * @returns True if Space
 */
export function isSpace(key: string): boolean {
  return key === KEY_CODES.SPACE;
}

/**
 * Check if key is Backspace
 * @param key - Key input
 * @returns True if Backspace
 */
export function isBackspace(key: string): boolean {
  return key === KEY_CODES.BACKSPACE || key === '\b';
}

/**
 * Check if key is Escape
 * @param key - Key input
 * @returns True if Escape
 */
export function isEscape(key: string): boolean {
  return key === KEY_CODES.ESCAPE;
}

/**
 * Parse number from key input
 * @param key - Key input
 * @returns Number or null if not a number
 */
export function parseNumber(key: string): number | null {
  if (isNumberKey(key)) {
    return parseInt(key, 10);
  }
  return null;
}

/**
 * Normalize letter key to lowercase
 * @param key - Key input
 * @returns Lowercase letter or original key
 */
export function normalizeLetter(key: string): string {
  if (isLetterKey(key)) {
    return key.toLowerCase();
  }
  return key;
}

/**
 * Check if input is a command (starts with /)
 * @param input - Input string
 * @returns True if command
 */
export function isCommand(input: string): boolean {
  return input.startsWith('/');
}

/**
 * Parse command from input
 * @param input - Input string
 * @returns Command name (without /) or null
 */
export function parseCommand(input: string): string | null {
  if (isCommand(input)) {
    return input.slice(1).toLowerCase();
  }
  return null;
}

/**
 * Key event handler type
 */
export type KeyHandler = (key: string) => void;

/**
 * Create a keyboard listener
 * @param stdin - Input stream
 * @param handler - Key handler function
 * @returns Cleanup function
 */
export function createKeyboardListener(
  stdin: NodeJS.ReadStream,
  handler: KeyHandler
): () => void {
  stdin.on('data', handler);

  return () => {
    stdin.removeListener('data', handler);
  };
}
