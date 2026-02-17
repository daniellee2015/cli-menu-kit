/**
 * CLI Menu Kit - Main Entry Point
 * A comprehensive, modular menu system for Node.js CLI applications
 */

// Export unified API
export { menuAPI as menu, inputAPI as input, wizardAPI as wizard } from './api.js';
export { default } from './api.js';

// Export Page Layout System (V1 - Legacy)
export {
  renderPage,
  type PageLayoutConfig,
  type HeaderConfig as LayoutHeaderConfig,
  type MainAreaConfig,
  type FooterConfig
} from './layout.js';

// Export Page Layout V2 (Component-Based)
export {
  renderPageV2,
  createComponent,
  type PageLayoutConfigV2,
  type AreaConfig,
  type Component
} from './layout-v2.js';

// Export Component Factories
export {
  createFullHeaderComponent,
  createSimpleHeaderComponent,
  createSectionHeaderComponent,
  createHintsComponent,
  createTableComponent,
  createListComponent,
  createSummaryTableComponent,
  createCustomComponent
} from './component-factories.js';

// Export menu components
export {
  showRadioMenu,
  showCheckboxMenu,
  showBooleanMenu
} from './components/menus/index.js';

// Export input components
export {
  showTextInput,
  showNumberInput,
  showLanguageSelector,
  showModifyField
} from './components/inputs/index.js';

// Export display components
export {
  renderSimpleHeader,
  renderSectionHeader,
  renderAsciiHeader,
  createSimpleHeader,
  createSectionHeader,
  createAsciiHeader,
  renderProgressIndicator,
  renderStageHeader,
  renderStageSeparator,
  createProgressIndicator,
  createStageHeader,
  createStageSeparator,
  renderMessage,
  showSuccess,
  showError,
  showWarning,
  showInfo,
  showQuestion,
  createMessage,
  renderSummaryTable,
  createSummaryTable,
  createSimpleSummary,
  renderHeader,
  type HeaderConfig,
  renderHintsComponent,
  createHints,
  generateMenuHints,
  generateInputHints,
  HintTypes,
  type HintsConfig,
  renderTable,
  createTable,
  type TableConfig,
  type TableColumn,
  renderList,
  createList,
  createBulletList,
  createNumberedList,
  type ListConfig,
  type ListItem
} from './components/display/index.js';

// Export features
export {
  runWizard,
  createWizard,
  WizardConfig,
  WizardStep,
  WizardResult
} from './features/wizard.js';

export {
  registerCommand,
  unregisterCommand,
  clearCustomCommands,
  isCommand,
  parseCommand,
  handleCommand,
  getAvailableCommands,
  showCommandHelp
} from './features/commands.js';

// Export i18n
export {
  getCurrentLanguage,
  setLanguage,
  t,
  registerLanguage,
  getAvailableLanguages,
  getCurrentLanguageMap
} from './i18n/registry.js';

// Export color configuration
export {
  colors,
  uiColors,
  defaultUIColors,
  getUIColors,
  setUIColors,
  resetUIColors,
  createGradient,
  applyGradient,
  colorize
} from './core/colors.js';

// Export types
export type {
  MenuOption,
  BaseMenuConfig,
  RadioMenuConfig,
  CheckboxMenuConfig,
  BooleanMenuConfig,
  RadioMenuResult,
  CheckboxMenuResult,
  BooleanMenuResult
} from './types/menu.types.js';

export type {
  BaseInputConfig,
  TextInputConfig,
  NumberInputConfig,
  LanguageSelectorConfig,
  ModifyFieldConfig,
  TextInputResult,
  NumberInputResult,
  LanguageSelectorResult,
  ModifyFieldResult
} from './types/input.types.js';

export type {
  HeaderType,
  SimpleHeaderConfig,
  AsciiHeaderConfig,
  ProgressConfig,
  MessageType,
  MessageConfig,
  SummaryTableConfig
} from './types/display.types.js';

export type {
  LanguageCode,
  LanguageMap,
  I18nRegistry
} from './i18n/types.js';

// Export core utilities (for advanced users)
export { KEY_CODES } from './core/keyboard.js';

// Legacy exports (for backward compatibility)
export * from './types';
export * from './components';
export * from './menu-core';
export * from './menu-single';
export * from './menu-multi';
export * from './input';
export * from './menu';
