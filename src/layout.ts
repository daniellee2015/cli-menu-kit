/**
 * Page Layout V2 - Component-Based Architecture
 *
 * Core Principles:
 * 1. Complete component decoupling
 * 2. Each area (Header/Main/Footer) is a component container
 * 3. Configuration-driven assembly
 * 4. Page Layout is the unified entry point
 */

/**
 * Base component interface
 * Every component must implement this interface
 */
export interface Component {
  /** Component type identifier */
  type: string;
  /** Render function - returns void or Promise<void> */
  render: () => void | Promise<void>;
  /** Optional component-specific configuration */
  config?: any;
}

/**
 * Area configuration
 * Each area (Header/Main/Footer) contains an array of components
 */
export interface AreaConfig {
  /** Array of components to render in this area */
  components: Component[];
}

/**
 * Complete page layout configuration
 */
export interface PageLayoutConfigV2 {
  /** Header area (optional) */
  header?: AreaConfig;
  /** Main area (optional) */
  mainArea?: AreaConfig;
  /** Footer area (optional) */
  footer?: AreaConfig;
}

/**
 * Render an area by executing all its components
 */
async function renderArea(area?: AreaConfig): Promise<void> {
  if (!area || !area.components || area.components.length === 0) {
    return;
  }

  // Render each component in sequence
  for (const component of area.components) {
    await component.render();
  }
}

/**
 * Render complete page with component-based areas
 *
 * This is the unified entry point for all pages.
 * All pages must use this function to render.
 *
 * @param config - Page layout configuration
 * @returns Promise that resolves when rendering is complete
 *
 * @example
 * ```typescript
 * await renderPageV2({
 *   header: {
 *     components: [
 *       { type: 'ascii-art', render: () => renderAsciiArt([...]) },
 *       { type: 'title', render: () => renderTitle('My App') }
 *     ]
 *   },
 *   mainArea: {
 *     components: [
 *       { type: 'menu', render: () => renderMenu([...]) }
 *     ]
 *   },
 *   footer: {
 *     components: [
 *       { type: 'hints', render: () => renderHints([...]) }
 *     ]
 *   }
 * });
 * ```
 */
export async function renderPageV2(config: PageLayoutConfigV2): Promise<void> {
  // 1. Render Header area
  await renderArea(config.header);

  // 2. Render Footer area (before main area, so hints show before interactive components)
  await renderArea(config.footer);

  // 3. Render Main Area (may contain interactive components that block)
  await renderArea(config.mainArea);
}

/**
 * Helper function to create a component
 */
export function createComponent(
  type: string,
  render: () => void | Promise<void>,
  config?: any
): Component {
  return { type, render, config };
}
