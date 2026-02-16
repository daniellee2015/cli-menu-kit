# CLI Menu Kit

A comprehensive, modular CLI menu system for Node.js with full TypeScript support. Zero dependencies, pure Node.js implementation with advanced features including i18n, wizards, and command handling.

## Features

### Menu Components
- ✅ **RadioMenu** - Single-select vertical menu with arrow/number/letter navigation
- ✅ **CheckboxMenu** - Multi-select with checkboxes, select all, and invert
- ✅ **BooleanMenu** - Yes/No selection (horizontal and vertical)

### Input Components
- ✅ **TextInput** - Single-line text with validation and constraints
- ✅ **NumberInput** - Numeric input with min/max validation
- ✅ **LanguageSelector** - Specialized language picker
- ✅ **ModifyField** - Composite field modification prompt

### Display Components
- ✅ **Headers** - Simple and ASCII art headers with borders
- ✅ **Progress** - Step indicators, stage headers, separators
- ✅ **Messages** - Success/Error/Warning/Info/Question with icons
- ✅ **Summary** - Bordered tables with sections and key-value pairs

### Advanced Features
- ✅ **Wizard System** - Multi-step configuration flows with progress tracking
- ✅ **i18n Support** - Chinese and English translations (extensible)
- ✅ **Command Handling** - Built-in commands (/quit, /help, /clear, /back)
- ✅ **Layout System** - Flexible component composition
- ✅ **Color System** - Single colors and two-color gradients
- ✅ **Unified API** - Simple, consistent interface for all components

### Core Principles
- ✅ **Zero dependencies** - Pure Node.js
- ✅ **Fully typed** - Complete TypeScript support
- ✅ **Modular architecture** - All files under 300 lines
- ✅ **Component-based** - Reusable, composable components
- ✅ **Type-safe** - Strict TypeScript with full type definitions

## Installation

```bash
npm install cli-menu-kit
```

## Configuration

CLI Menu Kit is highly customizable with sensible defaults. Configure colors, language, and UI elements to match your application's style.

### 🎨 Color Customization

Customize all UI colors globally:

```javascript
import { setUIColors, colors } from 'cli-menu-kit';

// Override specific colors (all optional)
setUIColors({
  primary: colors.blue,        // Main interactive elements, highlights
  textSecondary: colors.dim,   // Descriptions, hints
  error: colors.red,           // Errors, exit options
  border: colors.magenta,      // Borders, frames
  separator: colors.dim,       // Section separators
  // ... see full list in documentation
});

// Reset to defaults
import { resetUIColors } from 'cli-menu-kit';
resetUIColors();
```

### 🌍 Language Support

Switch between English and Chinese (or add custom languages):

```javascript
import { setLanguage } from 'cli-menu-kit';

setLanguage('en');  // English (default: 'zh')
```

### 🎯 Header Styles

Three header modes for different contexts:

```javascript
import { renderHeader, renderSectionHeader, renderSimpleHeader } from 'cli-menu-kit';

// Full header (main menu, initialization)
renderHeader({
  asciiArt: ['...'],           // Optional
  title: 'Product Name',       // Optional
  description: '...',          // Optional
  version: '1.0.0',            // Optional - omit to hide
  url: 'https://...',          // Optional - omit to hide
  menuTitle: 'Select option:'  // Optional - omit to hide
});

// Section header (sub-menus)
renderSectionHeader('Section Title', 50);  // Width configurable

// Simple header (quick prompts)
renderSimpleHeader('Simple Title');
```

### ⚙️ Menu Options

All menu options are configurable:

```javascript
menu.radio({
  options: [
    // Optional grouping with separators
    { type: 'separator', label: 'Setup' },
    '1. Option 1',
    '2. Option 2',
    { type: 'separator', label: 'Advanced' },
    '3. Option 3'
  ],

  title: 'Menu Title',         // Optional
  hints: ['↑↓ Navigate'],      // Optional - omit or pass [] to hide
  separatorWidth: 40,          // Optional - default: 30
  allowNumberKeys: true,       // Optional - default: true
  allowLetterKeys: false       // Optional - default: false
});
```

