/**
 * Commands - Command handling system
 * Handles special commands like /quit, /help, /clear, /back
 */

import { clearScreen, writeLine } from '../core/terminal.js';
import { colors, uiColors } from '../core/colors.js';
import { t } from '../i18n/registry.js';

/**
 * Command handler function type
 */
export type CommandHandler = (args?: string[]) => boolean | void;

/**
 * Command registry
 */
interface CommandRegistry {
  [command: string]: {
    handler: CommandHandler;
    descriptionKey: string;
  };
}

/**
 * Default command registry
 */
const defaultCommands: CommandRegistry = {
  quit: {
    handler: () => {
      writeLine(`\n${t('messages.goodbye')}`);
      process.exit(0);
    },
    descriptionKey: 'commands.quit'
  },
  help: {
    handler: () => {
      writeLine(`\n${t('commands.availableCommands')}:`);
      Object.entries(defaultCommands).forEach(([cmd, { descriptionKey }]) => {
        writeLine(`  ${uiColors.primary}/${cmd}${colors.reset} - ${t(descriptionKey)}`);
      });
      writeLine('');
      return false; // Don't exit, continue
    },
    descriptionKey: 'commands.help'
  },
  clear: {
    handler: () => {
      clearScreen();
      return false; // Don't exit, continue
    },
    descriptionKey: 'commands.clear'
  },
  back: {
    handler: () => {
      return true; // Signal to go back
    },
    descriptionKey: 'commands.back'
  }
};

/**
 * Custom command registry (can be extended by users)
 */
let customCommands: CommandRegistry = {};

/**
 * Register a custom command
 * @param command - Command name (without /)
 * @param handler - Command handler function
 * @param description - Command description
 */
export function registerCommand(
  command: string,
  handler: CommandHandler,
  description: string
): void {
  customCommands[command.toLowerCase()] = { handler, descriptionKey: description };
}

/**
 * Unregister a custom command
 * @param command - Command name (without /)
 */
export function unregisterCommand(command: string): void {
  delete customCommands[command.toLowerCase()];
}

/**
 * Clear all custom commands
 */
export function clearCustomCommands(): void {
  customCommands = {};
}

/**
 * Check if input is a command
 * @param input - Input string
 * @returns True if input is a command
 */
export function isCommand(input: string): boolean {
  return input.startsWith('/');
}

/**
 * Parse command from input
 * @param input - Input string
 * @returns Command name and args, or null if not a command
 */
export function parseCommand(input: string): { command: string; args: string[] } | null {
  if (!isCommand(input)) {
    return null;
  }

  const parts = input.slice(1).split(/\s+/);
  const command = parts[0].toLowerCase();
  const args = parts.slice(1);

  return { command, args };
}

/**
 * Handle a command
 * @param input - Input string
 * @returns Command result (true = handled and should exit/go back, false = continue, undefined = not a command)
 */
export function handleCommand(input: string): boolean | undefined {
  const parsed = parseCommand(input);
  if (!parsed) {
    return undefined; // Not a command
  }

  const { command, args } = parsed;

  // Check custom commands first
  if (customCommands[command]) {
    const result = customCommands[command].handler(args);
    return result === undefined ? false : result;
  }

  // Check default commands
  if (defaultCommands[command]) {
    const result = defaultCommands[command].handler(args);
    return result === undefined ? false : result;
  }

  // Unknown command
  writeLine(`${uiColors.error}✗ ${t('messages.unknownCommand')}: /${command}${colors.reset}`);
  writeLine(`${uiColors.textSecondary}${t('messages.helpPrompt')}${colors.reset}\n`);
  return false;
}

/**
 * Get all available commands
 * @returns Array of command names with descriptions
 */
export function getAvailableCommands(): Array<{ command: string; description: string }> {
  const commands: Array<{ command: string; description: string }> = [];

  // Add default commands
  Object.entries(defaultCommands).forEach(([cmd, { descriptionKey }]) => {
    commands.push({ command: cmd, description: t(descriptionKey) });
  });

  // Add custom commands
  Object.entries(customCommands).forEach(([cmd, { descriptionKey }]) => {
    commands.push({ command: cmd, description: descriptionKey });
  });

  return commands;
}

/**
 * Show help for all commands
 */
export function showCommandHelp(): void {
  writeLine(`\n${t('commands.availableCommands')}:`);

  // Show default commands
  writeLine(`\n${uiColors.primary}${t('commands.defaultCommands')}:${colors.reset}`);
  Object.entries(defaultCommands).forEach(([cmd, { descriptionKey }]) => {
    writeLine(`  ${uiColors.primary}/${cmd}${colors.reset} - ${t(descriptionKey)}`);
  });

  // Show custom commands if any
  if (Object.keys(customCommands).length > 0) {
    writeLine(`\n${uiColors.primary}${t('commands.customCommands')}:${colors.reset}`);
    Object.entries(customCommands).forEach(([cmd, { descriptionKey }]) => {
      writeLine(`  ${uiColors.primary}/${cmd}${colors.reset} - ${descriptionKey}`);
    });
  }

  writeLine('');
}
