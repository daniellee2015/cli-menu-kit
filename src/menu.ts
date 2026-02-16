/**
 * CLI Menu Kit - Menu Components
 * Interactive menu selection with arrow keys and keyboard shortcuts
 */

import { MenuConfig, MultiSelectConfig, MenuOption } from './types';
import { colors, theme, symbols, buildHint, showGoodbye } from './components';

/**
 * Interactive menu selection with BOTH arrow keys AND number input
 *
 * Features:
 * - Arrow keys (↑/↓) to navigate with live highlight
 * - Number/letter keys to directly jump and select
 * - Enter key (⏎) to confirm selection
 * - Input indicator at top shows current input
 *
 * @param options - Menu options (strings or objects with label/value)
 * @param config - Configuration object
 * @returns Selected index (0-based)
 */
export async function selectMenu(
  options: Array<string | MenuOption>,
  config: MenuConfig = {}
): Promise<number> {
  const { lang = 'zh', type = 'main' } = config;
  const inputPrompt = lang === 'zh'
    ? `${symbols.success.color}${symbols.success.icon}${colors.reset} 输入选项或用↑↓选择,回车确认: `
    : `${symbols.success.color}${symbols.success.icon}${colors.reset} Type option or use ↑↓ to select, Enter to confirm: `;

  // Choose hint keys based on menu type
  let hintKeys: Array<'arrows' | 'number' | 'letter' | 'enter' | 'esc'>;
  if (type === 'main') {
    hintKeys = ['arrows', 'number', 'letter', 'enter'];
  } else if (type === 'firstRun') {
    hintKeys = ['arrows', 'number', 'enter', 'esc'];
  } else {
    hintKeys = ['arrows', 'number', 'enter'];
  }

  const hintText = buildHint(hintKeys, lang);
  const hintLines = (hintText.match(/\n/g) || []).length + 1;

  return new Promise((resolve) => {
    let selectedIndex = 0;
    let isFirstRender = true;
    let renderedLines = 0;

    const stdin = process.stdin;
    stdin.setRawMode(true);
    stdin.resume();
    stdin.setEncoding('utf8');

    // Hide cursor
    process.stdout.write('\x1b[?25l');

    const cleanup = (finalIndex: number) => {
      stdin.setRawMode(false);
      stdin.removeListener('data', onKeyPress);

      if (renderedLines > 0) {
        process.stdout.write(`\x1b[${renderedLines}A`);
        process.stdout.write('\x1b[J');
      }

      process.stdout.write('\x1b[?25h');
      resolve(finalIndex);
    };

    const render = () => {
      const totalLines = 1 + 1 + options.length + 1 + hintLines;

      if (!isFirstRender) {
        process.stdout.write(`\x1b[${renderedLines}A`);
        process.stdout.write('\x1b[J');
      }
      isFirstRender = false;

      // Render input line
      process.stdout.write('\x1b[2K\r');
      process.stdout.write(`${theme.muted}${inputPrompt}${colors.reset}`);

      // Display current selection
      let displayValue = '';
      if (options[selectedIndex]) {
        const option = options[selectedIndex];
        if (typeof option === 'string') {
          // Check if option has number prefix
          const numMatch = option.match(/^(\d+)\./);
          if (numMatch) {
            displayValue = numMatch[1];
          } else {
            displayValue = String(selectedIndex + 1);
          }
        } else if (option.label) {
          const match = option.label.match(/^([^.]+)\./);
          if (match) {
            displayValue = match[1];
          } else {
            displayValue = String(selectedIndex + 1);
          }
        }
      }
      process.stdout.write(`${theme.active}${displayValue}${colors.reset}`);
      console.log();
      console.log();

      // Render menu options
      options.forEach((option, index) => {
        const isSelected = index === selectedIndex;
        const prefix = isSelected ? `${theme.active}❯ ` : '  ';
        const numColor = isSelected ? theme.active : theme.primary;
        const titleColor = isSelected ? theme.active : theme.title;

        if (typeof option === 'string') {
          // Check if option already has number prefix (e.g., "1. Title")
          const numMatch = option.match(/^(\d+\.\s*)(.+)$/);
          if (numMatch) {
            // Option already has number, use it
            const num = numMatch[1];
            const rest = numMatch[2];
            // Check for description separator
            const descMatch = rest.match(/^([^-]+)(\s*-\s*.+)?$/);
            if (descMatch && descMatch[2]) {
              const title = descMatch[1];
              const desc = descMatch[2];
              console.log(`${prefix}${numColor}${num}${titleColor}${title}${theme.muted}${desc}${colors.reset}`);
            } else {
              console.log(`${prefix}${numColor}${num}${titleColor}${rest}${colors.reset}`);
            }
          } else {
            // No number prefix, add index-based number
            const match = option.match(/^([^-]+)(\s*-\s*.+)?$/);
            if (match && match[2]) {
              const title = match[1];
              const desc = match[2];
              console.log(`${prefix}${numColor}${index + 1}.${colors.reset} ${titleColor}${title}${theme.muted}${desc}${colors.reset}`);
            } else {
              console.log(`${prefix}${numColor}${index + 1}.${colors.reset} ${titleColor}${option}${colors.reset}`);
            }
          }
        } else if (option.label) {
          const match = option.label.match(/^([^.]+\.\s*)([^-]+)(\s*-\s*.+)?$/);
          if (match) {
            const num = match[1];
            const title = match[2];
            const desc = match[3] || '';
            console.log(`${prefix}${numColor}${num}${titleColor}${title}${theme.muted}${desc}${colors.reset}`);
          } else {
            console.log(`${prefix}${numColor}${index + 1}.${colors.reset} ${titleColor}${option.label}${colors.reset}`);
          }
        }
      });

      console.log();
      const indent = '  ';
      const indentedHint = hintText.split('\n').map(line => indent + line).join('\n');
      console.log(indentedHint);

      renderedLines = totalLines;
    };

    const onKeyPress = (key: string) => {
      if (key === '\u001b[A') { // Up arrow
        selectedIndex = selectedIndex > 0 ? selectedIndex - 1 : options.length - 1;
        render();
      } else if (key === '\u001b[B') { // Down arrow
        selectedIndex = selectedIndex < options.length - 1 ? selectedIndex + 1 : 0;
        render();
      } else if (key === '\r') { // Enter
        cleanup(selectedIndex);
      } else if (key === '\u001b' || key === '\u001b[') { // Esc
        if (type === 'firstRun') {
          stdin.setRawMode(false);
          stdin.removeListener('data', onKeyPress);
          process.stdout.write('\x1b[?25h');
          showGoodbye(lang);
          process.exit(0);
        }
      } else if (key === '\u0003') { // Ctrl+C
        stdin.setRawMode(false);
        stdin.removeListener('data', onKeyPress);
        process.stdout.write('\x1b[?25h');
        showGoodbye(lang);
        process.exit(0);
      } else if (key.match(/^[0-9]$/)) { // Number key
        const num = parseInt(key);
        if (num >= 1 && num <= options.length) {
          selectedIndex = num - 1;
          render();
        }
      } else if (key.match(/^[a-zA-Z]$/)) { // Letter key
        const letter = key.toUpperCase();
        options.forEach((option, index) => {
          if (typeof option !== 'string' && option.label) {
            const match = option.label.match(/^([A-Z])\./);
            if (match && match[1] === letter) {
              selectedIndex = index;
            }
          }
        });
        render();
      }
    };

    stdin.on('data', onKeyPress);
    render();
  });
}

