/**
 * CheckboxMenu - Multi-select vertical menu component
 * Allows user to select multiple options from a list
 */

import { CheckboxMenuConfig, CheckboxMenuResult, MenuOption } from '../../types/menu.types.js';
import { LAYOUT_PRESETS } from '../../types/layout.types.js';
import { initTerminal, restoreTerminal, clearMenu, TerminalState } from '../../core/terminal.js';
import { KEY_CODES, isEnter, isCtrlC, isSpace, normalizeLetter } from '../../core/keyboard.js';
import { renderOption, renderInputPrompt, renderHints, renderBlankLines, renderSectionLabel } from '../../core/renderer.js';
import { colors } from '../../core/colors.js';
import { t } from '../../i18n/registry.js';

/**
 * Generate hints based on menu configuration
 */
function generateHints(allowSelectAll: boolean, allowInvert: boolean): string[] {
  const hints: string[] = [t('hints.arrows'), t('hints.space')];

  if (allowSelectAll) {
    hints.push(t('hints.selectAll'));
  }

  if (allowInvert) {
    hints.push(t('hints.invert'));
  }

  hints.push(t('hints.enter'));

  return hints;
}

/**
 * Show a checkbox menu (multi-select)
 * @param config - Menu configuration
 * @returns Promise resolving to selected options
 */
export async function showCheckboxMenu(config: CheckboxMenuConfig): Promise<CheckboxMenuResult> {
  const {
    options,
    title,
    prompt,
    hints,
    layout = { ...LAYOUT_PRESETS.SUB_MENU, order: ['input', 'options', 'hints'] },
    defaultSelected = [],
    minSelections = 0,
    maxSelections,
    allowSelectAll = true,
    allowInvert = true,
    separatorWidth = 30,
    onExit
  } = config;

  // Use i18n for default prompt if not provided
  const displayPrompt = prompt || t('menus.multiSelectPrompt');

  // Generate hints dynamically if not provided
  const displayHints = hints || generateHints(allowSelectAll, allowInvert);

  // Validate options
  if (!options || options.length === 0) {
    throw new Error('CheckboxMenu requires at least one option');
  }

  // Initialize state
  let cursorIndex = 0;
  const selected = new Set<number>(defaultSelected);
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

  // Ensure cursorIndex points to a selectable option
  if (!selectableIndices.includes(cursorIndex)) {
    cursorIndex = selectableIndices[0] || 0;
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
            const displayValue = `${selectedCount} ${t('menus.selectedCount')}`;
            renderInputPrompt(displayPrompt, displayValue);
            lineCount++;
          }
          break;

        case 'options':
          optionData.forEach((item, index) => {
            if (item.isSeparator) {
              // Render section label
              renderSectionLabel(item.label, separatorWidth);
            } else {
              renderOption(item.value, selected.has(index), index === cursorIndex);
            }
            lineCount++;
          });
          break;

        case 'hints':
          if (layout.visible.hints && displayHints.length > 0) {
            renderHints(displayHints);
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
          if (typeof option === 'string') {
            return option;
          } else if ('type' in option && option.type === 'separator') {
            return '';
          } else if ('value' in option) {
            return option.value ?? option.label ?? '';
          } else {
            return option.label ?? '';
          }
        });

        resolve({ indices, values });
        return;
      }

      // Handle Space (toggle selection)
      if (isSpace(key)) {
        // Only toggle if cursor is on a selectable item
        if (selectableIndices.includes(cursorIndex)) {
          if (selected.has(cursorIndex)) {
            selected.delete(cursorIndex);
          } else {
            // Check max selections
            if (!maxSelections || selected.size < maxSelections) {
              selected.add(cursorIndex);
            }
          }
          render();
        }
        return;
      }

      // Handle arrow keys
      if (key === KEY_CODES.UP) {
        cursorIndex = getNextSelectableIndex(cursorIndex, 'up');
        render();
        return;
      }

      if (key === KEY_CODES.DOWN) {
        cursorIndex = getNextSelectableIndex(cursorIndex, 'down');
        render();
        return;
      }

      // Handle 'A' (select all)
      if (allowSelectAll && normalizeLetter(key) === 'a') {
        if (!maxSelections || maxSelections >= selectableIndices.length) {
          selectableIndices.forEach(i => selected.add(i));
          render();
        }
        return;
      }

      // Handle 'I' (invert selection)
      if (allowInvert && normalizeLetter(key) === 'i') {
        const newSelected = new Set<number>();
        selectableIndices.forEach(i => {
          if (!selected.has(i)) {
            if (!maxSelections || newSelected.size < maxSelections) {
              newSelected.add(i);
            }
          }
        });
        selected.clear();
        newSelected.forEach(i => selected.add(i));
        render();
        return;
      }
    };

    state.stdin.on('data', onData);
  });
}
