/**
 * TextInput - Single-line text input component
 * Allows user to enter text with validation
 */

import { TextInputConfig, TextInputResult } from '../../types/input.types.js';
import { initTerminal, restoreTerminal, clearMenu, TerminalState, writeLine } from '../../core/terminal.js';
import { isEnter, isCtrlC, isBackspace, isPrintable } from '../../core/keyboard.js';
import { colors } from '../../core/colors.js';

/**
 * Show a text input prompt
 * @param config - Input configuration
 * @returns Promise resolving to entered text
 */
export async function showTextInput(config: TextInputConfig): Promise<TextInputResult> {
  const {
    prompt,
    defaultValue = '',
    placeholder,
    maxLength,
    minLength = 0,
    allowEmpty = false,
    validate,
    errorMessage,
    onExit
  } = config;

  const state = initTerminal();
  let inputValue = '';
  let errorMsg = '';

  const render = () => {
    clearMenu(state);
    let lineCount = 0;

    // Render prompt with default value hint
    let promptLine = `  ${prompt}`;
    if (defaultValue && !inputValue) {
      promptLine += ` ${colors.dim}(默认: ${defaultValue})${colors.reset}`;
    }
    if (placeholder && !inputValue) {
      promptLine += ` ${colors.dim}${placeholder}${colors.reset}`;
    }
    promptLine += `: ${colors.cyan}${inputValue}_${colors.reset}`;
    writeLine(promptLine);
    lineCount++;

    // Render error message if any
    if (errorMsg) {
      writeLine(`  ${colors.red}✗ ${errorMsg}${colors.reset}`);
      lineCount++;
    }

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
        const finalValue = inputValue || defaultValue;

        // Check if empty
        if (!allowEmpty && !finalValue) {
          errorMsg = errorMessage || '输入不能为空';
          render();
          return;
        }

        // Check min length
        if (minLength && finalValue.length < minLength) {
          errorMsg = errorMessage || `输入长度不能少于 ${minLength} 个字符`;
          render();
          return;
        }

        // Custom validation
        if (validate) {
          const validationResult = validate(finalValue);
          if (validationResult !== true) {
            errorMsg = typeof validationResult === 'string' ? validationResult : (errorMessage || '输入无效');
            render();
            return;
          }
        }

        // Success
        state.stdin.removeListener('data', onData);
        clearMenu(state);
        restoreTerminal(state);
        resolve(finalValue);
        return;
      }

      // Handle Backspace
      if (isBackspace(key)) {
        if (inputValue.length > 0) {
          inputValue = inputValue.slice(0, -1);
          errorMsg = ''; // Clear error on edit
          render();
        }
        return;
      }

      // Handle printable characters
      if (isPrintable(key)) {
        // Check max length
        if (maxLength && inputValue.length >= maxLength) {
          return;
        }

        inputValue += key;
        errorMsg = ''; // Clear error on edit
        render();
        return;
      }
    };

    state.stdin.on('data', onData);
  });
}
