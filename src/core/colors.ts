/**
 * Color system for CLI Menu Kit
 * Supports single colors and two-color gradients
 */

/**
 * ANSI color codes
 */
export const colors = {
  // Reset
  reset: '\x1b[0m',

  // Basic colors
  black: '\x1b[30m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',

  // Bright colors
  brightBlack: '\x1b[90m',
  brightRed: '\x1b[91m',
  brightGreen: '\x1b[92m',
  brightYellow: '\x1b[93m',
  brightBlue: '\x1b[94m',
  brightMagenta: '\x1b[95m',
  brightCyan: '\x1b[96m',
  brightWhite: '\x1b[97m',

  // Background colors
  bgBlack: '\x1b[40m',
  bgRed: '\x1b[41m',
  bgGreen: '\x1b[42m',
  bgYellow: '\x1b[43m',
  bgBlue: '\x1b[44m',
  bgMagenta: '\x1b[45m',
  bgCyan: '\x1b[46m',
  bgWhite: '\x1b[47m',

  // Styles
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  italic: '\x1b[3m',
  underline: '\x1b[4m',
  inverse: '\x1b[7m',
  hidden: '\x1b[8m',
  strikethrough: '\x1b[9m'
} as const;

/**
 * Semantic color hierarchy for UI elements
 * Defines consistent colors for different levels of information
 */
export const uiColors = {
  // Primary elements
  primary: colors.cyan,           // Main interactive elements, highlights
  accent: colors.blue,            // Secondary highlights, links

  // Text hierarchy
  textPrimary: colors.reset,      // Main text (black/default)
  textSecondary: colors.dim,      // Descriptions, hints, less important text
  textMuted: colors.brightBlack,  // Very subtle text

  // Status colors
  success: colors.green,          // Success states, confirmations
  error: colors.red,              // Errors, warnings, exit
  warning: colors.yellow,         // Warnings, cautions
  info: colors.blue,              // Informational messages

  // Interactive elements
  cursor: colors.cyan,            // Cursor indicator
  selected: colors.green,         // Selected items
  disabled: colors.dim,           // Disabled/inactive items

  // Structural elements
  border: colors.cyan,            // Borders, frames
  separator: colors.dim,          // Separators, dividers
  prefix: colors.dim              // Number/letter prefixes
} as const;

/**
 * RGB color representation
 */
interface RGB {
  r: number;
  g: number;
  b: number;
}

/**
 * Parse ANSI color code to RGB values
 * Supports basic 8 colors and bright variants
 */
function parseColorToRGB(colorCode: string): RGB {
  // Map of ANSI codes to approximate RGB values
  const colorMap: Record<string, RGB> = {
    '\x1b[30m': { r: 0, g: 0, b: 0 },       // black
    '\x1b[31m': { r: 170, g: 0, b: 0 },     // red
    '\x1b[32m': { r: 0, g: 170, b: 0 },     // green
    '\x1b[33m': { r: 170, g: 85, b: 0 },    // yellow
    '\x1b[34m': { r: 0, g: 0, b: 170 },     // blue
    '\x1b[35m': { r: 170, g: 0, b: 170 },   // magenta
    '\x1b[36m': { r: 0, g: 170, b: 170 },   // cyan
    '\x1b[37m': { r: 170, g: 170, b: 170 }, // white
    '\x1b[90m': { r: 85, g: 85, b: 85 },    // bright black
    '\x1b[91m': { r: 255, g: 85, b: 85 },   // bright red
    '\x1b[92m': { r: 85, g: 255, b: 85 },   // bright green
    '\x1b[93m': { r: 255, g: 255, b: 85 },  // bright yellow
    '\x1b[94m': { r: 85, g: 85, b: 255 },   // bright blue
    '\x1b[95m': { r: 255, g: 85, b: 255 },  // bright magenta
    '\x1b[96m': { r: 85, g: 255, b: 255 },  // bright cyan
    '\x1b[97m': { r: 255, g: 255, b: 255 }  // bright white
  };

  return colorMap[colorCode] || { r: 170, g: 170, b: 170 };
}

/**
 * Convert RGB to ANSI 256-color code
 */
function rgbToAnsi256(r: number, g: number, b: number): string {
  // Use 256-color mode for better gradient quality
  const code = 16 + 36 * Math.round(r / 255 * 5) + 6 * Math.round(g / 255 * 5) + Math.round(b / 255 * 5);
  return `\x1b[38;5;${code}m`;
}

/**
 * Interpolate between two RGB colors
 */
function interpolateRGB(color1: RGB, color2: RGB, factor: number): RGB {
  return {
    r: Math.round(color1.r + (color2.r - color1.r) * factor),
    g: Math.round(color1.g + (color2.g - color1.g) * factor),
    b: Math.round(color1.b + (color2.b - color1.b) * factor)
  };
}

/**
 * Create a gradient between two colors
 * @param startColor - Starting ANSI color code
 * @param endColor - Ending ANSI color code
 * @param steps - Number of steps in the gradient
 * @returns Array of ANSI color codes for each step
 */
export function createGradient(startColor: string, endColor: string, steps: number): string[] {
  if (steps <= 0) return [];
  if (steps === 1) return [startColor];

  const start = parseColorToRGB(startColor);
  const end = parseColorToRGB(endColor);
  const gradient: string[] = [];

  for (let i = 0; i < steps; i++) {
    const factor = i / (steps - 1);
    const rgb = interpolateRGB(start, end, factor);
    gradient.push(rgbToAnsi256(rgb.r, rgb.g, rgb.b));
  }

  return gradient;
}

/**
 * Apply gradient to text
 * @param text - Text to colorize
 * @param startColor - Starting color
 * @param endColor - Ending color
 * @returns Colorized text with gradient
 */
export function applyGradient(text: string, startColor: string, endColor: string): string {
  const chars = text.split('');
  const gradient = createGradient(startColor, endColor, chars.length);

  return chars.map((char, i) => `${gradient[i]}${char}`).join('') + colors.reset;
}

/**
 * Apply single color to text
 * @param text - Text to colorize
 * @param color - ANSI color code
 * @returns Colorized text
 */
export function colorize(text: string, color: string): string {
  return `${color}${text}${colors.reset}`;
}
