/**
 * CLI Menu Kit - Input Components
 * Handles user input interactions
 */

import { colors, theme, symbols, showGoodbye } from './components';

export interface InputOptions {
  lang?: 'zh' | 'en';
  defaultValue?: string;
  indent?: string;
  validator?: (input: string) => boolean | string; // true = valid, false/string = error message
}

/**
 * Ask for user text input with optional default value and validation
 *
 * @param prompt - Prompt text
 * @param options - Input options
 * @returns User input or default value
 */
export async function askInput(
  prompt: string,
  options: InputOptions = {}
): Promise<string> {
  const {
    lang = 'zh',
    defaultValue = '',
    indent = '  ',
    validator
  } = options;

  return new Promise((resolve) => {
    const stdin = process.stdin;
    const stdout = process.stdout;

    // Show prompt with grayed default value hint
    const promptLine = `${indent}${prompt}: `;
    const defaultHint = defaultValue
      ? `${theme.muted}(${lang === 'zh' ? '默认' : 'default'}: ${defaultValue})${colors.reset} `
      : '';

    stdout.write(promptLine);
    stdout.write(defaultHint);

    // Hide cursor to avoid visual artifacts
    stdout.write('\x1b[?25l');

    let input = '';

    stdin.setRawMode(true);
    stdin.resume();
    stdin.setEncoding('utf8');

    const onData = (key: string) => {
      // Ctrl+C
      if (key === '\u0003') {
        stdin.setRawMode(false);
        stdin.removeListener('data', onData);

        // Clear current line
        stdout.write('\r\x1b[K');

        // Show cursor
        stdout.write('\x1b[?25h');

        // Show goodbye message
        showGoodbye(lang);

        process.exit(0);
      }

      // Enter
      if (key === '\r' || key === '\n') {
        const result = input.trim() || defaultValue;

        // Validate if validator provided
        if (validator) {
          const validationResult = validator(result);
          if (validationResult !== true) {
            // Show error and continue input
            const errorMsg = typeof validationResult === 'string'
              ? validationResult
              : (lang === 'zh' ? '输入无效' : 'Invalid input');
            stdout.write(`\n${indent}${colors.red}${errorMsg}${colors.reset}\n`);
            stdout.write(promptLine);
            stdout.write(defaultHint);
            stdout.write(' ');
            stdout.write(input);
            return;
          }
        }

        stdin.setRawMode(false);
        stdin.removeListener('data', onData);

        // Clear the entire input line
        stdout.write('\r\x1b[K');

        // Show cursor
        stdout.write('\x1b[?25h');

        resolve(result);
        return;
      }

      // Backspace / Delete
      if (key === '\u007F' || key === '\b') {
        if (input.length > 0) {
          input = input.slice(0, -1);
          // Clear line and redraw
          stdout.write('\r\x1b[K');
          stdout.write(promptLine);
          stdout.write(defaultHint);
          stdout.write(' ');
          stdout.write(input);
        }
        return;
      }

      // Ignore escape sequences (arrow keys, etc.)
      if (key.charCodeAt(0) === 27) {
        return;
      }

      // Normal character input
      if (key.charCodeAt(0) >= 32) {
        input += key;
        // Clear line and redraw to handle multi-byte characters properly
        stdout.write('\r\x1b[K');
        stdout.write(promptLine);
        stdout.write(defaultHint);
        stdout.write(' ');
        stdout.write(input);
      }
    };

    stdin.on('data', onData);
  });
}

/**
 * Ask Yes/No question with interactive selection
 *
 * @param prompt - Question prompt
 * @param options - Options
 * @returns true for Yes, false for No
 */
export async function askYesNo(
  prompt: string,
  options: { lang?: 'zh' | 'en'; defaultYes?: boolean } = {}
): Promise<boolean> {
  const { lang = 'zh', defaultYes = true } = options;

  const optionLabels = lang === 'zh' ? ['是', '否'] : ['Yes', 'No'];

  return new Promise((resolve) => {
    let selectedIndex = defaultYes ? 0 : 1;
    const stdin = process.stdin;
    stdin.setRawMode(true);
    stdin.resume();
    stdin.setEncoding('utf8');

    // Hide cursor
    process.stdout.write('\x1b[?25l');

    const render = () => {
      // Clear current line
      process.stdout.write('\r\x1b[K');

      // Render prompt with question symbol
      process.stdout.write(`  ${symbols.warning.color}${symbols.warning.icon} ${colors.reset}${prompt} `);

      // Render options
      optionLabels.forEach((option, index) => {
        const isSelected = index === selectedIndex;
        if (isSelected) {
          process.stdout.write(`${theme.active}${option}${colors.reset}`);
        } else {
          process.stdout.write(`${theme.muted}${option}${colors.reset}`);
        }

        if (index < optionLabels.length - 1) {
          process.stdout.write(` ${theme.muted}|${colors.reset} `);
        }
      });
    };

    const cleanup = (result: boolean) => {
      stdin.setRawMode(false);
      stdin.removeListener('data', onKeyPress);
      process.stdout.write('\r\x1b[K'); // Clear current line
      process.stdout.write('\x1b[?25h'); // Show cursor
      resolve(result);
    };

    const onKeyPress = (key: string) => {
      if (key === '\u001b[C') { // Right arrow
        selectedIndex = (selectedIndex + 1) % optionLabels.length;
        render();
      } else if (key === '\u001b[D') { // Left arrow
        selectedIndex = (selectedIndex - 1 + optionLabels.length) % optionLabels.length;
        render();
      } else if (key === '\r') { // Enter
        cleanup(selectedIndex === 0); // 0 = Yes/是, 1 = No/否
      } else if (key === '\u001b' || key === '\u001b[') { // Esc
        cleanup(false); // Default to No on Esc
      } else if (key === '\u0003') { // Ctrl+C
        stdin.setRawMode(false);
        stdin.removeListener('data', onKeyPress);

        // Clear current line
        process.stdout.write('\r\x1b[K');

        // Show cursor
        process.stdout.write('\x1b[?25h');

        // Show goodbye message
        showGoodbye(lang);

        process.exit(0);
      } else {
        // Ignore all other keys - re-render to clear any echo
        render();
      }
    };

    stdin.on('data', onKeyPress);
    render();
  });
}

/**
 * Ask for number input with validation
 *
 * @param prompt - Prompt text
 * @param options - Input options
 * @returns Number input
 */
export async function askNumber(
  prompt: string,
  options: InputOptions & { min?: number; max?: number } = {}
): Promise<number> {
  const { lang = 'zh', min, max } = options;

  const validator = (input: string): boolean | string => {
    const num = parseFloat(input);
    if (isNaN(num)) {
      return lang === 'zh' ? '请输入有效的数字' : 'Please enter a valid number';
    }
    if (min !== undefined && num < min) {
      return lang === 'zh' ? `数字不能小于 ${min}` : `Number cannot be less than ${min}`;
    }
    if (max !== undefined && num > max) {
      return lang === 'zh' ? `数字不能大于 ${max}` : `Number cannot be greater than ${max}`;
    }
    return true;
  };

  const result = await askInput(prompt, { ...options, validator });
  return parseFloat(result);
}
