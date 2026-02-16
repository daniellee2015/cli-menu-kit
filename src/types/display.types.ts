/**
 * Display component types for CLI Menu Kit
 */

/**
 * Header types
 */
export type HeaderType = 'simple' | 'ascii';

/**
 * Simple header configuration
 */
export interface SimpleHeaderConfig {
  text: string;
  color?: string;
}

/**
 * ASCII header configuration
 */
export interface AsciiHeaderConfig {
  asciiArt: string;
  subtitle?: string;
  version?: string;
  url?: string;
  borderChar?: string;
}

/**
 * Progress indicator configuration
 */
export interface ProgressConfig {
  steps: string[];
  currentStep: number;
  separator?: string;
}

/**
 * Message types
 */
export type MessageType = 'success' | 'error' | 'warning' | 'info' | 'question';

/**
 * Message configuration
 */
export interface MessageConfig {
  type: MessageType;
  message: string;
}

/**
 * Summary table configuration
 */
export interface SummaryTableConfig {
  title?: string;
  sections: Array<{
    header?: string;
    items: Array<{
      key: string;
      value: string;
    }>;
  }>;
  width?: number;
}
