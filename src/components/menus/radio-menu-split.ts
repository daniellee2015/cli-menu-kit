/**
 * RadioMenu - Split rendering and interaction
 * Supports Page Layout V2 architecture with separate render/interact phases
 * Uses ScreenManager for independent region updates
 */

import { RadioMenuConfig, RadioMenuResult, MenuOption } from '../../types/menu.types.js';
import { initTerminal, restoreTerminal, TerminalState, writeLine } from '../../core/terminal.js';
import { KEY_CODES, isEnter, isCtrlC, isNumberKey, isLetterKey, normalizeLetter } from '../../core/keyboard.js';
import { renderHeader, renderOption, renderBlankLines, renderSectionLabel } from '../../core/renderer.js';
import { colors, uiColors } from '../../core/colors.js';
import { t } from '../../i18n/registry.js';
import { screenManager } from '../../layout.js';

/**
 * Menu state for split rendering
 */
export interface RadioMenuState {
  config: RadioMenuConfig;
  selectedIndex: number;
  selectableIndices: number[];
  optionData: Array<{ value: string; isSeparator: boolean; label?: string }>;
  terminalState: TerminalState;
  displayPrompt: string;
  initialLineCount?: number;
  regionId: string; // Screen region ID for this menu
}

/**
 * Render radio menu UI (non-blocking)
 * Returns state for later interaction
 */
export function renderRadioMenuUI(config: RadioMenuConfig): RadioMenuState {
  const {
    options,
    title,
    prompt,
    defaultIndex = 0,
    separatorWidth = 30
  } = config;

  // Use i18n for default prompt if not provided
  const displayPrompt = prompt || t('menus.selectPrompt');

  // Validate options
  if (!options || options.length === 0) {
    throw new Error('RadioMenu requires at least one option');
  }

  // Initialize state
  let selectedIndex = Math.max(0, Math.min(defaultIndex, options.length - 1));

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

  // Render menu UI NOW (in Phase 1, before terminal initialization)
  let lineCount = 0;

  // Render menu title if provided
  if (title) {
    renderHeader(`  ${title}`, colors.cyan);
    lineCount++;
    renderBlankLines(1);
    lineCount++;
  }

  // Render options
  optionData.forEach((item, index) => {
    if (item.isSeparator) {
      renderSectionLabel(item.label, separatorWidth);
    } else {
      const numberMatch = item.value.match(/^(\d+)\.\s*/);
      const letterMatch = item.value.match(/^([a-zA-Z])\.\s*/);
      const prefix = (numberMatch || letterMatch) ? '' : `${selectableIndices.indexOf(index) + 1}. `;
      const isExitOption = /\b(exit|quit)\b/i.test(item.value);
      const displayValue = isExitOption ? `${uiColors.error}${item.value}${colors.reset}` : item.value;
      renderOption(displayValue, undefined as any, index === selectedIndex, prefix);

      const nextIndex = index + 1;
      if (nextIndex < optionData.length && optionData[nextIndex].isSeparator) {
        writeLine('');
        lineCount++;
      }
    }
    lineCount++;
  });

  // Don't render input prompt here - it should be in footer
  // Just render the menu options

  // Generate a unique region ID for this menu
  const regionId = `menu-${Date.now()}`;

  // Store the line count for later use in interact phase
  return {
    config,
    selectedIndex,
    selectableIndices,
    optionData,
    terminalState: null as any, // Will be initialized in interact phase
    displayPrompt,
    initialLineCount: lineCount,
    regionId
  };
}

/**
 * Wait for user input and return result (blocking)
 */
