/**
 * Hint Manager - Manages hints from multiple components with priority
 *
 * Allows multiple components to set hints with different priorities.
 * The highest priority hint is displayed.
 */

import { EventEmitter } from 'events';

interface HintEntry {
  text: string;
  priority: number;
  timestamp: number;
}

export class HintManager extends EventEmitter {
  private entries = new Map<string, HintEntry>();

  /**
   * Set a hint with a token and priority
   * @param token - Unique identifier for this hint source
   * @param text - Hint text to display
   * @param priority - Higher priority hints are displayed first (default: 0)
   */
  set(token: string, text: string, priority: number = 0): void {
    this.entries.set(token, {
      text,
      priority,
      timestamp: Date.now()
    });

    this.emit('change', this.current());
  }

  /**
   * Clear a hint by token
   */
  clear(token: string): void {
    if (this.entries.delete(token)) {
      this.emit('change', this.current());
    }
  }

  /**
   * Get the current highest priority hint
   */
  current(): string {
    const list = Array.from(this.entries.values());

    if (list.length === 0) {
      return '';
    }

    // Sort by priority (descending), then by timestamp (most recent first)
    list.sort((a, b) => {
      if (b.priority !== a.priority) {
        return b.priority - a.priority;
      }
      return b.timestamp - a.timestamp;
    });

    return list[0].text;
  }

  /**
   * Clear all hints
   */
  clearAll(): void {
    if (this.entries.size > 0) {
      this.entries.clear();
      this.emit('change', '');
    }
  }
}
