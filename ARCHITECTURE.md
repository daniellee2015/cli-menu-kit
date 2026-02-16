# CLI Menu Kit - Complete Architecture

## Overview

CLI Menu Kit is a comprehensive, modular menu system for Node.js CLI applications. It provides a complete set of interactive components with a flexible layout system for building sophisticated CLI interfaces.

## Design Principles

1. **Component-Based**: Each UI element is a separate, reusable component
2. **Layout System**: Components can be composed in different orders with configurable visibility
3. **Type Safety**: Full TypeScript support with strict typing
4. **Zero Dependencies**: Pure Node.js implementation
5. **i18n Support**: Multi-language support with mapping system
6. **Maintainability**: All files kept under 300 lines

## Core Architecture

### Component Types

#### 1. Menu Components

**RadioMenu** (Single-select, Vertical)
- N options displayed vertically
- Navigation: ↑↓ arrow keys
- Selection: Number keys (1-9), Letter keys (A-Z)
- Confirmation: Enter key
- Shows current selection in input display

**CheckboxMenu** (Multi-select, Vertical)
- N options with checkboxes (◉/○)
- Navigation: ↑↓ arrow keys
- Toggle: Space key
- Batch operations: A (select all), I (invert)
- Confirmation: Enter key

**BooleanMenu Horizontal**
- 2 options side by side: `是 | 否`
- Navigation: ←→ arrow keys
- Quick select: Y/N keys
- Confirmation: Enter key

**BooleanMenu Vertical**
- 2 options stacked (like 2-option RadioMenu)
- Navigation: ↑↓ arrow keys
- Confirmation: Enter key

#### 2. Input Components

**TextInput**
- Single-line text input
- Optional default value
- Custom validation function
- Real-time character display

**NumberInput**
- Numeric input with validation
- Min/max constraints
- Default value support

**LanguageSelector**
- Specialized selector for language choice
- Supports multiple languages
- Can be used in initialization wizard

**ModifyField** (Composite)
- Shows current value
- Asks yes/no to modify
- If yes, prompts for new value
- Useful for configuration updates

#### 3. Display Components

**Header Components**
- **SimpleHeader**: Plain text title
- **AsciiHeader**: ASCII art with decorations and borders

**Progress Components**
- **ProgressIndicator**: Step flow (Step1 → Step2 → Step3)
- **StageHeader**: Stage with step number
- **StageSeparator**: Visual separator between stages

**Message Components**
- **Success**: Green checkmark with message
- **Error**: Red X with message
- **Warning**: Yellow exclamation with message
- **Info**: Blue info icon with message
- **Question**: Yellow question mark with message

**Summary Components**
- **SummaryTable**: Statistics box with borders
  ```
  ╭─────────────────────────────────────╮
  │ Session Summary                     │
  │ Tool Calls: 10 (✓ 8 x 2)          │
  │ Success Rate: 80%                   │
  │ Wall Time: 2h 9m                    │
  ╰─────────────────────────────────────╯
  ```

#### 4. Layout System

**MenuLayout Interface**
```typescript
interface MenuLayout {
  order: ('header' | 'options' | 'input' | 'hints')[];
  visible: {
    header?: boolean;
    input?: boolean;
    hints?: boolean;
  };
  spacing?: {
    beforeHeader?: number;
    afterHeader?: number;
    beforeOptions?: number;
    afterOptions?: number;
    beforeInput?: number;
    afterInput?: number;
    beforeHints?: number;
  };
}
```

**Default Layouts**
- **Main Menu**: header → options → input → hints
- **Sub Menu**: options → input → hints (no header)
- **Wizard Step**: header → progress → options → input → hints

### File Structure