export async function waitForRadioMenuInput(menuState: RadioMenuState): Promise<RadioMenuResult> {
  const { config, selectableIndices, optionData, displayPrompt } = menuState;
  let selectedIndex = menuState.selectedIndex;

  // Initialize terminal NOW (in interact phase, after all rendering is done)
  const state = initTerminal();

  const { allowNumberKeys = true, allowLetterKeys = false, onExit, preserveOnSelect = false } = config;

  // Helper function to get next/previous selectable index
  const getNextSelectableIndex = (currentIndex: number, direction: 'up' | 'down'): number => {
    let nextIndex = currentIndex;
    const maxAttempts = optionData.length;
    let attempts = 0;

    do {
      if (direction === 'up') {
        nextIndex = nextIndex > 0 ? nextIndex - 1 : optionData.length - 1;
      } else {
        nextIndex = nextIndex < optionData.length - 1 ? nextIndex + 1 : 0;
      }
      attempts++;
    } while (!selectableIndices.includes(nextIndex) && attempts < maxAttempts);

    return selectableIndices.includes(nextIndex) ? nextIndex : currentIndex;
  };

  // Render function (updates display using ScreenManager)
  const render = () => {
    // Move to menu region and clear it
    // screenManager.moveTo(menuState.regionId);
    // screenManager.clearRegion(menuState.regionId);

    let lineCount = 0;

    // Render menu title if provided
    if (config.title) {
      renderHeader(`  ${config.title}`, colors.cyan);
      lineCount++;
      renderBlankLines(1);
      lineCount++;
    }

    // Render options
    optionData.forEach((item, index) => {
      if (item.isSeparator) {
        renderSectionLabel(item.label, config.separatorWidth || 30);
      } else {
        const numberMatch = item.value.match(/^(\d+)\.\s*/);
        const letterMatch = item.value.match(/^([a-zA-Z])\.\s*/);
        const prefix = (numberMatch || letterMatch) ? '' : `${selectableIndices.indexOf(index) + 1}. `;
        const isExitOption = /\b(exit|quit)\b/i.test(item.value);
        const displayValue = isExitOption ? `${uiColors.error}${item.value}${colors.reset}` : item.value;
        renderOption(displayValue, undefined as any, index === selectedIndex, prefix);

        const nextIndex = index + 1;
        if (nextIndex < optionData.length && optionData[nextIndex].isSeparator) {
          writeLine('');
          lineCount++;
        }
      }
      lineCount++;
    });

    // Update region size if it changed
    // if (lineCount !== menuState.initialLineCount) {
    //   screenManager.updateRegionSize(menuState.regionId, lineCount);
    //   menuState.initialLineCount = lineCount;
    // }

    // Update global state with current selection
    // const currentItem = optionData[selectedIndex];
    // if (currentItem && !currentItem.isSeparator) {
    //   const match = currentItem.value.match(/^([^.]+)\./);
    //   const displayValue = match ? match[1] : String(selectableIndices.indexOf(selectedIndex) + 1);
    //   globalState.setState('menu.selectedValue', displayValue);
    //   globalState.setState('menu.selectedIndex', selectedIndex);
    // }
  };

  // Register the menu region with ScreenManager
  // if (menuState.initialLineCount) {
  //   screenManager.registerRegion(menuState.regionId, menuState.initialLineCount);
  // }

  // Don't render initially - menu was already rendered in Phase 1
  // Just initialize the state
  state.renderedLines = menuState.initialLineCount || 0;

  // Handle keyboard input
  return new Promise<RadioMenuResult>((resolve) => {
    const onData = (key: string) => {
      // Handle Ctrl+C
      if (isCtrlC(key)) {
        state.stdin.removeListener('data', onData);
        screenManager.clearRegion(menuState.regionId);
        restoreTerminal(state);
        if (onExit) {
          onExit();
        } else {
          console.log('\n👋 再见!');
        }
        process.exit(0);
      }

      // Handle arrow keys
      if (key === KEY_CODES.UP) {
        selectedIndex = getNextSelectableIndex(selectedIndex, 'up');
        render();
      } else if (key === KEY_CODES.DOWN) {
        selectedIndex = getNextSelectableIndex(selectedIndex, 'down');
        render();
      }

      // Handle Enter
      if (isEnter(key)) {
        const selectedItem = optionData[selectedIndex];
        if (selectedItem && !selectedItem.isSeparator) {
          state.stdin.removeListener('data', onData);

          if (!preserveOnSelect) {
            screenManager.clearRegion(menuState.regionId);
          }

          restoreTerminal(state);

          resolve({
            value: selectedItem.value,
            index: selectableIndices.indexOf(selectedIndex)
          });
        }
      }

      // Handle number keys
      if (allowNumberKeys && isNumberKey(key)) {
        const num = parseInt(key, 10);
        const targetIndex = num === 0 ? 9 : num - 1;

        if (targetIndex < selectableIndices.length) {
          selectedIndex = selectableIndices[targetIndex];
          render();
        }
      }

      // Handle letter keys
      if (allowLetterKeys) {
        const letter = normalizeLetter(key);
        if (letter) {
          const matchingIndex = selectableIndices.find(idx => {
            const item = optionData[idx];
            if (!item || item.isSeparator) return false;
            const normalized = normalizeLetter(item.value.charAt(0));
            return normalized === letter;
          });

          if (matchingIndex !== undefined) {
            selectedIndex = matchingIndex;
            render();
          }
        }
      }
    };

    state.stdin.on('data', onData);
  });
}
