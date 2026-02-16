/**
 * CLI Menu Kit - Single Select Menu
 * Interactive menu selection with arrow keys and keyboard shortcuts
 */

import { MenuConfig, MenuOption } from './types';
import { colors, theme, buildHint, showGoodbye } from './components';
import {
  setupTerminal,
  cleanupTerminal,
  moveCursorUp,
  renderHeader,
  renderSingleOption,
  renderHints,
  handleVerticalNavigation,
  handleNumberInput,
  handleLetterInput,
  exitWithGoodbye,
  TerminalState
} from './menu-core';

/**
 * Interactive menu selection with BOTH arrow keys AND number input
 *
 * Features:
 * - Arrow keys (↑/↓) to navigate with live highlight
 * - Number/letter keys to directly jump and select
 * - Enter key (⏎) to confirm selection
 *
 * @param options - Menu options (strings or objects with label/value)
 * @param config - Configuration object
 * @returns Selected index (0-based)
 */
export async function selectMenu(
  options: Array<string | MenuOption>,
  config: MenuConfig = {}
): Promise<number> {
  const {
    lang = 'zh',
    type = 'main',
    title,
    prompt,
    showPrompt = (type === 'main'),
    showHints = true
  } = config;

  const inputPromptText = lang === 'zh'
    ? '输入选项或用↑↓选择,回车确认: '
    : 'Type option or use ↑↓ to select, Enter to confirm: ';

  let hintKeys: Array<'arrows' | 'number' | 'letter' | 'enter' | 'esc'>;
  if (type === 'main') {
    hintKeys = ['arrows', 'number', 'letter', 'enter'];
  } else if (type === 'firstRun') {
    hintKeys = ['arrows', 'number', 'enter', 'esc'];
  } else {
    hintKeys = ['arrows', 'number', 'enter'];
  }

  const hintText = showHints ? buildHint(hintKeys, lang) : '';

  return new Promise((resolve) => {
    let selectedIndex = 0;
    const state: TerminalState = setupTerminal();

    const cleanup = (finalIndex: number) => {
      cleanupTerminal(state, onKeyPress);
      resolve(finalIndex);
    };

    const render = () => {
      let totalLines = 0;

      // Move cursor up if not first render
      moveCursorUp(state);

      // Render title
      if (title) {
        totalLines += renderHeader(title);
      }

      // Render options
      options.forEach((option, index) => {
        renderSingleOption(option, {
          index,
          isSelected: index === selectedIndex,
          showNumber: true
        });
      });
      totalLines += options.length;

      // Render input prompt with current selection value (BELOW options)
      if (showPrompt) {
        // Calculate display value (current selection number/letter)
        let displayValue = '';
        if (options[selectedIndex]) {
          const option = options[selectedIndex];
          if (typeof option === 'string') {
            displayValue = String(selectedIndex + 1);
          } else if (option.label) {
            const match = option.label.match(/^([^.]+)\./);
            if (match) {
              displayValue = match[1];
            } else {
              displayValue = String(selectedIndex + 1);
            }
          }
        }

        // Render prompt with display value
        console.log();
        process.stdout.write('\x1b[2K\r');
        process.stdout.write(`  ${theme.muted}${inputPromptText}${colors.reset}`);
        process.stdout.write(`${theme.active}${displayValue}${colors.reset}`);
        console.log();
        totalLines += 2;
      }

      // Render hints
      if (showHints && hintText) {
        totalLines += renderHints(hintText);
      }

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

      // Handle number input
      const numIndex = handleNumberInput(key, options.length);
      if (numIndex !== null) {
        selectedIndex = numIndex;
        render();
        return;
      }

      // Handle letter input
      const letterIndex = handleLetterInput(key, options);
      if (letterIndex !== null) {
        selectedIndex = letterIndex;
        render();
        return;
      }

      // Handle Enter key
      if (key === '\r') {
        cleanup(selectedIndex);
        return;
      }

      // Handle Escape key (for firstRun type)
      if (key === '\u001b' || key === '\u001b[') {
        if (type === 'firstRun') {
          exitWithGoodbye(state, onKeyPress, () => showGoodbye(lang));
        }
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
