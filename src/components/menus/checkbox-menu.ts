/**
 * CheckboxMenu - Multi-select vertical menu component
 * Allows user to select multiple options from a list
 */

import { CheckboxMenuConfig, CheckboxMenuResult, MenuOption } from '../../types/menu.types.js';
import { LAYOUT_PRESETS } from '../../types/layout.types.js';
import { initTerminal, restoreTerminal, clearMenu, TerminalState } from '../../core/terminal.js';
import { KEY_CODES, isEnter, isCtrlC, isSpace, normalizeLetter } from '../../core/keyboard.js';
import { renderOption, renderInputPrompt, renderHints, renderBlankLines } from '../../core/renderer.js';
import { colors } from '../../core/colors.js';

/**
 * Show a checkbox menu (multi-select)
 * @param config - Menu configuration
 * @returns Promise resolving to selected options
 */
export async function showCheckboxMenu(config: CheckboxMenuConfig): Promise<CheckboxMenuResult> {
  const {
    options,
    title,
    prompt = '空格选中/取消,回车确认',
    hints = ['↑↓ 方向键', '空格 选中/取消', 'A 全选', 'I 反选', '⏎ 确认'],
    layout = { ...LAYOUT_PRESETS.SUB_MENU, order: ['input', 'options', 'hints'] },
    defaultSelected = [],
    minSelections = 0,
    maxSelections,
    allowSelectAll = true,
    allowInvert = true,
    onExit
  } = config;

  // Validate options
  if (!options || options.length === 0) {
    throw new Error('CheckboxMenu requires at least one option');
  }

  // Initialize state
  let cursorIndex = 0;
  const selected = new Set<number>(defaultSelected);
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
        case 'input':
          if (layout.visible.input) {
            const selectedCount = selected.size;
            const displayValue = `${selectedCount} 项已选`;
            renderInputPrompt(prompt, displayValue);
            lineCount++;
          }
          break;

        case 'options':
          optionValues.forEach((option, index) => {
            renderOption(option, selected.has(index), index === cursorIndex);
            lineCount++;
          });
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
  return new Promise<CheckboxMenuResult>((resolve) => {
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
        // Validate minimum selections
        if (selected.size < minSelections) {
          // TODO: Show error message
          return;
        }

        state.stdin.removeListener('data', onData);
        clearMenu(state);
        restoreTerminal(state);

        const indices = Array.from(selected).sort((a, b) => a - b);
        const values = indices.map(i => {
          const option = options[i];
          return typeof option === 'string' ? option : option.value || option.label;
        });

        resolve({ indices, values });
        return;
      }

      // Handle Space (toggle selection)
      if (isSpace(key)) {
        if (selected.has(cursorIndex)) {
          selected.delete(cursorIndex);
        } else {
          // Check max selections
          if (!maxSelections || selected.size < maxSelections) {
            selected.add(cursorIndex);
          }
        }
        render();
        return;
      }

      // Handle arrow keys
      if (key === KEY_CODES.UP) {
        cursorIndex = cursorIndex > 0 ? cursorIndex - 1 : options.length - 1;
        render();
        return;
      }

      if (key === KEY_CODES.DOWN) {
        cursorIndex = cursorIndex < options.length - 1 ? cursorIndex + 1 : 0;
        render();
        return;
      }

      // Handle 'A' (select all)
      if (allowSelectAll && normalizeLetter(key) === 'a') {
        if (!maxSelections || maxSelections >= options.length) {
          for (let i = 0; i < options.length; i++) {
            selected.add(i);
          }
          render();
        }
        return;
      }

      // Handle 'I' (invert selection)
      if (allowInvert && normalizeLetter(key) === 'i') {
        const newSelected = new Set<number>();
        for (let i = 0; i < options.length; i++) {
          if (!selected.has(i)) {
            if (!maxSelections || newSelected.size < maxSelections) {
              newSelected.add(i);
            }
          }
        }
        selected.clear();
        newSelected.forEach(i => selected.add(i));
        render();
        return;
      }
    };

    state.stdin.on('data', onData);
  });
}
