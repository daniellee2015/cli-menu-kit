/**
 * Header component for CLI applications
 * Displays ASCII art, title, description, version and URL
 */

import { applyGradient, colors, uiColors } from '../../core/colors.js';
import { writeLine } from '../../core/terminal.js';
import figlet from 'figlet';

type FigletSize = 'small' | 'medium' | 'large';

/**
 * Header configuration
 */
export interface HeaderConfig {
  /** ASCII art lines (array of strings) */
  asciiArt?: string[];
  /** Generate ASCII art from figlet text (overrides asciiArt when provided) */
  figletText?: string;
  /** Figlet font name (raw figlet name, e.g. "ANSI Shadow", "Standard", "Block") */
  figletFont?: string;
  /** Figlet size preset (default: medium) */
  figletSize?: FigletSize;
  /** Scale figlet output (1-4, default: 1) */
  figletScale?: number;
  /** Optional vertical scale override (0.4-4) */
  figletScaleY?: number;
  /** Application title */
  title?: string;
  /** Optional explicit color for title line */
  titleColor?: string;
  /** Optional ANSI start color for title gradient */
  titleGradientStart?: string;
  /** Optional ANSI end color for title gradient */
  titleGradientEnd?: string;
  /** Application description */
  description?: string;
  /** Optional explicit color for description line */
  descriptionColor?: string;
  /** Optional ANSI start color for description gradient */
  descriptionGradientStart?: string;
  /** Optional ANSI end color for description gradient */
  descriptionGradientEnd?: string;
  /** Version number */
  version?: string;
  /** Project URL */
  url?: string;
  /** Optional menu title (e.g., "请选择功能:") */
  menuTitle?: string;
  /** Box width (default: 60) */
  boxWidth?: number;
  /** Toggle outer border box (default: true) */
  showBoxBorder?: boolean;
  /** Fill header box content area background (default: false) */
  fillBox?: boolean;
  /** ANSI background color for box fill (default: bgBlack) */
  fillBoxColor?: string;
  /** Optional ANSI background gradient start color for box fill */
  fillBoxGradientStart?: string;
  /** Optional ANSI background gradient end color for box fill */
  fillBoxGradientEnd?: string;
  /** Header color (default: cyan) */
  color?: string;
  /** Optional explicit color for ASCII art/logo lines */
  asciiArtColor?: string;
  /** Optional ANSI start color for ASCII art gradient */
  asciiArtGradientStart?: string;
  /** Optional ANSI end color for ASCII art gradient */
  asciiArtGradientEnd?: string;
}

