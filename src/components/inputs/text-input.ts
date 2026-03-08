/**
 * TextInput - Single-line text input component
 * Allows user to enter text with validation
 */

import { TextInputConfig, TextInputResult } from '../../types/input.types.js';
import { initTerminal, restoreTerminal, clearMenu, TerminalState, writeLine } from '../../core/terminal.js';
import { isEnter, isCtrlC, isBackspace, isPrintable } from '../../core/keyboard.js';
import { colors, uiColors } from '../../core/colors.js';
import { getCurrentLanguage, t } from '../../i18n/registry.js';

/**
 * Normalize a terminal data chunk to printable text.
 * Supports bracketed paste and ignores control/escape sequences.
 */
function normalizeTextChunk(raw: string): string {
  if (!raw) {
    return '';
  }

  let chunk = raw;

  // Bracketed paste wrappers used by many terminals.
  chunk = chunk.replace(/\x1b\[200~/g, '');
  chunk = chunk.replace(/\x1b\[201~/g, '');

  // Remove CSI escape sequences (arrows, function keys, etc.).
  chunk = chunk.replace(/\x1b\[[0-9;?]*[ -/]*[@-~]/g, '');

  // Remove remaining ESC-prefixed control bytes.
  chunk = chunk.replace(/\x1b./g, '');

  // Single-line input: strip CR/LF and other control chars.
  chunk = chunk.replace(/[\r\n]/g, '');
  chunk = chunk.replace(/[\x00-\x1F\x7F]/g, '');

  return chunk;
}

/**
 * Show a text input prompt
 * @param config - Input configuration
 * @returns Promise resolving to entered text
 */
export async function showTextInput(config: TextInputConfig): Promise<TextInputResult> {
  const {
    lang: langInput,
    prompt,
    defaultValue = '',
    placeholder,
    maxLength,
    minLength = 0,
    allowEmpty = false,
    validate,
    errorMessage,
    onExit,
    preserveOnExit = false
  } = config;
  const lang = langInput ?? getCurrentLanguage();

  const state = initTerminal();
  let inputValue = '';
  let errorMsg = '';

  const render = () => {
    clearMenu(state);
    let lineCount = 0;

    // Render prompt with default value hint
    let promptLine = `  ${prompt}`;
    if (defaultValue && !inputValue) {
      const defaultLabel = lang === 'en' ? 'default' : t('inputs.defaultValue');
      promptLine += ` ${uiColors.textSecondary}(${defaultLabel}: ${defaultValue})${colors.reset}`;
    }
    if (placeholder && !inputValue) {
      promptLine += ` ${uiColors.textSecondary}${placeholder}${colors.reset}`;
    }
    promptLine += `: ${uiColors.primary}${inputValue}_${colors.reset}`;
    writeLine(promptLine);
    lineCount++;

    // Render error message if any
    if (errorMsg) {
      writeLine(`  ${uiColors.error}✗ ${errorMsg}${colors.reset}`);
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
        const finalValue = inputValue || defaultValue;

        // Check if empty
        if (!allowEmpty && !finalValue) {
          errorMsg = errorMessage || t('inputs.cannotBeEmpty');
          render();
          return;
        }

        // Check min length
        if (minLength && finalValue.length < minLength) {
          errorMsg = errorMessage || `${t('inputs.minLength')}: ${minLength}`;
          render();
          return;
        }

        // Custom validation
        if (validate) {
          const validationResult = validate(finalValue);
          if (validationResult !== true) {
            errorMsg = typeof validationResult === 'string' ? validationResult : (errorMessage || t('inputs.invalidInput'));
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

      // Handle single-key typing and multi-char paste chunks.
      const chunk = isPrintable(key) ? key : normalizeTextChunk(key);
      if (chunk.length > 0) {
        // Check max length
        if (maxLength && inputValue.length >= maxLength) {
          return;
        }

        let next = chunk;
        if (maxLength) {
          const remaining = maxLength - inputValue.length;
          if (remaining <= 0) {
            return;
          }
          if (next.length > remaining) {
            next = next.slice(0, remaining);
          }
        }

        inputValue += next;
        errorMsg = ''; // Clear error on edit
        render();
        return;
      }
    };

    state.stdin.on('data', onData);
  });
}