```
src/
├── types/
│   ├── menu.types.ts          # Menu-related types
│   ├── input.types.ts         # Input-related types
│   ├── display.types.ts       # Display component types
│   └── layout.types.ts        # Layout system types
│
├── core/
│   ├── terminal.ts            # Terminal control utilities
│   ├── keyboard.ts            # Keyboard handling
│   ├── renderer.ts            # Base rendering functions
│   └── colors.ts              # Color system (single + gradient)
│
├── components/
│   ├── menus/
│   │   ├── radio-menu.ts      # Single-select vertical
│   │   ├── checkbox-menu.ts   # Multi-select vertical
│   │   ├── boolean-h-menu.ts  # Boolean horizontal
│   │   └── boolean-v-menu.ts  # Boolean vertical
│   │
│   ├── inputs/
│   │   ├── text-input.ts      # Text input
│   │   ├── number-input.ts    # Number input
│   │   ├── language-input.ts  # Language selector
│   │   └── modify-field.ts    # Modify field composite
│   │
│   ├── display/
│   │   ├── headers.ts         # Simple + ASCII headers
│   │   ├── progress.ts        # Progress indicators
│   │   ├── messages.ts        # Success/Error/Warning/Info
│   │   └── summary.ts         # Summary table component
│   │
│   └── layout/
│       ├── layout-engine.ts   # Layout composition engine
│       └── presets.ts         # Preset layouts
│
├── features/
│   ├── wizard.ts              # Initialization wizard
│   └── commands.ts            # Command handling (/quit, etc.)
│
├── i18n/
│   ├── types.ts               # i18n types
│   ├── registry.ts            # Language registry
│   └── languages/
│       ├── zh.ts              # Chinese translations
│       └── en.ts              # English translations
│
├── menu.ts                    # Unified API wrapper
└── index.ts                   # Main entry point
```

## Feature Specifications

### 1. Menu Components

#### RadioMenu (Single-Select Vertical)

**Layout Order**: header → options → input → hints

**Rendering**:
```
  Main Menu                          # Header (optional)

❯ 1. Option 1 - Description         # Options (highlighted)
  2. Option 2 - Description
  3. Option 3 - Description

  输入选项或用↑↓选择,回车确认: 1    # Input display

  ↑↓ 方向键 • 0-9 输入序号 • ⏎ 确认  # Hints
```

**Features**:
- Arrow key navigation with wrap-around
- Number key quick selection (1-9)
- Letter key shortcuts (A-Z) for labeled options
- Input display shows current selection
- Configurable title, prompt, hints

#### CheckboxMenu (Multi-Select Vertical)

**Layout Order**: input → options → hints

**Rendering**:
```
  ✓ 空格选中/取消,回车确认: 2 项已选  # Input display

❯ ◉ Option 1                         # Options with checkboxes
  ○ Option 2
  ◉ Option 3

  ↑↓ 方向键 • 空格 选中/取消 • A 全选 • I 反选 • ⏎ 确认  # Hints
```

**Features**:
- Space to toggle selection
- A to select all
- I to invert selection
- Shows count of selected items
- Returns array of selected indices

#### BooleanMenu Horizontal

**Rendering**:
```
? 是否继续? 是 | 否                   # Question with options
```

**Features**:
- Left/right arrow navigation
- Y/N quick keys
- Compact single-line display
- Default value support

#### BooleanMenu Vertical

**Rendering**:
```
? 是否继续?                          # Question

❯ 是                                 # Options stacked
  否
```

**Features**:
- Up/down arrow navigation
- Same as 2-option RadioMenu
- More visible than horizontal

### 2. Input Components

#### TextInput

**Rendering**:
```
  请输入名称: (默认: User) hello_    # Prompt with default and cursor
```

**Features**:
- Real-time character display
- Backspace editing
- Default value hint
- Custom validation
- Error message display

#### NumberInput

**Rendering**:
```
  请输入年龄 (1-120): 25_            # Prompt with constraints
```

**Features**:
- Only accepts numeric input
- Min/max validation
- Default value support
- Error messages for out-of-range

### 3. Display Components

#### Headers

