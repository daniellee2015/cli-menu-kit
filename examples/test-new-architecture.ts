/**
 * Test new architecture with fixed regions and diff-based rendering
 */

import readline from 'readline';
import { screenManager, hintManager, computeLayout, type Rect, type Component } from '../src/layout.js';

// App state
interface AppState {
  title: string;
  menuItems: string[];
  selected: number;
}

const state: AppState = {
  title: 'Test Menu',
  menuItems: ['Option 1', 'Option 2', 'Option 3', 'Option 4', 'Exit'],
  selected: 0
};

// Header component
const headerComponent: Component = {
  type: 'header',
  regionId: 'header',
  render: (rect: Rect) => {
    return [
      state.title,
      '─'.repeat(rect.width),
      ''
    ];
  }
};

// Menu component
const menuComponent: Component = {
  type: 'menu',
  regionId: 'main',
  render: (rect: Rect) => {
    const lines: string[] = [];
    const visibleCount = rect.height;

    for (let i = 0; i < Math.min(visibleCount, state.menuItems.length); i++) {
      const item = state.menuItems[i];
      const isSelected = i === state.selected;
      const prefix = isSelected ? '\x1b[32m>\x1b[0m' : ' ';
      const text = isSelected ? `\x1b[32m\x1b[1m${item}\x1b[0m` : item;
      lines.push(`${prefix} ${text}`);
    }

    // Fill remaining lines
    while (lines.length < visibleCount) {
      lines.push('');
    }

    return lines;
  },
  interact: async () => {
    return new Promise<void>((resolve) => {
      readline.emitKeypressEvents(process.stdin);
      if (process.stdin.isTTY) process.stdin.setRawMode(true);

      const onKey = (_: string, key: readline.Key) => {
        if (key.ctrl && key.name === 'c') {
          cleanup();
          process.exit(0);
        }

        if (key.name === 'up') {
          state.selected = (state.selected - 1 + state.menuItems.length) % state.menuItems.length;
          const layout = computeLayout();
          const lines = menuComponent.render(layout.main);
          screenManager.renderRegion('main', lines);

          // Update hint based on selection
          hintManager.set('menu', `Selected: ${state.menuItems[state.selected]}`, 10);
        } else if (key.name === 'down') {
          state.selected = (state.selected + 1) % state.menuItems.length;
          const layout = computeLayout();
          const lines = menuComponent.render(layout.main);
          screenManager.renderRegion('main', lines);

          // Update hint
          hintManager.set('menu', `Selected: ${state.menuItems[state.selected]}`, 10);
        } else if (key.name === 'return') {
          cleanup();
          resolve();
        }
      };

      function cleanup() {
        process.stdin.off('keypress', onKey);
        if (process.stdin.isTTY) process.stdin.setRawMode(false);
        hintManager.clear('menu');
      }

      process.stdin.on('keypress', onKey);
    });
  }
};

// Hints component
const hintsComponent: Component = {
  type: 'hints',
  regionId: 'footerHints',
  render: (rect: Rect) => {
    return [hintManager.current()];
  }
};

// Prompt component
const promptComponent: Component = {
  type: 'prompt',
  regionId: 'footerPrompt',
  render: (rect: Rect) => {
    return ['↑/↓ Navigate • Enter Select • Ctrl+C Exit'];
  }
};

// Main function
async function main() {
  // Enter alt screen
  screenManager.enter();

  // Compute layout
  const layout = computeLayout();

  // Register regions
  screenManager.registerRegion('header', layout.header);
  screenManager.registerRegion('main', layout.main);
  screenManager.registerRegion('footerHints', layout.footerHints);
  screenManager.registerRegion('footerPrompt', layout.footerPrompt);

  // Phase 1: Initial render
  screenManager.renderRegion('header', headerComponent.render(layout.header));
  screenManager.renderRegion('main', menuComponent.render(layout.main));
  screenManager.renderRegion('footerHints', hintsComponent.render(layout.footerHints));
  screenManager.renderRegion('footerPrompt', promptComponent.render(layout.footerPrompt));

  // Setup hint manager listener
  hintManager.on('change', (text: string) => {
    screenManager.renderRegion('footerHints', [text]);
  });

  // Set initial hint
  hintManager.set('menu', `Selected: ${state.menuItems[state.selected]}`, 10);

  // Phase 2: Handle interaction
  if (menuComponent.interact) {
    await menuComponent.interact();
  }

  // Exit alt screen
  screenManager.exit();

  console.log(`\nYou selected: ${state.menuItems[state.selected]}`);
}

main().catch((err) => {
  screenManager.exit();
  console.error('Error:', err);
  process.exit(1);
});
