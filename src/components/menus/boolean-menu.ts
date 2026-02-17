/**
 * BooleanMenu - Yes/No selection component
 * Supports both horizontal and vertical orientations
 */

import { BooleanMenuConfig, BooleanMenuResult } from '../../types/menu.types.js';
import { initTerminal, restoreTerminal, clearMenu, TerminalState, writeLine } from '../../core/terminal.js';
import { KEY_CODES, isEnter, isCtrlC, normalizeLetter } from '../../core/keyboard.js';
import { colors } from '../../core/colors.js';

/**
 * Show a boolean menu (yes/no selection)
 * @param config - Menu configuration
 * @returns Promise resolving to boolean result
 */
export async function showBooleanMenu(config: BooleanMenuConfig): Promise<BooleanMenuResult> {
  const {
    question,
    defaultValue = true,
    yesText = '是',
    noText = '否',
    orientation = 'horizontal',
    onExit,
    preserveOnSelect = false
  } = config;

  if (orientation === 'horizontal') {
    return showBooleanMenuHorizontal(question, defaultValue, yesText, noText, onExit, preserveOnSelect);
  } else {
    return showBooleanMenuVertical(question, defaultValue, yesText, noText, onExit, preserveOnSelect);
  }
}

/**
 * Show horizontal boolean menu (side by side)
 */
async function showBooleanMenuHorizontal(
  question: string,
  defaultValue: boolean,
  yesText: string,
  noText: string,
  onExit?: () => void,
  preserveOnSelect = false
): Promise<boolean> {
  const state = initTerminal();
  let selected = defaultValue;

  const render = () => {
    clearMenu(state);

    // Render question with options on same line
    const yesOption = selected
      ? `${colors.cyan}${yesText}${colors.reset}`
      : `${colors.dim}${yesText}${colors.reset}`;

    const noOption = !selected
      ? `${colors.cyan}${noText}${colors.reset}`
      : `${colors.dim}${noText}${colors.reset}`;

    writeLine(`${colors.yellow}?${colors.reset} ${question} ${yesOption} | ${noOption}`);

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
  defaultValue: boolean,
  yesText: string,
  noText: string,
  onExit?: () => void,
  preserveOnSelect = false
): Promise<boolean> {
  const state = initTerminal();
  let selected = defaultValue;

  const render = () => {
    clearMenu(state);

    // Render question
    writeLine(`${colors.yellow}?${colors.reset} ${question}`);
    writeLine('');

    // Render yes option
    const yesCursor = selected ? `${colors.cyan}❯ ${colors.reset}` : '  ';
    const yesColor = selected ? colors.cyan : colors.reset;
    writeLine(`${yesCursor}${yesColor}${yesText}${colors.reset}`);

    // Render no option
    const noCursor = !selected ? `${colors.cyan}❯ ${colors.reset}` : '  ';
    const noColor = !selected ? colors.cyan : colors.reset;
    writeLine(`${noCursor}${noColor}${noText}${colors.reset}`);

    state.renderedLines = 4;
  };

  // Initial render
  render();

  // Handle keyboard input
  return new Promise<boolean>((resolve) => {
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
