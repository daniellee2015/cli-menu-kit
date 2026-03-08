# CLI Menu Kit - Usage Guide

## Page Layout System (`renderPage`)

The core layout API. Renders a complete page with Header + MainArea + Footer.

```
┌─────────────────────────────┐
│  Header (title/section)     │
├─────────────────────────────┤
│  MainArea (content/menu)    │
│                             │
├─────────────────────────────┤
│  Footer (menu + hints)      │
└─────────────────────────────┘
```

### Key Rule: One Interactive Element at a Time

Terminal can only handle ONE interactive element (menu/checkbox/input) at a time.
If `mainArea` has an async interaction, `footer.menu` will be **blocked** until it completes.

### Pattern 1: Display + Footer Menu (Recommended)

Best for: detail pages, info pages with navigation.
MainArea displays content synchronously, footer has the interactive menu.

```typescript
import { renderPage, generateMenuHints } from 'cli-menu-kit';

const result = await renderPage({
  header: { type: 'simple', text: 'Page Title' },
  mainArea: {
    type: 'display',
    render: () => {
      // Synchronous display only - NO await, NO interactive calls
      console.log('  Some content here');
      renderSummaryTable({ ... });
    }
  },
  footer: {
    menu: {
      options: ['e. Edit', 'b. Back'],
      allowLetterKeys: true,
      preserveOnSelect: true
    },
    hints: generateMenuHints({
      hasMultipleOptions: true,
      allowLetterKeys: true
    })
  }
});
// result.value = selected option text
```

**Used by:** view.ts, switch.ts, workflow-menu.ts

### Pattern 2: Main Menu (Menu in MainArea)

Best for: primary navigation menus.
Menu is in mainArea, footer only has hints.

```typescript
const result = await renderPage({
  header: {
    type: 'full',
    asciiArt: [...],
    title: 'My App',
    version: '1.0.0',
    menuTitle: 'Select an option:'
  },
  mainArea: {
    type: 'menu',
    menu: {
      options: buildMenuOptions(config),
      allowLetterKeys: true,
      allowNumberKeys: true
    }
  },
  footer: {
    hints: generateMenuHints({
      hasMultipleOptions: true,
      allowNumberKeys: true,
      allowLetterKeys: true
    })
  }
});
```

**Used by:** main menu (menu.ts)

### Pattern 3: Sequential Interactions (Direct Calls)

Best for: pages with multiple interactive steps (e.g., checkbox → confirm).
Call components directly instead of wrapping in renderPage.

```typescript
import { menu, renderSimpleHeader, showInfo, generateMenuHints } from 'cli-menu-kit';

// Step 1: Header (manual)
console.log('');
renderSimpleHeader('Edit Items');

// Step 2: Display content (manual)
console.log('  Select items to enable:\n');

// Step 3: Interactive checkbox
const hints = generateMenuHints({ hasMultipleOptions: true, allowSelectAll: true });
const result = await menu.checkbox({
  options, preserveOnSelect: true, defaultSelected
}, hints);

// Step 4: Confirm (after checkbox completes)
const save = await menu.booleanH('Save changes?', true);
```

**Used by:** edit.ts

### Pattern 4: Interactive MainArea + Footer Ask

Best for: interactive mainArea followed by a simple yes/no.
MainArea runs first (blocking), then footer.ask appears.

```typescript
const result = await renderPage({
  header: { type: 'simple', text: 'Title' },
  mainArea: {
    type: 'interactive',
    render: async () => {
      // Async interaction runs FIRST
      const selected = await menu.checkbox({ ... });
      // Process results...
      showInfo('Summary of changes');
    }
  },
  footer: {
    ask: {
      question: 'Save changes?',
      defaultValue: true,
      horizontal: true
    }
  }
});
// result = boolean (true/false)
```

**Note:** Footer only renders AFTER mainArea.render() completes.

## Component API

### Menu Components

```typescript
import { menu } from 'cli-menu-kit';

// Radio (single select)
const result = await menu.radio({
  options: ['Option A', 'Option B'],
  allowLetterKeys: true,
  preserveOnSelect: true
}, hints?);  // Optional hints array

// Checkbox (multi select)
const result = await menu.checkbox({
  options: ['Item 1', 'Item 2'],
  defaultSelected: [0],
  preserveOnSelect: true
}, hints?);  // Optional hints array

// Boolean horizontal
const yes = await menu.booleanH('Continue?', true);

// Boolean vertical
const yes = await menu.booleanV('Continue?', true);
```

### Display Components

```typescript
import {
  renderSimpleHeader,
  renderSectionHeader,
  renderSummaryTable,
  renderList,
  showSuccess, showError, showInfo, showWarning
} from 'cli-menu-kit';
```

