/**
 * NumberInput - Numeric input component
 * Allows user to enter numbers with validation
 */

import { NumberInputConfig, NumberInputResult } from '../../types/input.types.js';
import { initTerminal, restoreTerminal, clearMenu, TerminalState, writeLine } from '../../core/terminal.js';
import { isEnter, isCtrlC, isBackspace, isNumberKey } from '../../core/keyboard.js';
import { colors } from '../../core/colors.js';

/**
 * Show a number input prompt
 * @param config - Input configuration
 * @returns Promise resolving to entered number
 */
export async function showNumberInput(config: NumberInputConfig): Promise<NumberInputResult> {
  const {
    prompt,
    defaultValue,
    min,
    max,
    allowDecimals = false,
    allowNegative = false,
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

    // Render prompt with constraints
    let promptLine = `  ${prompt}`;
    if (min !== undefined || max !== undefined) {
      const constraints = [];
      if (min !== undefined) constraints.push(`最小: ${min}`);
      if (max !== undefined) constraints.push(`最大: ${max}`);
      promptLine += ` ${colors.dim}(${constraints.join(', ')})${colors.reset}`;
    }
    if (defaultValue !== undefined && !inputValue) {
      promptLine += ` ${colors.dim}(默认: ${defaultValue})${colors.reset}`;
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
  return new Promise<number>((resolve) => {
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
        const finalValue = inputValue || (defaultValue !== undefined ? String(defaultValue) : '');

        // Check if empty
        if (!finalValue) {
          errorMsg = errorMessage || '请输入数字';
          render();
          return;
        }

        // Parse number
        const num = allowDecimals ? parseFloat(finalValue) : parseInt(finalValue, 10);

        // Check if valid number
        if (isNaN(num)) {
          errorMsg = errorMessage || '输入必须是有效的数字';
          render();
          return;
        }

        // Check min
        if (min !== undefined && num < min) {
          errorMsg = errorMessage || `数字不能小于 ${min}`;
          render();
          return;
        }

        // Check max
        if (max !== undefined && num > max) {
          errorMsg = errorMessage || `数字不能大于 ${max}`;
          render();
          return;
        }

        // Custom validation
        if (validate) {
          const validationResult = validate(String(num));
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
        resolve(num);
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

      // Handle number keys
      if (isNumberKey(key)) {
        inputValue += key;
        errorMsg = ''; // Clear error on edit
        render();
        return;
      }

      // Handle decimal point
      if (allowDecimals && key === '.' && !inputValue.includes('.')) {
        inputValue += key;
        errorMsg = ''; // Clear error on edit
        render();
        return;
      }

      // Handle negative sign
      if (allowNegative && key === '-' && inputValue.length === 0) {
        inputValue += key;
        errorMsg = ''; // Clear error on edit
        render();
        return;
      }
    };

    state.stdin.on('data', onData);
  });
}
