# CLI Menu Kit

A lightweight, modular CLI menu system for Node.js with TypeScript support. Zero dependencies, pure Node.js implementation.

## Features

- ✅ **Single-select menus** with arrow keys and number/letter shortcuts
- ✅ **Multi-select menus** with checkboxes and batch operations
- ✅ **Yes/No confirmations** with horizontal selection
- ✅ **Text input** with validation support
- ✅ **Number input** with min/max constraints
- ✅ **Parent-child menus** for hierarchical navigation
- ✅ **Unified API** for convenient access
- ✅ **Bilingual support** (Chinese/English)
- ✅ **Fully typed** with TypeScript
- ✅ **Zero dependencies** - pure Node.js
- ✅ **Modular architecture** - all files under 300 lines

## Installation

```bash
npm install cli-menu-kit
```

## Quick Start

### Unified API (Recommended)

```javascript
const { menu } = require('cli-menu-kit');

// Single select
const choice = await menu.select(
  ['Option 1', 'Option 2', 'Option 3'],
  { title: 'Choose one', lang: 'en' }
);

// Multi select
const choices = await menu.multiSelect(
  ['Feature A', 'Feature B', 'Feature C'],
  { lang: 'en' }
);

// Yes/No confirmation
const confirmed = await menu.confirm('Continue?', { lang: 'en' });

// Text input
const name = await menu.input('Enter your name', {
  defaultValue: 'User',
  validator: (input) => input.length > 0 || 'Name cannot be empty'
});

// Number input
const age = await menu.number('Enter your age', {
  min: 1,
  max: 120
});
```

### Direct Function Calls

```javascript
const {
  selectMenu,
  selectMultiMenu,
  askYesNo,
  askInput,
  askNumber
} = require('cli-menu-kit');

const choice = await selectMenu(['A', 'B', 'C'], { lang: 'zh' });
const choices = await selectMultiMenu(['1', '2', '3'], { lang: 'zh' });
const confirmed = await askYesNo('确认吗？', { lang: 'zh' });
```

## API Reference

### menu.select(options, config)

Single-select menu with vertical navigation.

**Parameters:**
- `options`: Array of strings or `MenuOption` objects
- `config`: Configuration object
  - `lang`: 'zh' | 'en' (default: 'zh')
  - `type`: 'main' | 'sub' | 'firstRun' (default: 'main')
  - `title`: Optional header title
  - `showPrompt`: Show input prompt (default: true for main)
  - `showHints`: Show operation hints (default: true)

**Returns:** Selected index (0-based)

**Keyboard shortcuts:**
- ↑/↓: Navigate
- 1-9: Quick select by number
- A-Z: Quick select by letter (for labeled options)
- Enter: Confirm
- Ctrl+C: Exit

### menu.multiSelect(options, config)

Multi-select menu with checkboxes.

**Parameters:**
- `options`: Array of strings
- `config`: Configuration object
  - `lang`: 'zh' | 'en' (default: 'zh')
  - `defaultSelected`: Array of pre-selected indices

**Returns:** Array of selected indices

**Keyboard shortcuts:**
- ↑/↓: Navigate
- Space: Toggle selection
- A: Select all
- I: Invert selection
- Enter: Confirm
- Ctrl+C: Exit

### menu.confirm(prompt, options)

Yes/No confirmation with horizontal selection.

**Parameters:**
- `prompt`: Question to ask
- `options`: Configuration object
  - `lang`: 'zh' | 'en' (default: 'zh')
  - `defaultYes`: Default to Yes (default: true)

**Returns:** Boolean (true for Yes, false for No)

**Keyboard shortcuts:**
- ←/→: Navigate
- Y/N: Quick select
- Enter: Confirm
- Ctrl+C: Exit

### menu.input(prompt, options)

Text input with validation.

**Parameters:**
- `prompt`: Input prompt text
- `options`: Configuration object
  - `lang`: 'zh' | 'en' (default: 'zh')
  - `defaultValue`: Default value
  - `validator`: Validation function `(input: string) => boolean | string`

**Returns:** User input string

### menu.number(prompt, options)

Number input with constraints.

**Parameters:**
- `prompt`: Input prompt text
- `options`: Configuration object
  - `lang`: 'zh' | 'en' (default: 'zh')
  - `min`: Minimum value
  - `max`: Maximum value
  - `defaultValue`: Default value

