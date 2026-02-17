/**
 * Input Prompt Component
 * Factory function to create input prompt configuration
 */

export interface InputPromptConfig {
  /** Prompt text to display */
  prompt: string;
  /** Default value */
  defaultValue?: string;
  /** Allow empty input */
  allowEmpty?: boolean;
}

/**
 * Create an input prompt component configuration
 * Returns a configuration object that can be used in footer.input
 *
 * @example
 * ```typescript
 * const inputConfig = createInputPromptComponent({
 *   prompt: '请输入名称',
 *   defaultValue: '',
 *   allowEmpty: false
 * });
 *
 * await renderPage({
 *   header: {...},
 *   mainArea: {...},
 *   footer: {
 *     input: inputConfig,
 *     hints: ['Enter 确认', 'Esc 取消']
 *   }
 * });
 * ```
 */
export function createInputPromptComponent(config: InputPromptConfig): InputPromptConfig {
  return {
    prompt: config.prompt,
    defaultValue: config.defaultValue,
    allowEmpty: config.allowEmpty ?? false
  };
}