**SimpleHeader**:
```
  Main Menu                          # Plain text
```

**AsciiHeader**:
```
═══════════════════════════════════════════════════════════════════

  ███╗   ███╗███████╗███╗   ██╗██╗   ██╗
  ████╗ ████║██╔════╝████╗  ██║██║   ██║
  ██╔████╔██║█████╗  ██╔██╗ ██║██║   ██║
  ██║╚██╔╝██║██╔══╝  ██║╚██╗██║██║   ██║
  ██║ ╚═╝ ██║███████╗██║ ╚████║╚██████╔╝
  ╚═╝     ╚═╝╚══════╝╚═╝  ╚═══╝ ╚═════╝

  CLI Menu Kit  v1.0.0

═══════════════════════════════════════════════════════════════════

  Version: 1.0.0  |  https://github.com/user/repo
```

#### Progress Indicator

**Rendering**:
```
  选择语言 → 配置路径 → 完成设置      # Step flow with current highlighted
```

**Features**:
- Shows all steps
- Highlights current step
- Grays out future steps
- Arrow separators

#### Summary Table

**Rendering**:
```
╭───────────────────────────────────────────────────────────────╮
│                                                               │
│  Session Summary                                              │
│  Session ID:     10062c88-c2e5-4bf0-a5f7-e8703937514f        │
│  Tool Calls:     10 ( ✓ 8 x 2 )                             │
│  Success Rate:   80%                                          │
│                                                               │
│  Performance                                                  │
│  Wall Time:      2h 9m                                        │
│  Agent Active:   45m (35%)                                    │
│                                                               │
╰───────────────────────────────────────────────────────────────╯
```

**Features**:
- Box drawing characters
- Configurable width
- Section headers
- Key-value pairs
- Centered text support

### 4. Layout System

**Purpose**: Compose components in different orders with configurable visibility

**Example Usage**:
```typescript
const mainMenuLayout: MenuLayout = {
  order: ['header', 'options', 'input', 'hints'],
  visible: {
    header: true,
    input: true,
    hints: true
  },
  spacing: {
    afterHeader: 1,
    afterOptions: 1,
    beforeHints: 1
  }
};

const subMenuLayout: MenuLayout = {
  order: ['options', 'input', 'hints'],
  visible: {
    header: false,
    input: true,
    hints: true
  }
};
```

### 5. Initialization Wizard

**Purpose**: Multi-step configuration flow before entering main menu

**Features**:
- Optional (can be disabled)
- Configurable steps
- Progress tracking
- Step validation
- Can skip to main menu

**Example Flow**:
```typescript
const wizardSteps = [
  {
    name: 'language',
    component: 'language-selector',
    required: true
  },
  {
    name: 'workspace',
    component: 'text-input',
    required: true,
    validate: (value) => value.length > 0
  },
  {
    name: 'preferences',
    component: 'checkbox-menu',
    required: false
  }
];
```

**Rendering**:
```
  选择语言 → 配置路径 → 完成设置      # Progress

  步骤1: 选择语言                     # Stage header

❯ 简体中文
  English

  ↑↓ 方向键 • ⏎ 确认                 # Hints

─────────────────────────────────    # Stage separator

  步骤2: 配置路径                     # Next stage
  ...
```

### 6. i18n System

**Purpose**: Multi-language support with mapping

**Structure**:
```typescript
interface I18nRegistry {
  languages: {
    zh: LanguageMap;
    en: LanguageMap;
  };
  current: 'zh' | 'en';
}

interface LanguageMap {
  menus: {
    selectPrompt: string;
    multiSelectPrompt: string;
    confirmPrompt: string;
  };
  hints: {
    arrows: string;
    space: string;
    enter: string;
    // ...
  };
  messages: {
    success: string;
    error: string;
    // ...
  };
}
```

**Usage**:
```typescript
import { t } from './i18n';

const prompt = t('menus.selectPrompt'); // "输入选项或用↑↓选择,回车确认"
```