**Returns:** User input number

### selectWithChildren(parentOptions, getChildOptions, config)

Parent-child menu relationship.

**Parameters:**
- `parentOptions`: Parent menu options
- `getChildOptions`: Function `(parentIndex: number) => string[]`
- `config`: Configuration object
  - `parentConfig`: Parent menu configuration
  - `childConfig`: Child menu configuration

**Returns:** `{ parentIndex: number, childIndices: number[] }`

## Examples

### Basic Single Select

```javascript
const { menu } = require('cli-menu-kit');

const options = [
  '1. Create new project - Start a new project',
  '2. Open existing - Open an existing project',
  '3. Settings - Configure settings',
  '4. Exit - Exit the application'
];

const choice = await menu.select(options, {
  title: 'Main Menu',
  lang: 'en'
});

console.log(`You selected: ${choice}`);
```

### Multi-Select with Default Selection

```javascript
const { menu } = require('cli-menu-kit');

const features = ['Dark Mode', 'Auto Save', 'Notifications', 'Analytics'];

const selected = await menu.multiSelect(features, {
  lang: 'en',
  defaultSelected: [0, 1] // Pre-select first two options
});

console.log(`Selected features: ${selected.map(i => features[i]).join(', ')}`);
```

### Input with Validation

```javascript
const { menu } = require('cli-menu-kit');

const email = await menu.input('Enter your email', {
  lang: 'en',
  validator: (input) => {
    if (!input.includes('@')) {
      return 'Invalid email format';
    }
    return true;
  }
});

console.log(`Email: ${email}`);
```

### Parent-Child Menu

```javascript
const { selectWithChildren } = require('cli-menu-kit');

const categories = ['Electronics', 'Clothing', 'Books'];

const result = await selectWithChildren(
  categories,
  (parentIndex) => {
    if (parentIndex === 0) return ['Phones', 'Laptops', 'Tablets'];
    if (parentIndex === 1) return ['Shirts', 'Pants', 'Shoes'];
    return ['Fiction', 'Non-Fiction', 'Comics'];
  },
  {
    parentConfig: { title: 'Select Category', lang: 'en' },
    childConfig: { lang: 'en' }
  }
);

console.log(`Category: ${categories[result.parentIndex]}`);
console.log(`Items: ${result.childIndices.join(', ')}`);
```

### Display Components

```javascript
const {
  showInfo,
  showSuccess,
  showError,
  showWarning,
  printHeader
} = require('cli-menu-kit');

showInfo('Processing...', 'zh');
showSuccess('Operation completed!', 'en');
showError('Something went wrong', 'en');
showWarning('Please check your input', 'zh');

printHeader({
  asciiArt: ['  ███╗   ███╗', '  ████╗ ████║', '  ██╔████╔██║'],
  title: 'My App',
  subtitle: 'v1.0.0'
});
```

## Architecture

See [ARCHITECTURE.md](./ARCHITECTURE.md) for detailed architecture documentation.

## File Structure

```
src/
├── types.ts           # Type definitions (58 lines)
├── components.ts      # Colors, themes, symbols (187 lines)
├── menu-core.ts       # Shared utilities (213 lines)
├── menu-single.ts     # Single-select menu (163 lines)
├── menu-multi.ts      # Multi-select menu (151 lines)
├── input.ts           # Input components (246 lines)
├── menu.ts            # Unified API wrapper (90 lines)
└── index.ts           # Main entry point (12 lines)
```

All files are kept under 300 lines for maintainability.

## Development

```bash
# Install dependencies
npm install

# Build TypeScript
npm run build

# Run tests
node test/simple-test.js
node test/input-test.js
node test/unified-api-test.js
```

## Design Principles

1. **Modularity**: Each menu type is in its own file
2. **Decoupling**: Common utilities extracted to menu-core.ts
3. **File Size**: Each file kept under 200-300 lines
4. **Zero Dependencies**: Pure Node.js implementation
5. **Type Safety**: Full TypeScript support
6. **Flexibility**: Configurable layouts, prompts, hints

## License

MIT

## Contributing

Contributions are welcome! Please ensure:
- Files stay under 300 lines
- TypeScript types are properly defined
- Code follows existing patterns
- Tests are included for new features
