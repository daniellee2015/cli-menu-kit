/**
 * Commands - Command handling system
 * Handles special commands like /quit, /help, /clear, /back
 */

import { clearScreen, writeLine } from '../core/terminal.js';
import { colors } from '../core/colors.js';

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
    description: string;
  };
}

/**
 * Default command registry
 */
const defaultCommands: CommandRegistry = {
  quit: {
    handler: () => {
      writeLine('\n👋 再见!');
      process.exit(0);
    },
    description: '退出应用程序'
  },
  help: {
    handler: () => {
      writeLine('\n可用命令:');
      Object.entries(defaultCommands).forEach(([cmd, { description }]) => {
        writeLine(`  ${colors.cyan}/${cmd}${colors.reset} - ${description}`);
      });
      writeLine('');
      return false; // Don't exit, continue
    },
    description: '显示帮助信息'
  },
  clear: {
    handler: () => {
      clearScreen();
      return false; // Don't exit, continue
    },
    description: '清除屏幕'
  },
  back: {
    handler: () => {
      return true; // Signal to go back
    },
    description: '返回上一级菜单'
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
  customCommands[command.toLowerCase()] = { handler, description };
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
  writeLine(`${colors.red}✗ 未知命令: /${command}${colors.reset}`);
  writeLine(`${colors.dim}输入 /help 查看可用命令${colors.reset}\n`);
  return false;
}

/**
 * Get all available commands
 * @returns Array of command names with descriptions
 */
export function getAvailableCommands(): Array<{ command: string; description: string }> {
  const commands: Array<{ command: string; description: string }> = [];

  // Add default commands
  Object.entries(defaultCommands).forEach(([cmd, { description }]) => {
    commands.push({ command: cmd, description });
  });

  // Add custom commands
  Object.entries(customCommands).forEach(([cmd, { description }]) => {
    commands.push({ command: cmd, description });
  });

  return commands;
}

/**
 * Show help for all commands
 */
export function showCommandHelp(): void {
  writeLine('\n可用命令:');

  // Show default commands
  writeLine(`\n${colors.cyan}默认命令:${colors.reset}`);
  Object.entries(defaultCommands).forEach(([cmd, { description }]) => {
    writeLine(`  ${colors.cyan}/${cmd}${colors.reset} - ${description}`);
  });

  // Show custom commands if any
  if (Object.keys(customCommands).length > 0) {
    writeLine(`\n${colors.cyan}自定义命令:${colors.reset}`);
    Object.entries(customCommands).forEach(([cmd, { description }]) => {
      writeLine(`  ${colors.cyan}/${cmd}${colors.reset} - ${description}`);
    });
  }

  writeLine('');
}
