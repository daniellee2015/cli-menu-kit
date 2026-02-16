/**
 * CLI Menu Kit - Multi Select Menu
 * Interactive multi-select menu with checkboxes
 */

import { MultiSelectConfig } from './types';
import { colors, theme, symbols, buildHint, showGoodbye } from './components';
import {
  setupTerminal,
  cleanupTerminal,
  moveCursorUp,
  renderHints,
  handleVerticalNavigation,
  exitWithGoodbye,
  TerminalState
} from './menu-core';

/**
 * Interactive multi-select menu with checkboxes
 *
 * Features:
 * - Arrow keys (↑/↓) to navigate
 * - Space to toggle selection
 * - A to select all
 * - I to invert selection
 * - Enter to confirm
 * - Shows ◉ for selected items, ○ for unselected items
 *
 * @param options - Menu options
 * @param config - Configuration object
 * @returns Array of selected indices
 */
export async function selectMultiMenu(
  options: string[],
  config: MultiSelectConfig = {}
): Promise<number[]> {
  const { lang = 'zh', defaultSelected = [] } = config;

  const inputPrompt = lang === 'zh'
    ? `${symbols.success.color}${symbols.success.icon}${colors.reset} 空格选中/取消,回车确认: `
    : `${symbols.success.color}${symbols.success.icon}${colors.reset} Space to toggle, Enter to confirm: `;

  const hintText = buildHint(['arrows', 'space', 'all', 'invert', 'enter'], lang);

  return new Promise((resolve) => {
    let selectedIndex = 0;
    let selectedItems = new Set(defaultSelected);
    const state: TerminalState = setupTerminal();

    const cleanup = () => {
      cleanupTerminal(state, onKeyPress);
      resolve(Array.from(selectedItems).sort((a, b) => a - b));
    };

    const render = () => {
      let totalLines = 0;

      // Move cursor up if not first render
      moveCursorUp(state);

      // Render input line
      process.stdout.write('\x1b[2K\r');
      process.stdout.write(`${theme.muted}${inputPrompt}${colors.reset}`);
      const selectedText = lang === 'zh' ? `${selectedItems.size} 项已选` : `${selectedItems.size} selected`;
      process.stdout.write(`${theme.active}${selectedText}${colors.reset}`);
      console.log();
      console.log();
      totalLines += 2;

      // Render options with checkboxes
      options.forEach((option, index) => {
        const isCurrentLine = index === selectedIndex;
        const isChecked = selectedItems.has(index);

        const prefix = isCurrentLine ? `${theme.active}❯ ` : '  ';
        const checkbox = isChecked ? `${theme.success}◉` : `${theme.muted}○`;
        const textColor = isCurrentLine ? theme.active : (isChecked ? theme.title : colors.reset);

        console.log(`${prefix}${checkbox} ${textColor}${option}${colors.reset}`);
      });
      totalLines += options.length;

      // Render hints
      totalLines += renderHints(hintText);

      state.renderedLines = totalLines;
      state.isFirstRender = false;
    };

    const onKeyPress = (key: string) => {
      // Handle vertical navigation
      const newIndex = handleVerticalNavigation(key, selectedIndex, options.length - 1);
      if (newIndex !== null) {
        selectedIndex = newIndex;
        render();
        return;
      }

      // Handle space (toggle selection)
      if (key === ' ') {
        if (selectedItems.has(selectedIndex)) {
          selectedItems.delete(selectedIndex);
        } else {
          selectedItems.add(selectedIndex);
        }
        render();
        return;
      }

      // Handle 'A' (select all)
      if (key.toUpperCase() === 'A') {
        selectedItems.clear();
        for (let i = 0; i < options.length; i++) {
          selectedItems.add(i);
        }
        render();
        return;
      }

      // Handle 'I' (invert selection)
      if (key.toUpperCase() === 'I') {
        const newSelected = new Set<number>();
        for (let i = 0; i < options.length; i++) {
          if (!selectedItems.has(i)) {
            newSelected.add(i);
          }
        }
        selectedItems = newSelected;
        render();
        return;
      }

      // Handle Enter key
      if (key === '\r') {
        cleanup();
        return;
      }

      // Handle Ctrl+C
      if (key === '\u0003') {
        exitWithGoodbye(state, onKeyPress, () => showGoodbye(lang));
      }
    };

    state.stdin.on('data', onKeyPress);
    render();
  });
}
