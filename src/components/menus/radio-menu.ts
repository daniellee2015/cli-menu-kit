/**
 * RadioMenu - Single-select vertical menu component
 * Allows user to select one option from a list
 */

import { RadioMenuConfig, RadioMenuResult, MenuOption } from '../../types/menu.types.js';
import { LAYOUT_PRESETS } from '../../types/layout.types.js';
import { initTerminal, restoreTerminal, clearMenu, TerminalState } from '../../core/terminal.js';
import { KEY_CODES, isEnter, isCtrlC, isNumberKey, isLetterKey, normalizeLetter } from '../../core/keyboard.js';
import { renderHeader, renderOption, renderInputPrompt, renderHints, renderBlankLines } from '../../core/renderer.js';
import { colors } from '../../core/colors.js';

/**
 * Show a radio menu (single-select)
 * @param config - Menu configuration
 * @returns Promise resolving to selected option
 */
export async function showRadioMenu(config: RadioMenuConfig): Promise<RadioMenuResult> {
  const {
    options,
    title,
    prompt = '输入选项或用↑↓选择,回车确认',
    hints = ['↑↓ 方向键', '0-9 输入序号', '⏎ 确认'],
    layout = LAYOUT_PRESETS.MAIN_MENU,
    defaultIndex = 0,
    allowNumberKeys = true,
    allowLetterKeys = false,
    onExit
  } = config;

  // Validate options
  if (!options || options.length === 0) {
    throw new Error('RadioMenu requires at least one option');
  }

  // Initialize state
  let selectedIndex = Math.max(0, Math.min(defaultIndex, options.length - 1));
  const state = initTerminal();

  // Extract option values
  const optionValues = options.map(opt =>
    typeof opt === 'string' ? opt : opt.label
  );

  // Render function
  const render = () => {
    clearMenu(state);
    let lineCount = 0;

    // Render based on layout order
    layout.order.forEach(element => {
      // Add spacing before element
      const spacingKey = `before${element.charAt(0).toUpperCase() + element.slice(1)}` as keyof typeof layout.spacing;
      if (layout.spacing?.[spacingKey]) {
        renderBlankLines(layout.spacing[spacingKey]);
        lineCount += layout.spacing[spacingKey]!;
      }

      switch (element) {
        case 'header':
          if (layout.visible.header && title) {
            renderHeader(`  ${title}`, colors.cyan);
            lineCount++;
          }
          break;

        case 'options':
          optionValues.forEach((option, index) => {
            // Extract number prefix if exists
            const match = option.match(/^(\d+)\.\s*/);
            const prefix = match ? '' : `${index + 1}. `;

            // For radio menus, don't show selection indicator (pass undefined instead of false)
            renderOption(option, undefined as any, index === selectedIndex, prefix);
            lineCount++;
          });
          break;

        case 'input':
          if (layout.visible.input) {
            // Calculate display value (current selection number)
            let displayValue = '';
            const currentOption = optionValues[selectedIndex];
            const match = currentOption?.match(/^([^.]+)\./);
            if (match) {
              displayValue = match[1];
            } else {
              displayValue = String(selectedIndex + 1);
            }

            renderInputPrompt(prompt, displayValue);
            lineCount++;
          }
          break;

        case 'hints':
          if (layout.visible.hints && hints.length > 0) {
            renderHints(hints);
            lineCount++;
          }
          break;
      }

      // Add spacing after element
      const afterSpacingKey = `after${element.charAt(0).toUpperCase() + element.slice(1)}` as keyof typeof layout.spacing;
      if (layout.spacing?.[afterSpacingKey]) {
        renderBlankLines(layout.spacing[afterSpacingKey]);
        lineCount += layout.spacing[afterSpacingKey]!;
      }
    });

    state.renderedLines = lineCount;
  };

  // Initial render
  render();

  // Handle keyboard input
  return new Promise<RadioMenuResult>((resolve) => {
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

        const selectedOption = options[selectedIndex];
        const value = typeof selectedOption === 'string'
          ? selectedOption
          : selectedOption.value || selectedOption.label;

        resolve({
          index: selectedIndex,
          value
        });
        return;
      }

      // Handle arrow keys
      if (key === KEY_CODES.UP) {
        selectedIndex = selectedIndex > 0 ? selectedIndex - 1 : options.length - 1;
        render();
        return;
      }

      if (key === KEY_CODES.DOWN) {
        selectedIndex = selectedIndex < options.length - 1 ? selectedIndex + 1 : 0;
        render();
        return;
      }

      // Handle number keys
      if (allowNumberKeys && isNumberKey(key)) {
        const num = parseInt(key, 10);
        if (num > 0 && num <= options.length) {
          selectedIndex = num - 1;
          render();
        }
        return;
      }

      // Handle letter keys
      if (allowLetterKeys && isLetterKey(key)) {
        const letter = normalizeLetter(key);
        const index = optionValues.findIndex(opt => {
          const match = opt.match(/^([a-zA-Z])\./i);
          return match && match[1].toLowerCase() === letter;
        });
        if (index !== -1) {
          selectedIndex = index;
          render();
        }
        return;
      }
    };

    state.stdin.on('data', onData);
  });
}