/**
 * Interactive multi-select menu with checkboxes
 *
 * Features:
 * - Arrow keys (↑/↓) to navigate
 * - Space to toggle selection
 * - A to select all
 * - I to invert selection
 * - Enter to confirm
 * - Shows ◉ for selected items, ○ for unselected items
 *
 * @param options - Menu options
 * @param config - Configuration object
 * @returns Array of selected indices
 */
export async function selectMultiMenu(
  options: string[],
  config: MultiSelectConfig = {}
): Promise<number[]> {
  const { lang = 'zh', defaultSelected = [] } = config;

  const inputPrompt = lang === 'zh'
    ? `${symbols.success.color}${symbols.success.icon}${colors.reset} 空格选中/取消,回车确认: `
    : `${symbols.success.color}${symbols.success.icon}${colors.reset} Space to toggle, Enter to confirm: `;

  const hintText = buildHint(['arrows', 'space', 'all', 'invert', 'enter'], lang);
  const hintLines = (hintText.match(/\n/g) || []).length + 1;

  return new Promise((resolve) => {
    let selectedIndex = 0;
    let selectedItems = new Set(defaultSelected);
    let isFirstRender = true;
    let renderedLines = 0;

    const stdin = process.stdin;
    stdin.setRawMode(true);
    stdin.resume();
    stdin.setEncoding('utf8');

    process.stdout.write('\x1b[?25l');

    const cleanup = () => {
      stdin.setRawMode(false);
      stdin.removeListener('data', onKeyPress);

      if (renderedLines > 0) {
        process.stdout.write(`\x1b[${renderedLines}A`);
        process.stdout.write('\x1b[J');
      }

      process.stdout.write('\x1b[?25h');
      resolve(Array.from(selectedItems).sort((a, b) => a - b));
    };

    const render = () => {
      const totalLines = 1 + 1 + options.length + 1 + hintLines;

      if (!isFirstRender) {
        process.stdout.write(`\x1b[${renderedLines}A`);
        process.stdout.write('\x1b[J');
      }
      isFirstRender = false;

      // Render input line
      process.stdout.write('\x1b[2K\r');
      process.stdout.write(`${theme.muted}${inputPrompt}${colors.reset}`);
      const selectedText = lang === 'zh' ? `${selectedItems.size} 项已选` : `${selectedItems.size} selected`;
      process.stdout.write(`${theme.active}${selectedText}${colors.reset}`);
      console.log();
      console.log();

      // Render options with checkboxes
      options.forEach((option, index) => {
        const isCurrentLine = index === selectedIndex;
        const isChecked = selectedItems.has(index);

        const prefix = isCurrentLine ? `${theme.active}❯ ` : '  ';
        const checkbox = isChecked ? `${theme.success}◉` : `${theme.muted}○`;
        const textColor = isCurrentLine ? theme.active : (isChecked ? theme.title : colors.reset);

        console.log(`${prefix}${checkbox} ${textColor}${option}${colors.reset}`);
      });

      console.log();
      const indent = '  ';
      const indentedHint = hintText.split('\n').map(line => indent + line).join('\n');
      console.log(indentedHint);

      renderedLines = totalLines;
    };

    const onKeyPress = (key: string) => {
      if (key === '\u001b[A') { // Up arrow
        selectedIndex = selectedIndex > 0 ? selectedIndex - 1 : options.length - 1;
        render();
      } else if (key === '\u001b[B') { // Down arrow
        selectedIndex = selectedIndex < options.length - 1 ? selectedIndex + 1 : 0;
        render();
      } else if (key === ' ') { // Space
        if (selectedItems.has(selectedIndex)) {
          selectedItems.delete(selectedIndex);
        } else {
          selectedItems.add(selectedIndex);
        }
        render();
      } else if (key.toUpperCase() === 'A') { // A - select all
        selectedItems.clear();
        for (let i = 0; i < options.length; i++) {
          selectedItems.add(i);
        }
        render();
      } else if (key.toUpperCase() === 'I') { // I - invert
        const newSelected = new Set<number>();
        for (let i = 0; i < options.length; i++) {
          if (!selectedItems.has(i)) {
            newSelected.add(i);
          }
        }
        selectedItems = newSelected;
        render();
      } else if (key === '\r') { // Enter
        cleanup();
      } else if (key === '\u0003') { // Ctrl+C
        stdin.setRawMode(false);
        stdin.removeListener('data', onKeyPress);
        process.stdout.write('\x1b[?25h');
        showGoodbye(lang);
        process.exit(0);
      }
    };

    stdin.on('data', onKeyPress);
    render();
  });
}
