/**
 * Page Layout V2 - Component-Based Architecture with Fixed Regions
 *
 * Core Principles:
 * 1. Complete component decoupling
 * 2. Fixed-height regions (Header/Footer fixed, Main fills rest)
 * 3. Components return string arrays (lines)
 * 4. Diff-based rendering - only update changed regions
 * 5. Two-phase execution: render (non-blocking) + interact (blocking)
 */

import { ScreenManager, Rect } from './core/screen-manager.js';
import { HintManager } from './core/hint-manager.js';

// Global instances
export const screenManager = new ScreenManager();
export const hintManager = new HintManager();

// Export classes for external use
export { ScreenManager, HintManager, Rect };


/**
 * Component interface - components return lines instead of writing to stdout
 */
export interface Component {
  /** Component type identifier */
  type: string;
  /** Region ID for this component */
  regionId: string;
  /** Render function - returns lines to display */
  render: (rect: Rect) => string[] | Promise<string[]>;
  /** Optional interact function - handles user input (blocking) */
  interact?: () => void | Promise<void>;
  /** Optional component-specific configuration */
  config?: any;
}

/**
 * Layout configuration with fixed heights
 */
export interface Layout {
  header: Rect;
  main: Rect;
  footerHints: Rect;
  footerPrompt: Rect;
}

/**
 * Compute layout based on terminal size
 */
export function computeLayout(rows?: number, cols?: number): Layout {
  const termRows = rows || process.stdout.rows || 24;
  const termCols = cols || process.stdout.columns || 80;

  const headerHeight = 13; // Fixed header height (6 ASCII art + title + desc + separator)
  const footerHintsHeight = 1; // Fixed hints height
  const footerPromptHeight = 1; // Fixed prompt height
  const mainHeight = Math.max(1, termRows - headerHeight - footerHintsHeight - footerPromptHeight);

  return {
    header: { top: 1, left: 1, width: termCols, height: headerHeight },
    main: { top: 1 + headerHeight, left: 1, width: termCols, height: mainHeight },
    footerHints: { top: 1 + headerHeight + mainHeight, left: 1, width: termCols, height: footerHintsHeight },
    footerPrompt: { top: 1 + headerHeight + mainHeight + footerHintsHeight, left: 1, width: termCols, height: footerPromptHeight }
  };
}

/**
 * Area configuration
 */
export interface AreaConfig {
  components: Component[];
}

/**
 * Page layout configuration
 */
export interface PageLayoutConfigV2 {
  header?: AreaConfig;
  mainArea?: AreaConfig;
  footer?: AreaConfig;
}

/**
 * Render complete page with fixed-region architecture
 *
 * Phase 1: Render all components (non-blocking)
 * Phase 2: Handle interactions (blocking)
 */
export async function renderPageV2(config: PageLayoutConfigV2): Promise<void> {
  // Enter alt screen
  screenManager.enter();

  // Compute layout
  const layout = computeLayout();

  // Register regions
  if (config.header?.components) {
    for (const component of config.header.components) {
      screenManager.registerRegion(component.regionId, layout.header);
    }
  }

  if (config.mainArea?.components) {
    for (const component of config.mainArea.components) {
      screenManager.registerRegion(component.regionId, layout.main);
    }
  }

  if (config.footer?.components) {
    for (const component of config.footer.components) {
      // Map components to their specific footer regions
      if (component.type === 'hints') {
        screenManager.registerRegion(component.regionId, layout.footerHints);
      } else if (component.type === 'prompt') {
        screenManager.registerRegion(component.regionId, layout.footerPrompt);
      }
    }
  }

  // Phase 1: Initial render
  const renderComponent = async (component: Component, rect: Rect) => {
    const lines = await component.render(rect);
    screenManager.renderRegion(component.regionId, lines);
  };

  if (config.header?.components) {
    for (const component of config.header.components) {
      await renderComponent(component, layout.header);
    }
  }

  if (config.mainArea?.components) {
    for (const component of config.mainArea.components) {
      await renderComponent(component, layout.main);
    }
  }

  if (config.footer?.components) {
    for (const component of config.footer.components) {
      const rect = component.type === 'hints' ? layout.footerHints : layout.footerPrompt;
      await renderComponent(component, rect);
    }
  }

  // Setup hint manager listener
  hintManager.on('change', (text: string) => {
    const hintsComponent = config.footer?.components.find(c => c.type === 'hints');
    if (hintsComponent) {
      screenManager.renderRegion(hintsComponent.regionId, [text]);
    }
  });

  // Handle terminal resize
  process.stdout.on('resize', () => {
    const newLayout = computeLayout();
    screenManager.invalidateAll();

    // Re-register and re-render all regions
    // (Implementation can be enhanced to avoid code duplication)
  });

  // Phase 2: Handle interactions
  const interactiveComponents: Component[] = [];

  if (config.header?.components) {
    interactiveComponents.push(...config.header.components.filter(c => c.interact));
  }
  if (config.mainArea?.components) {
    interactiveComponents.push(...config.mainArea.components.filter(c => c.interact));
  }
  if (config.footer?.components) {
    interactiveComponents.push(...config.footer.components.filter(c => c.interact));
  }

  // Execute interact phase
  for (const component of interactiveComponents) {
    if (component.interact) {
      await component.interact();
    }
  }

  // Exit alt screen
  screenManager.exit();
}

/**
 * Helper to create a custom component
 */
export function createCustomComponent(
  type: string,
  regionId: string,
  render: (rect: Rect) => string[] | Promise<string[]>,
  interact?: () => void | Promise<void>
): Component {
  return { type, regionId, render, interact };
}