function visibleLength(value: string): number {
  return value.replace(/\x1b\[[0-9;]*m/g, '').length;
}

function padToVisibleWidth(value: string, width: number): string {
  const current = visibleLength(value);
  if (current >= width) {
    return value;
  }
  return value + ' '.repeat(width - current);
}

type RGB = { r: number; g: number; b: number };

function parseBackgroundAnsiToRgb(value: string): RGB | null {
  const trueColor = /^\x1b\[48;2;(\d{1,3});(\d{1,3});(\d{1,3})m$/.exec(value);
  if (trueColor) {
    return {
      r: Math.max(0, Math.min(255, Number.parseInt(trueColor[1], 10))),
      g: Math.max(0, Math.min(255, Number.parseInt(trueColor[2], 10))),
      b: Math.max(0, Math.min(255, Number.parseInt(trueColor[3], 10)))
    };
  }
  const ansi256 = /^\x1b\[48;5;(\d{1,3})m$/.exec(value);
  if (ansi256) {
    const code = Math.max(0, Math.min(255, Number.parseInt(ansi256[1], 10)));
    if (code >= 16 && code <= 231) {
      const n = code - 16;
      const r = Math.floor(n / 36);
      const g = Math.floor((n % 36) / 6);
      const b = n % 6;
      const steps = [0, 95, 135, 175, 215, 255];
      return { r: steps[r], g: steps[g], b: steps[b] };
    }
    if (code >= 232) {
      const gray = 8 + (code - 232) * 10;
      return { r: gray, g: gray, b: gray };
    }
    const basicMap: RGB[] = [
      { r: 0, g: 0, b: 0 },
      { r: 170, g: 0, b: 0 },
      { r: 0, g: 170, b: 0 },
      { r: 170, g: 85, b: 0 },
      { r: 0, g: 0, b: 170 },
      { r: 170, g: 0, b: 170 },
      { r: 0, g: 170, b: 170 },
      { r: 170, g: 170, b: 170 },
      { r: 85, g: 85, b: 85 },
      { r: 255, g: 85, b: 85 },
      { r: 85, g: 255, b: 85 },
      { r: 255, g: 255, b: 85 },
      { r: 85, g: 85, b: 255 },
      { r: 255, g: 85, b: 255 },
      { r: 85, g: 255, b: 255 },
      { r: 255, g: 255, b: 255 }
    ];
    return basicMap[code] ?? null;
  }
  return null;
}

function isTrueColorBackground(value: string): boolean {
  return /^\x1b\[48;2;\d{1,3};\d{1,3};\d{1,3}m$/.test(value);
}

function supportsTrueColorTerminal(): boolean {
  const colorterm = (process.env.COLORTERM ?? '').toLowerCase();
  if (colorterm.includes('truecolor') || colorterm.includes('24bit')) {
    return true;
  }

  const term = (process.env.TERM ?? '').toLowerCase();
  if (term.includes('direct')) {
    return true;
  }

  const program = (process.env.TERM_PROGRAM ?? '').toLowerCase();
  if (program.includes('ghostty') || program.includes('wezterm') || program.includes('iterm') || program.includes('vscode')) {
    return true;
  }

  return false;
}

function applyBackgroundGradient(content: string, startColor: string, endColor: string): string {
  // Compatibility fallback:
  // only use per-character background gradients on truecolor terminals.
  if (!isTrueColorBackground(startColor) || !isTrueColorBackground(endColor) || !supportsTrueColorTerminal()) {
    return `${startColor}${content}${colors.reset}`;
  }

  const start = parseBackgroundAnsiToRgb(startColor);
  const end = parseBackgroundAnsiToRgb(endColor);
  if (!start || !end) {
    return `${startColor}${content}${colors.reset}`;
  }

  const total = Math.max(1, visibleLength(content));
  let out = '';
  let visibleIndex = 0;
  for (let i = 0; i < content.length; i += 1) {
    const ch = content[i] ?? '';
    if (ch === '\x1b') {
      const endIdx = content.indexOf('m', i);
      if (endIdx >= 0) {
        out += content.slice(i, endIdx + 1);
        i = endIdx;
        continue;
      }
    }

    const t = total <= 1 ? 0 : visibleIndex / (total - 1);
    const r = Math.round(start.r + (end.r - start.r) * t);
    const g = Math.round(start.g + (end.g - start.g) * t);
    const b = Math.round(start.b + (end.b - start.b) * t);
    out += `\x1b[48;2;${String(r)};${String(g)};${String(b)}m${ch}`;
    visibleIndex += 1;
  }
  return `${out}${colors.reset}`;
}

const figletCache = new Map<string, string[]>();

function inkCount(line: string): number {
  let count = 0;
  for (const ch of line) {
    if (ch !== ' ' && ch !== '\t') {
      count += 1;
    }
  }
  return count;
}

function trimFigletTailNoise(lines: string[]): string[] {
  const out = [...lines];
  while (out.length > 1) {
    const last = out[out.length - 1] ?? '';
    const prev = out[out.length - 2] ?? '';
    const lastInk = inkCount(last);
    const prevInk = inkCount(prev);
    // Remove very small dangling tail rows (common in Bloody-like fonts).
    if (lastInk <= 1 && prevInk >= 4) {
      out.pop();
      continue;
    }
    break;
  }
  return out;
}

function resolveFigletFont(font: string | undefined, size: FigletSize = 'medium'): string {
  if (font && font.trim().length > 0) {
    return font;
  }
  if (size === 'small') {
    return 'Small';
  }
  if (size === 'large') {
    return 'Big';
  }
  return 'Standard';
}

function resolveFigletLines(text: string, font: string): string[] {
  const cacheKey = `${font}\u0000${text}`;
  const cached = figletCache.get(cacheKey);
  if (cached) {
    return cached;
  }

  try {
    const rendered = figlet.textSync(text, { font });
    const lines = rendered.split('\n');
    while (lines.length > 0 && lines[lines.length - 1].trim().length === 0) {
      lines.pop();
    }
    const cleaned = trimFigletTailNoise(lines);
    figletCache.set(cacheKey, cleaned);
    return cleaned;
  } catch {
    const fallback = figlet.textSync(text, { font: 'Standard' }).split('\n');
    while (fallback.length > 0 && fallback[fallback.length - 1].trim().length === 0) {
      fallback.pop();
    }
    const cleanedFallback = trimFigletTailNoise(fallback);
    figletCache.set(cacheKey, cleanedFallback);
    return cleanedFallback;
  }
}

function scaleLineX(line: string, outCols: number): string {
  const srcCols = line.length;
  if (srcCols === 0 || outCols <= 0) {
    return '';
  }
  if (outCols === srcCols) {
    return line;
  }

  let scaled = '';
  for (let c = 0; c < outCols; c += 1) {
    if (outCols === 1 || srcCols === 1) {
      scaled += line[0] ?? ' ';
      continue;
    }
    const pos = (c * (srcCols - 1)) / (outCols - 1);
    const srcCol = Math.max(0, Math.min(srcCols - 1, Math.round(pos)));
    scaled += line[srcCol] ?? ' ';
  }
  return scaled;
}

function scaleAsciiLines(lines: string[], scaleX: number, scaleY?: number): string[] {
  const sx = Number.isFinite(scaleX) ? Math.max(0.4, Math.min(4, scaleX)) : 1;
  const sy = Number.isFinite(scaleY as number) ? Math.max(0.4, Math.min(4, scaleY as number)) : sx;
  if (Math.abs(sx - 1) < 0.001 && Math.abs(sy - 1) < 0.001) {
    return lines;
  }

  const srcRows = lines.length;
  if (srcRows === 0) {
    return lines;
  }

  const outRows = Math.max(1, Math.round(srcRows * sy));
  const out: string[] = [];
  const sampleIndex = (outIndex: number, outCount: number, srcCount: number): number => {
    if (srcCount <= 1 || outCount <= 1) {
      return 0;
    }
    const ratio = outIndex / (outCount - 1);
    return Math.max(0, Math.min(srcCount - 1, Math.round(ratio * (srcCount - 1))));
  };

  for (let r = 0; r < outRows; r += 1) {
    const srcRow = sampleIndex(r, outRows, srcRows);
    const srcLine = lines[srcRow] ?? '';
    const outCols = Math.max(1, Math.round(srcLine.length * sx));
    out.push(scaleLineX(srcLine, outCols).replace(/\s+$/g, ''));
  }

  return out;
}

function resolveFigletScale(
  scale: number | undefined,
  _explicitFont: string | undefined,
  _size: FigletSize
): number {
  if (typeof scale === 'number' && Number.isFinite(scale)) {
    return Math.max(0.4, Math.min(4, scale));
  }
  return 1;
}

function resolveFigletScaleY(
  scaleY: number | undefined,
  scaleX: number,
  explicitFont: string | undefined
): number {
  if (typeof scaleY === 'number' && Number.isFinite(scaleY)) {
    return Math.max(0.4, Math.min(4, scaleY));
  }

  const normalizedFont = (explicitFont || '').trim().toLowerCase();
  // Keep Pagga crisp: no default Y stretch (its native height is 3 rows).
  if (normalizedFont === 'pagga' && scaleX > 1) {
    return 1;
  }

  return scaleX;
}

/**
 * Render a boxed header with ASCII art, title, and description
 * @param config - Header configuration
 */
export function renderHeader(config: HeaderConfig): void {
  const {
    asciiArt = [],
    figletText,
    figletFont,
    figletSize = 'medium',
    figletScale,
    figletScaleY,
    title = '',
    titleColor,
    titleGradientStart,
    titleGradientEnd,
    description = '',
    descriptionColor,
    descriptionGradientStart,
    descriptionGradientEnd,
    version,
    url,
    menuTitle,
    boxWidth = 60,
    showBoxBorder = true,
    fillBox = false,
    fillBoxColor = colors.bgBlack,
    fillBoxGradientStart,
    fillBoxGradientEnd,
    color = uiColors.border,
    asciiArtColor,
    asciiArtGradientStart,
    asciiArtGradientEnd
  } = config;
  const resolvedFigletFont = resolveFigletFont(figletFont, figletSize);
  const effectiveFigletScale = resolveFigletScale(figletScale, figletFont, figletSize);
  const effectiveScaleY = resolveFigletScaleY(figletScaleY, effectiveFigletScale, resolvedFigletFont);
  const resolvedAsciiArt = figletText
    ? scaleAsciiLines(resolveFigletLines(figletText, resolvedFigletFont), effectiveFigletScale, effectiveScaleY)
    : asciiArt;

  const requestedInnerWidth = Math.max(10, boxWidth - 2);
  const contentLengths: number[] = [];

  for (const line of resolvedAsciiArt) {
    contentLengths.push(visibleLength(`  ${line}`));
  }
  if (title) {
    contentLengths.push(visibleLength(`  ${title}`));
  }
  if (description) {
    contentLengths.push(visibleLength(`  ${description}`));
  }

  const innerWidth = Math.max(requestedInnerWidth, ...contentLengths, 10);
  const boldColor = `${color}${colors.bold}`;
  const applyBoxFill = (content: string): string => {
    if (!fillBox) {
      return content;
    }
    if (fillBoxGradientStart && fillBoxGradientEnd) {
      return applyBackgroundGradient(content, fillBoxGradientStart, fillBoxGradientEnd);
    }
    const replayed = content.replace(/\x1b\[0m/g, `${colors.reset}${fillBoxColor}`);
    return `${fillBoxColor}${replayed}${colors.reset}`;
  };

  const writeSpacer = (): void => {
    if (showBoxBorder) {
      const spacerContent = fillBox ? applyBoxFill(' '.repeat(innerWidth)) : ' '.repeat(innerWidth);
      writeLine(`${boldColor}║${spacerContent}${boldColor}║${colors.reset}`);
    } else if (fillBox) {
      writeLine(` ${applyBoxFill(' '.repeat(innerWidth))}`);
    } else {
      writeLine('');
    }
  };

  const writeContentLine = (content: string, tint?: string): void => {
    const normalized = showBoxBorder || fillBox ? padToVisibleWidth(content, innerWidth) : content;
    if (showBoxBorder) {
      const inner = tint ? `${tint}${normalized}${colors.reset}` : `${colors.reset}${normalized}`;
      const body = fillBox ? applyBoxFill(inner) : inner;
      if (tint) {
        writeLine(`${boldColor}║${body}${boldColor}║${colors.reset}`);
      } else {
        writeLine(`${boldColor}║${body}${boldColor}║${colors.reset}`);
      }
      return;
    }

    const plainLine = tint ? `${tint}${normalized}${colors.reset}` : normalized;
    if (fillBox) {
      writeLine(` ${applyBoxFill(plainLine)}`);
      return;
    }
    writeLine(plainLine);
  };

  // Top border
  writeLine('');
  if (showBoxBorder) {
    writeLine(`${boldColor}╔${'═'.repeat(innerWidth)}╗${colors.reset}`);
  }
  writeSpacer();

  // ASCII art (left-aligned with 2 spaces padding)
  if (resolvedAsciiArt.length > 0) {
    resolvedAsciiArt.forEach(line => {
      const paddedLine = showBoxBorder ? `  ${line}`.padEnd(innerWidth, ' ') : `  ${line}`;
      const artLine = asciiArtGradientStart && asciiArtGradientEnd
        ? `${applyGradient(paddedLine, asciiArtGradientStart, asciiArtGradientEnd)}`
        : `${(asciiArtColor || color)}${paddedLine}${colors.reset}`;
      writeContentLine(artLine);
    });
    writeSpacer();
  }

  // Title (left-aligned with 2 spaces padding)
  if (title) {
    const paddedTitle = showBoxBorder ? `  ${title}`.padEnd(innerWidth, ' ') : `  ${title}`;
    const titleLine = titleGradientStart && titleGradientEnd
      ? applyGradient(paddedTitle, titleGradientStart, titleGradientEnd)
      : paddedTitle;
    writeContentLine(titleLine, titleGradientStart && titleGradientEnd ? undefined : titleColor);
    writeSpacer();
  }

  // Description (left-aligned with 2 spaces padding)
  if (description) {
    const textContent = `  ${description}`;
    const paddedText = showBoxBorder ? textContent.padEnd(innerWidth, ' ') : textContent;
    const descLine = descriptionGradientStart && descriptionGradientEnd
      ? applyGradient(paddedText, descriptionGradientStart, descriptionGradientEnd)
      : paddedText;
    writeContentLine(
      descLine,
      descriptionGradientStart && descriptionGradientEnd
        ? undefined
        : (descriptionColor || uiColors.textSecondary)
    );
    writeSpacer();
  }

  // Bottom border
  if (showBoxBorder) {
    writeLine(`${boldColor}╚${'═'.repeat(innerWidth)}╝${colors.reset}`);
  }

  // Blank line after box
  writeLine('');

  // Version and URL (outside the box, with colors)
  if (version || url) {
    const versionText = version ? `${uiColors.textSecondary}Version: ${colors.reset}${uiColors.primary}${version}${colors.reset}` : '';
    const urlText = url ? `${uiColors.primary}${url}${colors.reset}` : '';
    const separator = version && url ? `${uiColors.textSecondary}  |  ${colors.reset}` : '';
    writeLine(`  ${versionText}${separator}${urlText}`);
  }

  // Menu title (optional)
  if (menuTitle) {
    writeLine('');
    writeLine(`${color}  ${menuTitle}${colors.reset}`);
  }
}
