/**
 * LanguageSelector - Language selection component
 * Specialized selector for choosing a language
 */

import { LanguageSelectorConfig, LanguageSelectorResult } from '../../types/input.types.js';
import { initTerminal, restoreTerminal, clearMenu, TerminalState } from '../../core/terminal.js';
import { KEY_CODES, isEnter, isCtrlC, isNumberKey } from '../../core/keyboard.js';
import { renderHeader, renderOption, renderHints, renderBlankLines } from '../../core/renderer.js';
import { colors } from '../../core/colors.js';

/**
 * Show a language selector
 * @param config - Selector configuration
 * @returns Promise resolving to selected language code
 */
export async function showLanguageSelector(config: LanguageSelectorConfig): Promise<LanguageSelectorResult> {
  const {
    languages,
    defaultLanguage,
    prompt = '选择语言 / Select Language',
    onExit
  } = config;

  // Validate languages
  if (!languages || languages.length === 0) {
    throw new Error('LanguageSelector requires at least one language');
  }

  // Find default index
  let selectedIndex = 0;
  if (defaultLanguage) {
    const index = languages.findIndex(lang => lang.code === defaultLanguage);
    if (index !== -1) {
      selectedIndex = index;
    }
  }

  const state = initTerminal();

  const render = () => {
    clearMenu(state);
    let lineCount = 0;

    // Render header
    renderHeader(`  ${prompt}`, colors.cyan);
    lineCount++;
    renderBlankLines(1);
    lineCount++;

    // Render language options
    languages.forEach((lang, index) => {
      const displayText = lang.nativeName
        ? `${lang.name} (${lang.nativeName})`
        : lang.name;

      renderOption(displayText, false, index === selectedIndex, `${index + 1}. `);
      lineCount++;
    });

    // Render hints
    renderBlankLines(1);
    lineCount++;
    renderHints(['↑↓ 方向键', '1-9 输入序号', '⏎ 确认']);
    lineCount++;

    state.renderedLines = lineCount;
  };

  // Initial render
  render();

  // Handle keyboard input
  return new Promise<string>((resolve) => {
    const onData = (key: string) => {
      // Handle Ctrl+C
      if (isCtrlC(key)) {
        state.stdin.removeListener('data', onData);
        clearMenu(state);
        restoreTerminal(state);
        if (onExit) {
          onExit();
        } else {
          console.log('\n👋 再见!');
        }
        process.exit(0);
      }

      // Handle Enter
      if (isEnter(key)) {
        state.stdin.removeListener('data', onData);
        clearMenu(state);
        restoreTerminal(state);
        resolve(languages[selectedIndex].code);
        return;
      }

      // Handle arrow keys
      if (key === KEY_CODES.UP) {
        selectedIndex = selectedIndex > 0 ? selectedIndex - 1 : languages.length - 1;
        render();
        return;
      }

      if (key === KEY_CODES.DOWN) {
        selectedIndex = selectedIndex < languages.length - 1 ? selectedIndex + 1 : 0;
        render();
        return;
      }

      // Handle number keys
      if (isNumberKey(key)) {
        const num = parseInt(key, 10);
        if (num > 0 && num <= languages.length) {
          selectedIndex = num - 1;
          render();
        }
        return;
      }
    };

    state.stdin.on('data', onData);
  });
}
