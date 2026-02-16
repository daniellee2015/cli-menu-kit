/**
 * CLI Menu Kit - Unified Menu Wrapper
 * Convenient API for all menu types
 */

import { selectMenu } from './menu-single';
import { selectMultiMenu } from './menu-multi';
import { askYesNo, askInput, askNumber } from './input';
import { MenuConfig, MenuOption, MultiSelectConfig } from './types';

/**
 * Unified menu interface
 * Provides convenient access to all menu types
 */
export const menu = {
  /**
   * Single-select menu (vertical)
   * @param options - Menu options
   * @param config - Configuration
   * @returns Selected index
   */
  select: selectMenu,

  /**
   * Multi-select menu (vertical with checkboxes)
   * @param options - Menu options
   * @param config - Configuration
   * @returns Array of selected indices
   */
  multiSelect: selectMultiMenu,

  /**
   * Yes/No confirmation (horizontal single-select)
   * @param prompt - Question to ask
   * @param options - Configuration
   * @returns true for Yes, false for No
   */
  confirm: askYesNo,

  /**
   * Text input
   * @param prompt - Input prompt
   * @param options - Configuration with validation
   * @returns User input string
   */
  input: askInput,

  /**
   * Number input
   * @param prompt - Input prompt
   * @param options - Configuration with min/max
   * @returns User input number
   */
  number: askNumber
};

/**
 * Create a parent-child menu relationship
 * Parent is single-select, child is multi-select
 *
 * @param parentOptions - Parent menu options
 * @param getChildOptions - Function to get child options based on parent selection
 * @param config - Configuration
 * @returns Object with parentIndex and childIndices
 */
export async function selectWithChildren(
  parentOptions: Array<string | MenuOption>,
  getChildOptions: (parentIndex: number) => string[],
  config: {
    parentConfig?: MenuConfig;
    childConfig?: MultiSelectConfig;
  } = {}
): Promise<{ parentIndex: number; childIndices: number[] }> {
  // Show parent menu
  const parentIndex = await selectMenu(parentOptions, config.parentConfig);

  // Get child options based on parent selection
  const childOptions = getChildOptions(parentIndex);

  // Show child menu if there are options
  let childIndices: number[] = [];
  if (childOptions.length > 0) {
    childIndices = await selectMultiMenu(childOptions, config.childConfig);
  }

  return { parentIndex, childIndices };
}

// Export individual functions for direct use
export { selectMenu, selectMultiMenu, askYesNo, askInput, askNumber };
