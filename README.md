# CLI Menu Kit

A lightweight, customizable CLI menu system with keyboard shortcuts and real-time rendering.

## Features

- ✨ **Interactive Menus**: Arrow keys + number/letter shortcuts
- 🎨 **Customizable Themes**: Built-in color schemes
- 🌍 **i18n Support**: Chinese and English
- ⚡ **Real-time Rendering**: Live highlighting and feedback
- 📦 **Zero Dependencies**: Pure Node.js implementation
- 🎯 **TypeScript**: Full type definitions included

## Installation

```bash
npm install cli-menu-kit
```

## Quick Start

```typescript
import { selectMenu, colors, theme } from 'cli-menu-kit';

const options = [
  '1. Initialize - Set up your project',
  '2. Build - Compile your code',
  '3. Deploy - Push to production'
];

const selected = await selectMenu(options, {
  lang: 'zh',  // or 'en'
  type: 'main'
});

console.log(`You selected: ${options[selected]}`);
```

## API

### `selectMenu(options, config)`

Interactive single-select menu.

**Parameters:**
- `options`: Array of strings or `{ label: string, value?: any }` objects
- `config`: Configuration object
  - `lang`: `'zh'` | `'en'` (default: `'zh'`)
  - `type`: `'main'` | `'sub'` | `'firstRun'` (default: `'main'`)

**Returns:** Promise<number> - Selected index (0-based)

**Keyboard Controls:**
- `↑/↓`: Navigate
- `1-9`: Jump to option
- `A-Z`: Letter shortcuts (if defined in option label)
- `Enter`: Confirm
- `Esc`: Exit (firstRun type only)
- `Ctrl+C`: Exit

### `selectMultiMenu(options, config)`

Interactive multi-select menu with checkboxes.

**Parameters:**
- `options`: Array of strings
- `config`: Configuration object
  - `lang`: `'zh'` | `'en'` (default: `'zh'`)
  - `defaultSelected`: Array of pre-selected indices

**Returns:** Promise<number[]> - Array of selected indices

**Keyboard Controls:**
- `↑/↓`: Navigate
- `Space`: Toggle selection
- `A`: Select all
- `I`: Invert selection
- `Enter`: Confirm
- `Ctrl+C`: Exit

### Components

```typescript
import {
  colors,      // ANSI color codes
  theme,       // Theme colors
  symbols,     // Icons (✓, x, !, ℹ)
  showInfo,    // Show info message
  showSuccess, // Show success message
  showError,   // Show error message
  showWarning, // Show warning message
  printHeader  // Print ASCII art header
} from 'cli-menu-kit';
```

## Examples

### Basic Menu

```typescript
const options = [
  '1. Option 1 - Description',
  '2. Option 2 - Description',
  '3. Option 3 - Description'
];

const selected = await selectMenu(options);
```

### Menu with Letter Shortcuts

```typescript
const options = [
  { label: 'L. Login - Sign in to your account' },
  { label: 'R. Register - Create new account' },
  { label: 'Q. Quit - Exit application' }
];

const selected = await selectMenu(options, { type: 'main' });
```

### Multi-Select Menu

```typescript
const options = [
  'TypeScript',
  'JavaScript',
  'Python',
  'Go'
];

const selected = await selectMultiMenu(options, {
  lang: 'en',
  defaultSelected: [0, 1]
});

console.log(`Selected: ${selected.map(i => options[i]).join(', ')}`);
```

### Custom Header

```typescript
import { printHeader } from 'cli-menu-kit';

printHeader({
  asciiArt: [
    '███╗   ███╗██╗   ██╗     █████╗ ██████╗ ██████╗ ',
    '████╗ ████║╚██╗ ██╔╝    ██╔══██╗██╔══██╗██╔══██╗',
    '██╔████╔██║ ╚████╔╝     ███████║██████╔╝██████╔╝',
    '██║╚██╔╝██║  ╚██╔╝      ██╔══██║██╔═══╝ ██╔═══╝ ',
    '██║ ╚═╝ ██║   ██║       ██║  ██║██║     ██║     ',
    '╚═╝     ╚═╝   ╚═╝       ╚═╝  ╚═╝╚═╝     ╚═╝     '
  ],
  title: 'My Application',
  subtitle: 'v1.0.0',
  version: '1.0.0',
  github: 'https://github.com/username/repo'
});
```

## License

MIT
