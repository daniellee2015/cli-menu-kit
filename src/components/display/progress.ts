/**
 * Progress - Progress indicator components
 * Displays step flow and stage information
 */

import { ProgressConfig } from '../../types/display.types.js';
import { writeLine } from '../../core/terminal.js';
import { colors } from '../../core/colors.js';
import { getTerminalWidth } from '../../core/terminal.js';

/**
 * Render a progress indicator showing steps
 * @param config - Progress configuration
 */
export function renderProgressIndicator(config: ProgressConfig): void {
  const {
    steps,
    currentStep,
    separator = '→'
  } = config;

  const parts: string[] = [];

  steps.forEach((step, index) => {
    if (index === currentStep) {
      // Current step - highlighted
      parts.push(`${colors.cyan}${step}${colors.reset}`);
    } else if (index < currentStep) {
      // Completed step - normal
      parts.push(step);
    } else {
      // Future step - dimmed
      parts.push(`${colors.dim}${step}${colors.reset}`);
    }
  });

  const progressLine = `  ${parts.join(` ${colors.dim}${separator}${colors.reset} `)}`;
  writeLine(progressLine);
}

/**
 * Render a stage header with step number
 * @param stageName - Name of the stage
 * @param stepNumber - Step number (1-based)
 */
export function renderStageHeader(stageName: string, stepNumber: number): void {
  writeLine(`  ${colors.cyan}步骤${stepNumber}: ${stageName}${colors.reset}`);
}

/**
 * Render a stage separator
 * @param char - Character to use for separator
 * @param width - Width of separator (default: terminal width)
 */
export function renderStageSeparator(char: string = '─', width?: number): void {
  const termWidth = getTerminalWidth();
  const sepWidth = width || termWidth;
  writeLine(colors.dim + char.repeat(sepWidth) + colors.reset);
}

/**
 * Create a progress indicator
 * @param steps - Array of step names
 * @param currentStep - Index of current step (0-based)
 * @param separator - Optional separator character
 */
export function createProgressIndicator(
  steps: string[],
  currentStep: number,
  separator?: string
): void {
  renderProgressIndicator({ steps, currentStep, separator });
}

/**
 * Create a stage header
 * @param stageName - Name of the stage
 * @param stepNumber - Step number (1-based)
 */
export function createStageHeader(stageName: string, stepNumber: number): void {
  renderStageHeader(stageName, stepNumber);
}

/**
 * Create a stage separator
 * @param char - Optional separator character
 * @param width - Optional width
 */
export function createStageSeparator(char?: string, width?: number): void {
  renderStageSeparator(char, width);
}