### 7. Color System

**Single Color**:
```typescript
const color = colors.cyan;
```

**Gradient Color** (Two-color):
```typescript
const gradient = createGradient(colors.cyan, colors.blue, text.length);
// Returns array of colors for each character
```

**Usage**:
```typescript
// Single color
console.log(`${colors.cyan}Text${colors.reset}`);

// Gradient
const gradient = createGradient(colors.cyan, colors.blue, text.length);
text.split('').forEach((char, i) => {
  process.stdout.write(`${gradient[i]}${char}`);
});
process.stdout.write(colors.reset);
```

### 8. Commands

**Purpose**: Handle special commands like `/quit`

**Supported Commands**:
- `/quit` - Exit application with goodbye message
- `/help` - Show help information
- `/clear` - Clear screen
- `/back` - Go back to previous menu

**Implementation**:
```typescript
function handleCommand(input: string): boolean {
  if (input === '/quit') {
    showGoodbye(lang);
    process.exit(0);
  }
  // ... other commands
  return false; // Not a command
}
```

## Implementation Phases

### Phase 1: Core Architecture
- Layout system
- Component base classes
- Terminal utilities
- Keyboard handling
- Color system (single + gradient)

### Phase 2: Menu Components
- RadioMenu (single-select vertical)
- CheckboxMenu (multi-select vertical)
- BooleanMenu horizontal
- BooleanMenu vertical

### Phase 3: Input Components
- TextInput
- NumberInput
- LanguageSelector
- ModifyField composite

### Phase 4: Display Components
- Headers (simple + ASCII)
- Progress indicators
- Messages (success/error/warning/info)
- Summary table

### Phase 5: Advanced Features
- Initialization wizard
- i18n system
- Command handling
- Unified API

## Migration from Current Implementation

### Current Structure
```
src/
├── menu-single.ts    # Single-select menu
├── menu-multi.ts     # Multi-select menu
├── input.ts          # Input functions
├── menu-core.ts      # Shared utilities
└── components.ts     # Display functions
```

### Migration Strategy
1. Keep current implementation working
2. Build new architecture alongside
3. Create adapter layer for backward compatibility
4. Gradually migrate to new API
5. Deprecate old API after migration complete

## API Design

### Unified API
```typescript
import { menu } from 'cli-menu-kit';

// Radio menu (single-select)
const choice = await menu.radio(options, config);

// Checkbox menu (multi-select)
const choices = await menu.checkbox(options, config);

// Boolean horizontal
const confirmed = await menu.booleanH(prompt, config);

// Boolean vertical
const confirmed = await menu.booleanV(prompt, config);

// Text input
const text = await menu.input(prompt, config);

// Number input
const num = await menu.number(prompt, config);

// Language selector
const lang = await menu.language(config);

// Modify field
const value = await menu.modifyField(fieldName, currentValue, config);
```

### Layout-Based API
```typescript
import { createMenu } from 'cli-menu-kit';

const customMenu = createMenu({
  type: 'radio',
  layout: {
    order: ['header', 'options', 'input', 'hints'],
    visible: { header: true, input: true, hints: true }
  },
  options: [...],
  config: {...}
});

const result = await customMenu.show();
```

### Wizard API
```typescript
import { createWizard } from 'cli-menu-kit';

const wizard = createWizard({
  steps: [
    { name: 'language', component: 'language-selector' },
    { name: 'workspace', component: 'text-input' },
    { name: 'preferences', component: 'checkbox-menu' }
  ],
  onComplete: (results) => {
    // Handle completion
  }
});

await wizard.run();
```

## Testing Strategy

- Unit tests for each component
- Integration tests for layout system
- Visual regression tests for rendering
- E2E tests for complete flows
- Test files kept under 300 lines each

## Documentation

- API reference for all components
- Usage examples for each feature
- Migration guide from v1
- Best practices guide
- Troubleshooting guide
