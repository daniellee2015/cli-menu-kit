/**
 * Wizard - Initialization wizard system
 * Multi-step configuration flow with progress tracking
 */

import { showRadioMenu } from '../components/menus/radio-menu.js';
import { showCheckboxMenu } from '../components/menus/checkbox-menu.js';
import { showBooleanMenu } from '../components/menus/boolean-menu.js';
import { showTextInput } from '../components/inputs/text-input.js';
import { showNumberInput } from '../components/inputs/number-input.js';
import { showLanguageSelector } from '../components/inputs/language-input.js';
import { createProgressIndicator, createStageHeader, createStageSeparator } from '../components/display/progress.js';
import { showSuccess } from '../components/display/messages.js';

/**
 * Wizard step component type
 */
export type WizardComponentType =
  | 'radio-menu'
  | 'checkbox-menu'
  | 'boolean-menu'
  | 'text-input'
  | 'number-input'
  | 'language-selector';

/**
 * Wizard step configuration
 */
export interface WizardStep {
  /** Step name/identifier */
  name: string;

  /** Step title for display */
  title: string;

  /** Component type to use */
  component: WizardComponentType;

  /** Component-specific configuration */
  config: any;

  /** Whether this step is required */
  required?: boolean;

  /** Validation function */
  validate?: (value: any) => boolean | string;

  /** Skip condition (if returns true, skip this step) */
  skip?: (results: Record<string, any>) => boolean;
}

/**
 * Wizard configuration
 */
export interface WizardConfig {
  /** Wizard title */
  title?: string;

  /** Array of wizard steps */
  steps: WizardStep[];

  /** Show progress indicator */
  showProgress?: boolean;

  /** Callback when wizard completes */
  onComplete?: (results: Record<string, any>) => void;

  /** Callback when wizard is cancelled */
  onCancel?: () => void;
}

/**
 * Wizard result
 */
export interface WizardResult {
  completed: boolean;
  results: Record<string, any>;
}

/**
 * Run a wizard
 * @param config - Wizard configuration
 * @returns Promise resolving to wizard results
 */
export async function runWizard(config: WizardConfig): Promise<WizardResult> {
  const {
    title,
    steps,
    showProgress = true,
    onComplete,
    onCancel
  } = config;

  const results: Record<string, any> = {};
  const stepNames = steps.map(s => s.title);

  for (let i = 0; i < steps.length; i++) {
    const step = steps[i];

    // Check skip condition
    if (step.skip && step.skip(results)) {
      continue;
    }

    // Show progress
    if (showProgress) {
      console.log('');
      createProgressIndicator(stepNames, i);
      console.log('');
    }

    // Show stage header
    createStageHeader(step.title, i + 1);
    console.log('');

    // Execute step component
    let value: any;

    try {
      switch (step.component) {
        case 'radio-menu':
          value = await showRadioMenu(step.config);
          break;

        case 'checkbox-menu':
          value = await showCheckboxMenu(step.config);
          break;

        case 'boolean-menu':
          value = await showBooleanMenu(step.config);
          break;

        case 'text-input':
          value = await showTextInput(step.config);
          break;

        case 'number-input':
          value = await showNumberInput(step.config);
          break;

        case 'language-selector':
          value = await showLanguageSelector(step.config);
          break;

        default:
          throw new Error(`Unknown component type: ${step.component}`);
      }
    } catch (error) {
      // User cancelled (Ctrl+C)
      if (onCancel) {
        onCancel();
      }
      return { completed: false, results };
    }

    // Validate result
    if (step.validate) {
      const validationResult = step.validate(value);
      if (validationResult !== true) {
        const errorMsg = typeof validationResult === 'string'
          ? validationResult
          : 'Validation failed';
        console.log(`\n❌ ${errorMsg}\n`);
        i--; // Retry this step
        continue;
      }
    }

    // Store result
    results[step.name] = value;

    // Show stage separator (except after last step)
    if (i < steps.length - 1) {
      console.log('');
      createStageSeparator();
      console.log('');
    }
  }

  // Wizard completed
  console.log('');
  showSuccess('配置完成!');
  console.log('');

  if (onComplete) {
    onComplete(results);
  }

  return { completed: true, results };
}

/**
 * Create a simple wizard
 * @param steps - Array of wizard steps
 * @param onComplete - Completion callback
 * @returns Promise resolving to wizard results
 */
export async function createWizard(
  steps: WizardStep[],
  onComplete?: (results: Record<string, any>) => void
): Promise<WizardResult> {
  return runWizard({ steps, onComplete });
}
