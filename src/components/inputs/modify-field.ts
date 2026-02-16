/**
 * ModifyField - Field modification composite component
 * Shows current value and asks if user wants to modify it
 */

import { ModifyFieldConfig, ModifyFieldResult } from '../../types/input.types.js';
import { showBooleanMenu } from '../menus/boolean-menu.js';
import { showTextInput } from './text-input.js';

/**
 * Show a modify field prompt
 * @param config - Field configuration
 * @returns Promise resolving to modification result
 */
export async function showModifyField(config: ModifyFieldConfig): Promise<ModifyFieldResult> {
  const {
    fieldName,
    currentValue,
    modifyPrompt = `是否修改 ${fieldName}? (当前: ${currentValue})`,
    newValuePrompt = `请输入新的 ${fieldName}`,
    validate,
    onExit
  } = config;

  // Ask if user wants to modify
  const shouldModify = await showBooleanMenu({
    question: modifyPrompt,
    orientation: 'horizontal',
    defaultValue: false,
    onExit
  });

  // If user doesn't want to modify, return current value
  if (!shouldModify) {
    return {
      modified: false,
      value: currentValue
    };
  }

  // Get new value
  const newValue = await showTextInput({
    prompt: newValuePrompt,
    defaultValue: currentValue,
    validate,
    onExit
  });

  return {
    modified: true,
    value: newValue
  };
}
