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
