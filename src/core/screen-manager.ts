/**
 * Screen Manager - Manages screen regions with fixed-height layout
 *
 * Uses absolute cursor positioning and per-region caching for efficient updates.
 * Only updates regions that have changed (diff-based rendering).
 */

const CSI = '\x1b[';

export interface Rect {
  top: number;
  left: number;
  width: number;
  height: number;
}

/**
 * Fit text to exact width by padding or truncating
 */
function fitText(text: string, width: number): string {
  // Simple implementation - can be enhanced with ANSI-aware width calculation
  const stripped = text.replace(/\x1b\[[0-9;]*m/g, ''); // Strip ANSI codes for length calc
  const len = stripped.length;

  if (len === width) return text;
  if (len < width) return text + ' '.repeat(width - len);

  // Truncate - preserve ANSI codes at start if present
  const ansiMatch = text.match(/^(\x1b\[[0-9;]*m)*/);
  const prefix = ansiMatch ? ansiMatch[0] : '';
  const content = text.slice(prefix.length);
  return prefix + content.slice(0, width);
}

export class ScreenManager {
  private cache = new Map<string, string[]>();
  private regions = new Map<string, Rect>();
  private isAltScreen = false;

  /**
   * Enter alternate screen buffer and hide cursor
   */
  enter(): void {
    if (!this.isAltScreen) {
      process.stdout.write(`${CSI}?1049h${CSI}?25l`);
      this.isAltScreen = true;
    }
  }

  /**
   * Exit alternate screen buffer and show cursor
   */
  exit(): void {
    if (this.isAltScreen) {
      process.stdout.write(`${CSI}?25h${CSI}?1049l`);
      this.isAltScreen = false;
    }
  }

  /**
   * Move cursor to absolute position (1-based)
   */
  moveTo(row: number, col: number): void {
    process.stdout.write(`${CSI}${row};${col}H`);
  }

  /**
   * Register a fixed-height region
   */
  registerRegion(id: string, rect: Rect): void {
    this.regions.set(id, rect);
  }

  /**
   * Render a region with diff-based updates
   * Only updates lines that have changed
   */
  renderRegion(id: string, lines: string[]): void {
    const rect = this.regions.get(id);
    if (!rect) {
      throw new Error(`Region ${id} not registered`);
    }

    const prev = this.cache.get(id) ?? [];
    const next = Array.from({ length: rect.height }, (_, i) =>
      fitText(lines[i] ?? '', rect.width)
    );

    // Update only changed lines
    for (let i = 0; i < rect.height; i++) {
      if (next[i] === prev[i]) continue;

      this.moveTo(rect.top + i, rect.left);
      process.stdout.write(next[i]);
    }

    this.cache.set(id, next);
  }

  /**
   * Clear a region (fill with spaces)
   */
  clearRegion(id: string): void {
    const rect = this.regions.get(id);
    if (!rect) {
      throw new Error(`Region ${id} not registered`);
    }

    const blank = ' '.repeat(rect.width);
    for (let i = 0; i < rect.height; i++) {
      this.moveTo(rect.top + i, rect.left);
      process.stdout.write(blank);
    }

    this.cache.set(id, Array(rect.height).fill(blank));
  }

  /**
   * Invalidate all cached content (forces full re-render on next update)
   */
  invalidateAll(): void {
    this.cache.clear();
  }

  /**
   * Reset manager state
   */
  reset(): void {
    this.cache.clear();
    this.regions.clear();
  }

  /**
   * Get region rect
   */
  getRegion(id: string): Rect | undefined {
    return this.regions.get(id);
  }
}
