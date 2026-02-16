/**
 * Messages - Message display components
 * Displays success, error, warning, info, and question messages
 */

import { MessageConfig, MessageType } from '../../types/display.types.js';
import { writeLine } from '../../core/terminal.js';
import { colors } from '../../core/colors.js';

/**
 * Render a message with icon
 * @param config - Message configuration
 */
export function renderMessage(config: MessageConfig): void {
  const { type, message } = config;

  let icon = '';
  let color: string = colors.reset;

  switch (type) {
    case 'success':
      icon = '✓';
      color = colors.green;
      break;
    case 'error':
      icon = '✗';
      color = colors.red;
      break;
    case 'warning':
      icon = '⚠';
      color = colors.yellow;
      break;
    case 'info':
      icon = 'ℹ';
      color = colors.blue;
      break;
    case 'question':
      icon = '?';
      color = colors.yellow;
      break;
  }

  writeLine(`${color}${icon}${colors.reset} ${message}`);
}

/**
 * Display a success message
 * @param message - Message text
 */
export function showSuccess(message: string): void {
  renderMessage({ type: 'success', message });
}

/**
 * Display an error message
 * @param message - Message text
 */
export function showError(message: string): void {
  renderMessage({ type: 'error', message });
}

/**
 * Display a warning message
 * @param message - Message text
 */
export function showWarning(message: string): void {
  renderMessage({ type: 'warning', message });
}

/**
 * Display an info message
 * @param message - Message text
 */
export function showInfo(message: string): void {
  renderMessage({ type: 'info', message });
}

/**
 * Display a question message
 * @param message - Message text
 */
export function showQuestion(message: string): void {
  renderMessage({ type: 'question', message });
}

/**
 * Create a message
 * @param type - Message type
 * @param message - Message text
 */
export function createMessage(type: MessageType, message: string): void {
  renderMessage({ type, message });
}
