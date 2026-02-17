/**
 * Radio Menu Component - New Architecture Version
 * Renders menu directly in new architecture without calling old showRadioMenu
 */

import readline from 'readline';
import { Component, Rect, hintManager, screenManager, computeLayout } from '../../layout.js';
import type { RadioMenuConfig, RadioMenuResult, MenuOption } from '../../types/menu.types.js';
import { colors, uiColors } from '../../core/colors.js';

export interface RadioMenuComponentConfig {
  menuConfig: RadioMenuConfig;
  onResult: (result: RadioMenuResult) => Promise<void>;
}

export function createRadioMenuComponentV2(config: RadioMenuComponentConfig): Component {
  let selectedIndex = 0;
  const options = config.menuConfig.options;

  // Parse options
  const selectableIndices: number[] = [];
  const optionData: Array<{ value: string; isSeparator: boolean; label?: string }> = [];

  options.forEach((opt, index) => {
    if (typeof opt === 'object' && 'type' in opt && opt.type === 'separator') {
      optionData.push({ value: '', isSeparator: true, label: opt.label });
    } else {
      const value = typeof opt === 'string' ? opt : (opt as any).value || '';
      optionData.push({ value, isSeparator: false });
      selectableIndices.push(index);
    }
  });

  // Render function
  const renderMenu = (rect: Rect): string[] => {
    const lines: string[] = [];

    optionData.forEach((item, index) => {
      if (item.isSeparator) {
        // Render separator
        const label = item.label || '';
        const line = `${colors.dim}${'─'.repeat(5)} ${label} ${'─'.repeat(Math.max(0, 20 - label.length))}${colors.reset}`;
        lines.push(line);
      } else {
        // Render option
        const isSelected = index === selectedIndex;
        const prefix = isSelected ? `${colors.green}>${colors.reset}` : ' ';

        // Add number prefix
        const numberMatch = item.value.match(/^(\d+)\.\s*/);
        const letterMatch = item.value.match(/^([a-zA-Z])\.\s*/);
        const hasPrefix = numberMatch || letterMatch;
        const displayPrefix = hasPrefix ? '' : `${selectableIndices.indexOf(index) + 1}. `;

        // Check if exit option
        const isExitOption = /\b(exit|quit)\b/i.test(item.value);
        const displayValue = isExitOption ? `${uiColors.error}${item.value}${colors.reset}` : item.value;

        const text = isSelected
          ? `${colors.green}${colors.bold}${displayPrefix}${displayValue}${colors.reset}`
          : `${displayPrefix}${displayValue}`;

        lines.push(`${prefix} ${text}`);
      }
    });

    // Fill remaining lines
    while (lines.length < rect.height) {
      lines.push('');
    }

    return lines;
  };

  return {
    type: 'radio-menu',
    regionId: 'main',
    render: renderMenu,
    interact: async () => {
      return new Promise<void>((resolve) => {
        readline.emitKeypressEvents(process.stdin);
        if (process.stdin.isTTY) process.stdin.setRawMode(true);

        const onKey = async (str: string, key: readline.Key) => {
          if (key.ctrl && key.name === 'c') {
            cleanup();
            process.exit(0);
          }

          let needsUpdate = false;

          // Arrow key navigation
          if (key.name === 'up') {
            // Move to previous selectable option
            const currentPos = selectableIndices.indexOf(selectedIndex);
            if (currentPos > 0) {
              selectedIndex = selectableIndices[currentPos - 1];
              needsUpdate = true;
            }
          } else if (key.name === 'down') {
            // Move to next selectable option
            const currentPos = selectableIndices.indexOf(selectedIndex);
            if (currentPos < selectableIndices.length - 1) {
              selectedIndex = selectableIndices[currentPos + 1];
              needsUpdate = true;
            }
          }
          // Number key selection
          else if (config.menuConfig.allowNumberKeys && str && /^[0-9]$/.test(str)) {
            const num = parseInt(str, 10);
            if (num > 0 && num <= selectableIndices.length) {
              selectedIndex = selectableIndices[num - 1];
              needsUpdate = true;
            }
          }
          // Letter key selection
          else if (config.menuConfig.allowLetterKeys && str && /^[a-zA-Z]$/.test(str)) {
            // Find option starting with this letter
            const letter = str.toLowerCase();
            const matchIndex = selectableIndices.find(idx => {
              const value = optionData[idx].value.toLowerCase();
              return value.startsWith(letter) || value.match(new RegExp(`^\\d+\\.\\s*${letter}`, 'i'));
            });
            if (matchIndex !== undefined) {
              selectedIndex = matchIndex;
              needsUpdate = true;
            }
          }
          // Enter to confirm
          else if (key.name === 'return') {
            cleanup();
            const result: RadioMenuResult = {
              value: optionData[selectedIndex].value,
              index: selectableIndices.indexOf(selectedIndex)
            };
            await config.onResult(result);
            resolve();
            return;
          }

          // Update display if selection changed
          if (needsUpdate) {
            const layout = computeLayout();
            const lines = renderMenu(layout.main);
            screenManager.renderRegion('main', lines);

            // Update hint
            hintManager.set('menu', `Selected: ${optionData[selectedIndex].value}`, 10);
          }
        };

        function cleanup() {
          process.stdin.off('keypress', onKey);
          if (process.stdin.isTTY) process.stdin.setRawMode(false);
          hintManager.clear('menu');
        }

        process.stdin.on('keypress', onKey);

        // Set initial hint
        hintManager.set('menu', `Selected: ${optionData[selectedIndex].value}`, 10);
      });
    },
    config
  };
}