### Hints

```typescript
import { generateMenuHints } from 'cli-menu-kit';

const hints = generateMenuHints({
  hasMultipleOptions: true,
  allowLetterKeys: true,
  allowNumberKeys: true,
  allowSelectAll: true,   // checkbox only
  allowInvert: true        // checkbox only
});
```

## i18n

```typescript
import { setLanguage } from 'cli-menu-kit';

setLanguage('en');  // English (Yes/No)
setLanguage('zh');  // Chinese (是/否)
```

## Common Mistakes

1. **Don't put async interactions in `mainArea.render()` when footer has a menu**
   - Footer menu will be blocked until mainArea completes
   - Use Pattern 1 (display + footer menu) or Pattern 3 (direct calls) instead

2. **`renderHints` renders ONE line** (all hints joined by `•`)
   - Don't count `hints.length` as line count — it's always 1 line

3. **ANSI `\x1b[0A]` defaults to 1, not 0**
   - Never use `\x1b[0A]` to mean "don't move" — skip the call instead

## Virtual Scrolling

For large lists that exceed terminal height, use the `calculateVirtualScroll` utility to maintain stable viewport height.

### Basic Usage

```typescript
import { calculateVirtualScroll } from 'cli-menu-kit';

// Your items (can be any type)
const items = [
  { type: 'data', name: 'Item 1' },
  { type: 'separator', label: 'Group 1', description: 'First group' },
  { type: 'data', name: 'Item 2' },
  // ... more items
];

// Calculate visible range
const result = calculateVirtualScroll({
  items,
  cursorIndex: 10,  // Current cursor position
  targetLines: 30,  // Target viewport height in lines
  getItemLineCount: (item, index) => {
    // Calculate how many lines each item occupies
    if (item.type === 'separator') {
      let lines = 1; // title
      if (index > 0) lines++; // blank line before
      if (item.description) lines++; // description
      return lines;
    }
    return 1; // regular item
  }
});

// Render only visible items
for (let i = result.visibleStart; i < result.visibleEnd; i++) {
  renderItem(items[i]);
}

// Show scroll indicator if needed
if (result.isScrolled) {
  console.log(`[Showing ${result.actualLines} lines | ↑↓ to scroll]`);
}
```

### Result Properties

```typescript
interface VirtualScrollResult {
  visibleStart: number;      // Start index (inclusive)
  visibleEnd: number;        // End index (exclusive)
  actualLines: number;       // Actual lines rendered
  isScrolled: boolean;       // Whether scrolling is active
  hasItemsBefore: boolean;   // Items exist before visible range
  hasItemsAfter: boolean;    // Items exist after visible range
}
```

### Key Features

- **Line-based calculation**: Maintains constant viewport height regardless of item sizes
- **Stable height**: Eliminates jumping when scrolling through items of varying heights
- **Centered cursor**: Keeps cursor near center of viewport when possible
- **Smart expansion**: Fills viewport efficiently (down → up → down)
- **Type-safe**: Generic type support for any item type

### Example: Custom Menu with Virtual Scrolling

```typescript
import { calculateVirtualScroll, initTerminal, clearMenu } from 'cli-menu-kit';

function renderCustomMenu(items: MenuItem[], cursorIndex: number) {
  // Calculate visible range
  const scroll = calculateVirtualScroll({
    items,
    cursorIndex,
    targetLines: 25,
    getItemLineCount: (item) => item.height || 1
  });

  // Render header
  console.log('My Custom Menu');
  console.log('─'.repeat(40));

  // Render visible items
  for (let i = scroll.visibleStart; i < scroll.visibleEnd; i++) {
    const item = items[i];
    const isHighlighted = i === cursorIndex;
    renderMenuItem(item, isHighlighted);
  }

  // Show scroll indicator
  if (scroll.isScrolled) {
    const position = cursorIndex + 1;
    const total = items.length;
    console.log(`\n  [${position}/${total} | ↑↓ scroll]`);
  }
}
```

### Integration with CheckboxTableMenu

The `showCheckboxTableMenu` component uses virtual scrolling internally:

```typescript
import { menu } from 'cli-menu-kit';

const result = await menu.checkboxTable({
  columns: [
    { key: 'name', label: 'Name', width: 30 },
    { key: 'status', label: 'Status', width: 15 }
  ],
  data: largeDataset, // Can be 100+ items
  separators: [
    { beforeIndex: 0, label: 'Group 1', description: 'First group' },
    { beforeIndex: 50, label: 'Group 2', description: 'Second group' }
  ],
  separatorAlign: 'center'
});

// Virtual scrolling is automatic - no configuration needed
// Viewport maintains ~30 lines regardless of cursor position
```
