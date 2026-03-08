/**
 * Page Layout V2 Usage Examples
 *
 * Demonstrates how to use the component-based Page Layout V2
 */

import {
  renderPageV2,
  createFullHeaderComponent,
  createSimpleHeaderComponent,
  createHintsComponent,
  createCustomComponent,
  createTableComponent,
  createListComponent
} from 'cli-menu-kit';

/**
 * Example 1: Simple page with header and hints
 */
export async function example1() {
  await renderPageV2({
    header: {
      components: [
        createSimpleHeaderComponent('My Application')
      ]
    },
    mainArea: {
      components: [
        createCustomComponent('content', () => {
          console.log('  Welcome to my application!');
          console.log('  This is the main content area.');
        })
      ]
    },
    footer: {
      components: [
        createHintsComponent(['↑↓ Navigate', '⏎ Confirm', 'Esc Cancel'])
      ]
    }
  });
}

/**
 * Example 2: Full header with ASCII art
 */
export async function example2() {
  await renderPageV2({
    header: {
      components: [
        createFullHeaderComponent({
          asciiArt: [
            '███╗   ███╗██╗   ██╗     █████╗ ██████╗ ██████╗ ',
            '████╗ ████║╚██╗ ██╔╝    ██╔══██╗██╔══██╗██╔══██╗',
            '██╔████╔██║ ╚████╔╝     ███████║██████╔╝██████╔╝',
            '██║╚██╔╝██║  ╚██╔╝      ██╔══██║██╔═══╝ ██╔═══╝ ',
            '██║ ╚═╝ ██║   ██║       ██║  ██║██║     ██║     ',
            '╚═╝     ╚═╝   ╚═╝       ╚═╝  ╚═╝╚═╝     ╚═╝     '
          ],
          title: 'My Application',
          description: 'A powerful CLI tool',
          version: '1.0.0',
          url: 'https://github.com/my-app'
        })
      ]
    },
    mainArea: {
      components: [
        createCustomComponent('menu', () => {
          console.log('  1. Option One');
          console.log('  2. Option Two');
          console.log('  3. Option Three');
        })
      ]
    },
    footer: {
      components: [
        createHintsComponent(['1-3 Select', '⏎ Confirm'])
      ]
    }
  });
}

/**
 * Example 3: Multiple components in main area
 */
export async function example3() {
  await renderPageV2({
    header: {
      components: [
        createSimpleHeaderComponent('Workflow Overview')
      ]
    },
    mainArea: {
      components: [
        // Table component
        createTableComponent({
          columns: [
            { header: 'Phase', key: 'phase' },
            { header: 'Status', key: 'status' },
            { header: 'Steps', key: 'steps' }
          ],
          data: [
            { phase: 'Planning', status: 'Complete', steps: '5/5' },
            { phase: 'Development', status: 'In Progress', steps: '3/8' },
            { phase: 'Testing', status: 'Pending', steps: '0/4' }
          ]
        }),
        // List component
        createListComponent({
          items: [
            'All tests passing',
            'Code review completed',
            'Documentation updated'
          ],
          style: 'bullet'
        })
      ]
    },
    footer: {
      components: [
        createHintsComponent(['b Back'])
      ]
    }
  });
}

/**
 * Example 4: Conditional components based on logic
 */
export async function example4(hasChanges: boolean) {
  // Caller handles logic - determines which components to show
  const footerComponents = [
    createHintsComponent(['↑↓ Navigate', '⏎ Confirm'])
  ];

  // Add confirmation hint if there are changes
  if (hasChanges) {
    footerComponents.push(
      createCustomComponent('warning', () => {
        console.log('  ⚠️  You have unsaved changes');
      })
    );
  }

  await renderPageV2({
    header: {
      components: [
        createSimpleHeaderComponent('Edit Mode')
      ]
    },
    mainArea: {
      components: [
        createCustomComponent('editor', () => {
          console.log('  [Editor content here]');
        })
      ]
    },
    footer: {
      components: footerComponents
    }
  });
}

/**
 * Example 5: Dynamic hints based on menu options
 */
export async function example5() {
  // Caller handles component relationships
  const menuOptions = ['1. Save', '2. Cancel', 'b. Back'];

  // Generate hints based on menu options
  const hasNumbers = menuOptions.some(opt => /^\d+\./.test(opt));
  const hasLetters = menuOptions.some(opt => /^[a-z]\./i.test(opt));

  const hints = [];
  if (hasNumbers) hints.push('1-9 Numbers');
  if (hasLetters) hints.push('Letter Keys');
  hints.push('⏎ Confirm');

  await renderPageV2({
    mainArea: {
      components: [
        createCustomComponent('menu', () => {
          menuOptions.forEach(opt => console.log(`  ${opt}`));
        })
      ]
    },
    footer: {
      components: [
        createHintsComponent(hints)
      ]
    }
  });
}
