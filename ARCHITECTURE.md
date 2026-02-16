# CLI Menu Kit - Architecture

## Overview

CLI Menu Kit is a modular, well-decoupled menu system for Node.js CLI applications. It provides single-select, multi-select, and input components with a unified API.

## File Structure

```
src/
├── types.ts           # Type definitions
├── components.ts      # Colors, themes, symbols, display functions
├── menu-core.ts       # Shared rendering and terminal control utilities
├── menu-single.ts     # Single-select menu (vertical)
├── menu-multi.ts      # Multi-select menu (vertical with checkboxes)
├── input.ts           # Input components (text, number, yes/no)
├── menu.ts            # Unified menu wrapper API
└── index.ts           # Main entry point
```

## Core Utilities (menu-core.ts)

Extracted common functionality to reduce duplication:

### Terminal Control
- `setupTerminal()` - Initialize stdin in raw mode
- `cleanupTerminal()` - Restore terminal state
- `moveCursorUp()` - Move cursor for re-rendering

### Rendering
- `renderHeader()` - Render title/header
- `renderSingleOption()` - Render a single menu option
- `renderInputPrompt()` - Render input prompt line
- `renderHints()` - Render operation hints

### Keyboard Handling
- `handleVerticalNavigation()` - Handle up/down arrow keys
- `handleNumberInput()` - Handle number key shortcuts
- `handleLetterInput()` - Handle letter key shortcuts

## Menu Types

### 1. Single-Select Menu (Vertical)
**File**: `menu-single.ts`
**Function**: `selectMenu(options, config)`
**Features**:
- Arrow keys (↑/↓) navigation
- Number keys (1-9) for quick selection
- Letter keys (A-Z) for labeled options
- Enter to confirm
- Configurable title, prompt, hints

### 2. Multi-Select Menu (Vertical)
**File**: `menu-multi.ts`
**Function**: `selectMultiMenu(options, config)`
**Features**:
- Arrow keys (↑/↓) navigation
- Space to toggle selection
- A to select all
- I to invert selection
- Enter to confirm
- Checkboxes (◉/○) for visual feedback

### 3. Yes/No Confirmation (Horizontal Single-Select)
**File**: `input.ts`
**Function**: `askYesNo(prompt, options)`
**Features**:
- Left/right arrow keys
- Y/N key shortcuts
- Enter to confirm
- Horizontal layout

### 4. Text Input
**File**: `input.ts`
**Function**: `askInput(prompt, options)`
**Features**:
- Default value support
- Custom validation
- Backspace editing

### 5. Number Input
**File**: `input.ts`
**Function**: `askNumber(prompt, options)`
**Features**:
- Min/max validation
- Default value support
- Only accepts numeric input

## Unified API (menu.ts)

Provides a convenient object-based API:

```javascript
const { menu } = require('cli-menu-kit');

// Single select
const choice = await menu.select(options, config);

// Multi select
const choices = await menu.multiSelect(options, config);

// Yes/No confirmation
const confirmed = await menu.confirm(prompt, options);

// Text input
const text = await menu.input(prompt, options);

// Number input
const number = await menu.number(prompt, options);
```

## Parent-Child Menus

The `selectWithChildren()` function supports hierarchical menus:

```javascript
const { selectWithChildren } = require('cli-menu-kit');

const result = await selectWithChildren(
  parentOptions,
  (parentIndex) => getChildOptions(parentIndex),
  { parentConfig, childConfig }
);

// Returns: { parentIndex, childIndices }
```

## Design Principles

1. **Modularity**: Each menu type is in its own file
2. **Decoupling**: Common utilities extracted to menu-core.ts
3. **File Size**: Each file kept under 200-300 lines
4. **Zero Dependencies**: Pure Node.js implementation
5. **Type Safety**: Full TypeScript support
6. **Flexibility**: Configurable layouts, prompts, hints

## Usage Examples

### Direct Function Calls
```javascript
const { selectMenu, selectMultiMenu, askYesNo } = require('cli-menu-kit');

const choice = await selectMenu(['Option 1', 'Option 2'], { lang: 'zh' });
const choices = await selectMultiMenu(['A', 'B', 'C'], { lang: 'zh' });
const confirmed = await askYesNo('Continue?', { lang: 'en' });
```

### Unified API
```javascript
const { menu } = require('cli-menu-kit');

const choice = await menu.select(['Option 1', 'Option 2'], { lang: 'zh' });
const choices = await menu.multiSelect(['A', 'B', 'C'], { lang: 'zh' });
const confirmed = await menu.confirm('Continue?', { lang: 'en' });
```

## Future Enhancements

Potential additions based on v1 features:
- Horizontal single-select menu (generalized yes/no)
- Grouped options with labels
- Custom separators
- More keyboard shortcuts
- Animation effects
