/**
 * English translations
 */

import { LanguageMap } from '../types.js';

export const en: LanguageMap = {
  menus: {
    selectPrompt: 'Enter option or use ↑↓ to select, press Enter to confirm',
    multiSelectPrompt: 'Space to toggle, Enter to confirm',
    confirmPrompt: 'Press Enter to confirm',
    selectedCount: 'selected',
    yes: 'Yes',
    no: 'No'
  },
  hints: {
    arrows: '↑↓ Arrow keys',
    space: 'Space Toggle',
    enter: '⏎ Confirm',
    numbers: '0-9 Number keys',
    letters: 'Letter Shortcuts',
    selectAll: 'A Select all',
    invert: 'I Invert',
    yesNo: 'Y/N Quick keys',
    exit: 'Ctrl+C Exit'
  },
  messages: {
    success: 'Success',
    error: 'Error',
    warning: 'Warning',
    info: 'Info',
    question: 'Question',
    goodbye: '👋 Goodbye!',
    unknownCommand: 'Unknown command',
    helpPrompt: 'Type /help to see available commands'
  },
  inputs: {
    defaultValue: 'default',
    enterText: 'Enter text',
    enterNumber: 'Enter number',
    minLength: 'Min length',
    maxLength: 'Max length',
    minValue: 'Min value',
    maxValue: 'Max value',
    invalidInput: 'Invalid input',
    cannotBeEmpty: 'Cannot be empty'
  },
  commands: {
    quit: 'Exit application',
    help: 'Show help information',
    clear: 'Clear screen',
    back: 'Go back to previous menu',
    availableCommands: 'Available commands',
    defaultCommands: 'Default commands',
    customCommands: 'Custom commands'
  }
};
