/**
 * RadioMenu - Single-select vertical menu component
 * Allows user to select one option from a list
 */

import { RadioMenuConfig, RadioMenuResult, MenuOption } from '../../types/menu.types.js';
import { initTerminal, restoreTerminal, clearMenu, TerminalState, writeLine } from '../../core/terminal.js';
import { KEY_CODES, isEnter, isCtrlC, isNumberKey, isLetterKey, normalizeLetter } from '../../core/keyboard.js';
import { renderHeader, renderOption, renderInputPrompt, renderBlankLines, renderSectionLabel } from '../../core/renderer.js';
import { renderHints } from '../../core/renderer.js';
import { colors, uiColors } from '../../core/colors.js';
import { t } from '../../i18n/registry.js';

/**
 * Show a radio menu (single-select)
 * @param config - Menu configuration
 * @param hints - Optional hints to display at the bottom (for Page Layout use)
 * @returns Promise resolving to selected option
 */
export async function showRadioMenu(config: RadioMenuConfig, hints?: string[]): Promise<RadioMenuResult> {
  const {
    options,
    title,
    prompt,
    defaultIndex = 0,
    allowNumberKeys = true,
    allowLetterKeys = false,
    separatorWidth = 30,
    onExit,
    preserveOnSelect = false
  } = config;

  // Use i18n for default prompt if not provided
  const displayPrompt = prompt || t('menus.selectPrompt');

  // Validate options
  if (!options || options.length === 0) {
    throw new Error('RadioMenu requires at least one option');
  }

  // Initialize state
  let selectedIndex = Math.max(0, Math.min(defaultIndex, options.length - 1));
  const state = initTerminal();

  // Separate selectable options from separators
  const selectableIndices: number[] = [];
  const optionData: Array<{ value: string; isSeparator: boolean; label?: string }> = [];

  options.forEach((opt, index) => {
    if (typeof opt === 'object' && 'type' in opt && opt.type === 'separator') {
      optionData.push({ value: '', isSeparator: true, label: opt.label });
    } else {
      let value: string;
      if (typeof opt === 'string') {
        value = opt;
      } else if ('value' in opt) {
        value = opt.value ?? opt.label ?? '';
      } else {
        value = opt.label ?? '';
      }
      optionData.push({ value, isSeparator: false });
      selectableIndices.push(index);
    }
  });

  // Ensure selectedIndex points to a selectable option
  if (!selectableIndices.includes(selectedIndex)) {
    selectedIndex = selectableIndices[0] || 0;
  }

  // Helper function to get next/previous selectable index
  const getNextSelectableIndex = (currentIndex: number, direction: 'up' | 'down'): number => {
    let nextIndex = currentIndex;
    const maxAttempts = options.length;
    let attempts = 0;

    do {
      if (direction === 'up') {
        nextIndex = nextIndex > 0 ? nextIndex - 1 : options.length - 1;
      } else {
        nextIndex = nextIndex < options.length - 1 ? nextIndex + 1 : 0;
      }
      attempts++;
    } while (!selectableIndices.includes(nextIndex) && attempts < maxAttempts);

    return selectableIndices.includes(nextIndex) ? nextIndex : currentIndex;
  };

  // Render function
  const render = () => {
    clearMenu(state);
    let lineCount = 0;

    // Render title if provided
    if (title) {
      renderHeader(`  ${title}`, colors.cyan);
      lineCount++;
      renderBlankLines(1);
      lineCount++;
    }

    // Render options
    optionData.forEach((item, index) => {
      if (item.isSeparator) {
        // Render section label with configured width
        renderSectionLabel(item.label, separatorWidth);
      } else {
        // Check if option starts with a number or letter prefix
        const numberMatch = item.value.match(/^(\d+)\.\s*/);
        const letterMatch = item.value.match(/^([a-zA-Z])\.\s*/);

        // Don't add prefix if option already has number or letter prefix
        const prefix = (numberMatch || letterMatch) ? '' : `${selectableIndices.indexOf(index) + 1}. `;

        // Check if this is an Exit option (contains "Exit" or "Quit")
        const isExitOption = /\b(exit|quit)\b/i.test(item.value);
        const displayValue = isExitOption ? `${uiColors.error}${item.value}${colors.reset}` : item.value;

        // For radio menus, don't show selection indicator (pass undefined instead of false)
        renderOption(displayValue, undefined as any, index === selectedIndex, prefix);

        // Add blank line after last item before next separator
        const nextIndex = index + 1;
        if (nextIndex < optionData.length && optionData[nextIndex].isSeparator) {
          writeLine('');
          lineCount++; // Count the blank line
        }
      }
      lineCount++;
    });

    // Render input prompt
    renderBlankLines(1);
    lineCount++;

    // Calculate display value (current selection number)
    let displayValue = '';
    const currentItem = optionData[selectedIndex];
    if (currentItem && !currentItem.isSeparator) {
      const match = currentItem.value.match(/^([^.]+)\./);
      if (match) {
        displayValue = match[1];
      } else {
        displayValue = String(selectableIndices.indexOf(selectedIndex) + 1);
      }
    }

    renderInputPrompt(displayPrompt, displayValue);
    lineCount++;

    // Render hints if provided (for Page Layout footer)
    if (hints && hints.length > 0) {
      renderBlankLines(1);
      lineCount++;
      renderHints(hints);
      lineCount++;
    }

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
        if (!preserveOnSelect) {
          clearMenu(state);
        } else {
          writeLine('');
        }
        restoreTerminal(state);

        const selectedOption = options[selectedIndex];
        let value: string;
        if (typeof selectedOption === 'string') {
          value = selectedOption;
        } else if ('type' in selectedOption && selectedOption.type === 'separator') {
          value = '';
        } else if ('value' in selectedOption) {
          value = selectedOption.value ?? selectedOption.label ?? '';
        } else {
          value = selectedOption.label ?? '';
        }

        resolve({
          index: selectedIndex,
          value
        });
        return;
      }

      // Handle arrow keys
      if (key === KEY_CODES.UP) {
        selectedIndex = getNextSelectableIndex(selectedIndex, 'up');
        render();
        return;
      }

      if (key === KEY_CODES.DOWN) {
        selectedIndex = getNextSelectableIndex(selectedIndex, 'down');
        render();
        return;
      }

      // Handle number keys
      if (allowNumberKeys && isNumberKey(key)) {
        const num = parseInt(key, 10);
        if (num > 0 && num <= selectableIndices.length) {
          selectedIndex = selectableIndices[num - 1];
          render();
        }
        return;
      }

      // Handle letter keys
      if (allowLetterKeys && isLetterKey(key)) {
        const letter = normalizeLetter(key);
        const index = selectableIndices.find(idx => {
          const item = optionData[idx];
          if (item.isSeparator) return false;
          const match = item.value.match(/^([a-zA-Z])\./i);
          return match && match[1].toLowerCase() === letter;
        });
        if (index !== undefined) {
          selectedIndex = index;
          render();
        }
        return;
      }
    };

    state.stdin.on('data', onData);
  });
}