## Quick Start

### Unified API (Recommended)

```javascript
import { menu, input, wizard } from 'cli-menu-kit';

// Radio menu (single-select)
const result = await menu.radio({
  title: 'Select Framework',
  options: ['React', 'Vue', 'Angular', 'Svelte']
});
console.log(`Selected: ${result.value}`);

// Checkbox menu (multi-select)
const features = await menu.checkbox({
  options: ['TypeScript', 'ESLint', 'Prettier', 'Testing'],
  minSelections: 1
});
console.log(`Selected: ${features.values.join(', ')}`);

// Boolean menu (yes/no)
const confirmed = await menu.booleanH('Continue?', true);
console.log(`Confirmed: ${confirmed}`);

// Text input
const name = await input.text({
  prompt: 'Enter your name',
  defaultValue: 'User',
  minLength: 2
});

// Number input
const age = await input.number({
  prompt: 'Enter your age',
  min: 1,
  max: 120
});

// Language selector
const lang = await input.language({
  languages: [
    { code: 'zh', name: 'Chinese', nativeName: '简体中文' },
    { code: 'en', name: 'English' }
  ]
});

// Wizard (multi-step flow)
const result = await wizard.run({
  steps: [
    {
      name: 'language',
      title: 'Select Language',
      component: 'language-selector',
      config: { /* ... */ }
    },
    {
      name: 'projectName',
      title: 'Project Name',
      component: 'text-input',
      config: { prompt: 'Enter project name' }
    }
  ]
});
```

### Display Components

```javascript
import {
  createSimpleHeader,
  createAsciiHeader,
  createProgressIndicator,
  showSuccess,
  showError,
  showWarning,
  showInfo,
  createSummaryTable
} from 'cli-menu-kit';

// Simple header
createSimpleHeader('My Application', '\x1b[36m');

// ASCII header
createAsciiHeader(asciiArt, {
  subtitle: 'Version 1.0.0',
  url: 'https://github.com/user/repo'
});

// Progress indicator
createProgressIndicator(['Step 1', 'Step 2', 'Step 3'], 1);

// Messages
showSuccess('Operation completed!');
showError('Something went wrong');
showWarning('Please check your input');
showInfo('Press Ctrl+C to exit');

// Summary table
createSummaryTable('Session Summary', [
  {
    header: 'Statistics',
    items: [
      { key: 'Total', value: '100' },
      { key: 'Success', value: '95' }
    ]
  }
]);
```

### i18n Support

```javascript
import { setLanguage, t } from 'cli-menu-kit';

// Set language
setLanguage('en'); // or 'zh'

// Get translations
const prompt = t('menus.selectPrompt');
const goodbye = t('messages.goodbye');
```

### Command Handling

```javascript
import { registerCommand, handleCommand } from 'cli-menu-kit';

// Register custom command
registerCommand('test', () => {
  console.log('Test command executed!');
  return false; // Continue (don't exit)
}, 'Run test command');

// Handle command input
const result = handleCommand('/test');
// Built-in commands: /quit, /help, /clear, /back
```

## API Reference

### Menu API

#### menu.radio(config)
Single-select vertical menu.

```typescript
interface RadioMenuConfig {
  title?: string;
  options: MenuOption[];
  prompt?: string;
  hints?: string[];
  layout?: MenuLayout;
  defaultIndex?: number;
  allowNumberKeys?: boolean;
  allowLetterKeys?: boolean;
  onExit?: () => void;
}

// Returns: { index: number, value: string }
```

#### menu.checkbox(config)
Multi-select vertical menu.

