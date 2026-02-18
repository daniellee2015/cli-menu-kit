/**
 * Virtual scrolling utilities for rendering large lists efficiently
 * by only displaying a visible window of items.
 */

export interface VirtualScrollOptions<T> {
  /** All items in the list */
  items: T[];
  /** Current cursor/focus position (index in items array) */
  cursorIndex: number;
  /** Target number of lines to display */
  targetLines: number;
  /** Function to calculate how many lines each item will occupy when rendered */
  getItemLineCount: (item: T, index: number) => number;
}

export interface VirtualScrollResult {
  /** Start index of visible range (inclusive) */
  visibleStart: number;
  /** End index of visible range (exclusive) */
  visibleEnd: number;
  /** Actual number of lines that will be rendered */
  actualLines: number;
  /** Whether virtual scrolling is active (content exceeds target) */
  isScrolled: boolean;
  /** Whether there are items before the visible range */
  hasItemsBefore: boolean;
  /** Whether there are items after the visible range */
  hasItemsAfter: boolean;
}

/**
 * Calculate visible range for virtual scrolling based on line count.
 *
 * This function maintains a stable viewport height by calculating which items
 * to display based on their actual line count, not just item count. This prevents
 * height jumping when items have varying heights (e.g., separators with descriptions).
 *
 * Algorithm:
 * 1. Calculate total lines needed for all items
 * 2. If total <= targetLines, show everything (no scrolling)
 * 3. Otherwise, create a window centered on cursor:
 *    - Start from cursor position
 *    - Expand downward until reaching target or end
 *    - Expand upward to fill remaining space
 *    - Expand downward again if space remains
 *
 * @example
 * ```typescript
 * const result = calculateVirtualScroll({
 *   items: menuOptions,
 *   cursorIndex: 10,
 *   targetLines: 30,
 *   getItemLineCount: (item, index) => {
 *     if (item.type === 'separator') {
 *       return 1 + (item.description ? 1 : 0) + (index > 0 ? 1 : 0);
 *     }
 *     return 1;
 *   }
 * });
 *
 * // Render only visible items
 * for (let i = result.visibleStart; i < result.visibleEnd; i++) {
 *   renderItem(items[i]);
 * }
 * ```
 */
export function calculateVirtualScroll<T>(
  options: VirtualScrollOptions<T>
): VirtualScrollResult {
  const { items, cursorIndex, targetLines, getItemLineCount } = options;

  // Validate inputs
  if (items.length === 0) {
    return {
      visibleStart: 0,
      visibleEnd: 0,
      actualLines: 0,
      isScrolled: false,
      hasItemsBefore: false,
      hasItemsAfter: false
    };
  }

  if (cursorIndex < 0 || cursorIndex >= items.length) {
    throw new Error(`cursorIndex ${cursorIndex} is out of bounds [0, ${items.length})`);
  }

  // Calculate total lines for all items
  const estimatedTotalLines = items.reduce((sum, item, idx) => {
    return sum + getItemLineCount(item, idx);
  }, 0);

  // If content fits within target, show everything
  if (estimatedTotalLines <= targetLines) {
    return {
      visibleStart: 0,
      visibleEnd: items.length,
      actualLines: estimatedTotalLines,
      isScrolled: false,
      hasItemsBefore: false,
      hasItemsAfter: false
    };
  }

  // Virtual scrolling: maintain constant line count
  let visibleStart = cursorIndex;
  let visibleEnd = cursorIndex + 1;
  let currentLines = getItemLineCount(items[cursorIndex], cursorIndex);

  // Phase 1: Expand downward from cursor
  while (visibleEnd < items.length && currentLines < targetLines) {
    const nextLines = getItemLineCount(items[visibleEnd], visibleEnd);
    if (currentLines + nextLines <= targetLines) {
      currentLines += nextLines;
      visibleEnd++;
    } else {
      break;
    }
  }

  // Phase 2: Expand upward to fill remaining space
  while (visibleStart > 0 && currentLines < targetLines) {
    const prevLines = getItemLineCount(items[visibleStart - 1], visibleStart - 1);
    if (currentLines + prevLines <= targetLines) {
      visibleStart--;
      currentLines += prevLines;
    } else {
      break;
    }
  }

  // Phase 3: Try expanding downward again if space remains
  while (visibleEnd < items.length && currentLines < targetLines) {
    const nextLines = getItemLineCount(items[visibleEnd], visibleEnd);
    if (currentLines + nextLines <= targetLines) {
      currentLines += nextLines;
      visibleEnd++;
    } else {
      break;
    }
  }

  return {
    visibleStart,
    visibleEnd,
    actualLines: currentLines,
    isScrolled: true,
    hasItemsBefore: visibleStart > 0,
    hasItemsAfter: visibleEnd < items.length
  };
}
