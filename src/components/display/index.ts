/**
 * Display components index
 * Exports all display component functions
 */

export {
  renderSimpleHeader,
  renderSectionHeader,
  renderAsciiHeader,
  createSimpleHeader,
  createSectionHeader,
  createAsciiHeader
} from './headers.js';

export {
  renderProgressIndicator,
  renderStageHeader,
  renderStageSeparator,
  createProgressIndicator,
  createStageHeader,
  createStageSeparator
} from './progress.js';

export {
  renderMessage,
  showSuccess,
  showError,
  showWarning,
  showInfo,
  showQuestion,
  createMessage
} from './messages.js';

export {
  renderSummaryTable,
  createSummaryTable,
  createSimpleSummary
} from './summary.js';

export {
  renderHeader,
  type HeaderConfig
} from './header.js';

export {
  renderHintsComponent,
  createHints,
  generateMenuHints,
  generateInputHints,
  HintTypes,
  type HintsConfig
} from './hints.js';

export {
  renderTable,
  createTable,
  type TableConfig,
  type TableColumn
} from './table.js';

export {
  renderList,
  createList,
  createBulletList,
  createNumberedList,
  type ListConfig,
  type ListItem
} from './list.js';