```typescript
interface CheckboxMenuConfig {
  title?: string;
  options: MenuOption[];
  prompt?: string;
  hints?: string[];
  layout?: MenuLayout;
  defaultSelected?: number[];
  minSelections?: number;
  maxSelections?: number;
  allowSelectAll?: boolean;
  allowInvert?: boolean;
  onExit?: () => void;
}

// Returns: { indices: number[], values: string[] }
```

#### menu.boolean(config)
Yes/No selection menu.

```typescript
interface BooleanMenuConfig {
  question: string;
  defaultValue?: boolean;
  yesText?: string;
  noText?: string;
  orientation?: 'horizontal' | 'vertical';
  onExit?: () => void;
}

// Returns: boolean
```

### Input API

#### input.text(config)
Text input with validation.

```typescript
interface TextInputConfig {
  prompt: string;
  defaultValue?: string;
  placeholder?: string;
  maxLength?: number;
  minLength?: number;
  allowEmpty?: boolean;
  validate?: (value: string) => boolean | string;
  errorMessage?: string;
  onExit?: () => void;
}

// Returns: string
```

#### input.number(config)
Number input with constraints.

```typescript
interface NumberInputConfig {
  prompt: string;
  defaultValue?: number;
  min?: number;
  max?: number;
  allowDecimals?: boolean;
  allowNegative?: boolean;
  validate?: (value: string) => boolean | string;
  errorMessage?: string;
  onExit?: () => void;
}

// Returns: number
```

#### input.language(config)
Language selector.

```typescript
interface LanguageSelectorConfig {
  languages: Array<{
    code: string;
    name: string;
    nativeName?: string;
  }>;
  defaultLanguage?: string;
  prompt?: string;
  onExit?: () => void;
}

// Returns: string (language code)
```

### Wizard API

#### wizard.run(config)
Run a multi-step wizard.

```typescript
interface WizardConfig {
  title?: string;
  steps: WizardStep[];
  showProgress?: boolean;
  onComplete?: (results: Record<string, any>) => void;
  onCancel?: () => void;
}

interface WizardStep {
  name: string;
  title: string;
  component: 'radio-menu' | 'checkbox-menu' | 'boolean-menu' |
            'text-input' | 'number-input' | 'language-selector';
  config: any;
  required?: boolean;
  validate?: (value: any) => boolean | string;
  skip?: (results: Record<string, any>) => boolean;
}

// Returns: { completed: boolean, results: Record<string, any> }
```

## Architecture

The library is organized into a modular architecture:

```
src/
├── types/              # Type definitions
│   ├── layout.types.ts
│   ├── menu.types.ts
│   ├── input.types.ts
│   └── display.types.ts
├── core/               # Core utilities
│   ├── terminal.ts
│   ├── keyboard.ts
│   ├── renderer.ts
│   └── colors.ts
├── components/         # UI components
│   ├── menus/
│   ├── inputs/
│   └── display/
├── features/           # Advanced features
│   ├── wizard.ts
│   └── commands.ts
├── i18n/              # Internationalization
│   ├── types.ts
│   ├── registry.ts
│   └── languages/
├── api.ts             # Unified API
└── index.ts           # Main entry point
```

See [ARCHITECTURE.md](./ARCHITECTURE.md) for detailed documentation.

## Development

```bash
# Install dependencies
npm install

# Build TypeScript
npm run build

# Run tests
node test/phase2-test.js  # Menu components
node test/phase3-test.js  # Input components
node test/phase4-test.js  # Display components
node test/phase5-test.js  # Advanced features
```

## Design Principles

1. **Component-Based**: Each UI element is a separate, reusable component
2. **Layout System**: Components can be composed in different orders
3. **Type Safety**: Full TypeScript support with strict typing
4. **Zero Dependencies**: Pure Node.js implementation
5. **i18n Support**: Multi-language support with mapping system
6. **Maintainability**: All files kept under 300 lines

## License

MIT

## Contributing

Contributions are welcome! Please ensure:
- Files stay under 300 lines
- TypeScript types are properly defined
- Code follows existing patterns
- Tests are included for new features
- All comments in English

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
