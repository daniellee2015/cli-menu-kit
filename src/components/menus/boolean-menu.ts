/**
 * BooleanMenu - Yes/No selection component
 * Supports both horizontal and vertical orientations
 */

import { BooleanMenuConfig, BooleanMenuResult } from '../../types/menu.types.js';
import { initTerminal, restoreTerminal, clearMenu, TerminalState, writeLine } from '../../core/terminal.js';
import { KEY_CODES, isEnter, isCtrlC, normalizeLetter } from '../../core/keyboard.js';
import { colors, uiColors } from '../../core/colors.js';
import { t } from '../../i18n/registry.js';

/**
 * Show a boolean menu (yes/no selection)
 * @param config - Menu configuration
 * @returns Promise resolving to boolean result
 */
export async function showBooleanMenu(config: BooleanMenuConfig): Promise<BooleanMenuResult> {
  const {
    question,
    helperText,
    defaultValue = true,
    yesText = t('menus.yes'),
    noText = t('menus.no'),
    orientation = 'horizontal',
    onExit,
    preserveOnSelect = false
  } = config;
  const preserveOnExit = config.preserveOnExit ?? preserveOnSelect;

  if (orientation === 'horizontal') {
    return showBooleanMenuHorizontal(
      question,
      helperText,
      defaultValue,
      yesText,
      noText,
      onExit,
      preserveOnSelect,
      preserveOnExit
    );
  } else {
    return showBooleanMenuVertical(
      question,
      helperText,
      defaultValue,
      yesText,
      noText,
      onExit,
      preserveOnSelect,
      preserveOnExit
    );
  }
}

/**
 * Show horizontal boolean menu (side by side)
 */
async function showBooleanMenuHorizontal(
  question: string,
  helperText: string | undefined,
  defaultValue: boolean,
  yesText: string,
  noText: string,
  onExit?: () => void,
  preserveOnSelect = false,
  preserveOnExit = false
): Promise<boolean> {
  const state = initTerminal();
  let selected = defaultValue;

  const render = () => {
    clearMenu(state);

    // Render question with options on same line
    const yesOption = selected
      ? `${uiColors.primary}${yesText}${colors.reset}`
      : `${uiColors.textSecondary}${yesText}${colors.reset}`;

    const noOption = !selected
      ? `${uiColors.primary}${noText}${colors.reset}`
      : `${uiColors.textSecondary}${noText}${colors.reset}`;

    writeLine(`${uiColors.warning}?${colors.reset} ${question} ${yesOption} | ${noOption}`);
    if (helperText && helperText.trim().length > 0) {
      writeLine(`  ${uiColors.textSecondary}${helperText}${colors.reset}`);
      state.renderedLines = 2;
      return;
    }

    state.renderedLines = 1;
  };

  // Initial render
  render();

  // Handle keyboard input
  return new Promise<boolean>((resolve) => {
    const onData = (key: string) => {
      // Handle Ctrl+C
      if (isCtrlC(key)) {
        state.stdin.removeListener('data', onData);
        if (!preserveOnExit) {
          clearMenu(state);
        }
        restoreTerminal(state);
        if (onExit) {
          onExit();
        } else {
          console.log(`\n${t('messages.goodbye')}`);
        }
        process.exit(0);
      }

      // Handle Enter
      if (isEnter(key)) {
        state.stdin.removeListener('data', onData);
        if (!preserveOnSelect) {
          clearMenu(state);
        }
        restoreTerminal(state);
        resolve(selected);
        return;
      }

      // Handle left/right arrows
      if (key === KEY_CODES.LEFT) {
        selected = true;
        render();
        return;
      }

      if (key === KEY_CODES.RIGHT) {
        selected = false;
        render();
        return;
      }

      // Handle Y/N keys
      const letter = normalizeLetter(key);
      if (letter === 'y') {
        selected = true;
        render();
        return;
      }

      if (letter === 'n') {
        selected = false;
        render();
        return;
      }
    };

    state.stdin.on('data', onData);
  });
}

/**
 * Show vertical boolean menu (stacked)
 */
async function showBooleanMenuVertical(
  question: string,
  helperText: string | undefined,
  defaultValue: boolean,
  yesText: string,
  noText: string,
  onExit?: () => void,
  preserveOnSelect = false,
  preserveOnExit = false
): Promise<boolean> {
  const state = initTerminal();
  let selected = defaultValue;

  const render = () => {
    clearMenu(state);

    // Render question
    writeLine(`${uiColors.warning}?${colors.reset} ${question}`);
    if (helperText && helperText.trim().length > 0) {
      writeLine(`  ${uiColors.textSecondary}${helperText}${colors.reset}`);
    }
    writeLine('');

    // Render yes option
    const yesCursor = selected ? `${uiColors.cursor}❯ ${colors.reset}` : '  ';
    const yesColor = selected ? uiColors.primary : uiColors.textPrimary;
    writeLine(`${yesCursor}${yesColor}${yesText}${colors.reset}`);

    // Render no option
    const noCursor = !selected ? `${uiColors.cursor}❯ ${colors.reset}` : '  ';
    const noColor = !selected ? uiColors.primary : uiColors.textPrimary;
    writeLine(`${noCursor}${noColor}${noText}${colors.reset}`);

    state.renderedLines = helperText && helperText.trim().length > 0 ? 5 : 4;
  };

  // Initial render
  render();

  // Handle keyboard input
  return new Promise<boolean>((resolve) => {
    const onData = (key: string) => {
      // Handle Ctrl+C
      if (isCtrlC(key)) {
        state.stdin.removeListener('data', onData);
        if (!preserveOnExit) {
          clearMenu(state);
        }
        restoreTerminal(state);
        if (onExit) {
          onExit();
        } else {
          console.log(`\n${t('messages.goodbye')}`);
        }
        process.exit(0);
      }

      // Handle Enter
      if (isEnter(key)) {
        state.stdin.removeListener('data', onData);
        if (!preserveOnSelect) {
          clearMenu(state);
        }
        restoreTerminal(state);
        resolve(selected);
        return;
      }

      // Handle up/down arrows
      if (key === KEY_CODES.UP) {
        selected = true;
        render();
        return;
      }

      if (key === KEY_CODES.DOWN) {
        selected = false;
        render();
        return;
      }

      // Handle Y/N keys
      const letter = normalizeLetter(key);
      if (letter === 'y') {
        selected = true;
        render();
        return;
      }

      if (letter === 'n') {
        selected = false;
        render();
        return;
      }
    };

    state.stdin.on('data', onData);
  });
}
