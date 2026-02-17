# Page Layout Architecture V2

## Core Principles

1. **Complete Decoupling** - Every component is independent
2. **Component-Based** - Each area is a component container
3. **Configuration-Driven** - Content controlled by configuration
4. **Caller Responsibility** - Caller handles component relationships and logic

## Architecture Layers

```
┌─────────────────────────────────────────┐
│ Caller Code (Logic Layer)              │
│ - Handles component relationships      │
│ - Manages conditional logic             │
│ - Generates configurations              │
└─────────────────────────────────────────┘
           ↓ Configuration
┌─────────────────────────────────────────┐
│ Page Layout (Assembly Layer)           │
│ - Renders Header area                   │
│ - Renders Main Area                     │
│ - Renders Footer area                   │
└─────────────────────────────────────────┘
           ↓ Renders
┌─────────────────────────────────────────┐
│ Component Layer (Independent)           │
│ - ASCII Art Component                   │
│ - Title Component                       │
│ - Menu Options Component                │
│ - Input Prompt Component                │
│ - Hints Component                       │
│ - Table Component                       │
│ - List Component                        │
│ - etc.                                  │
└─────────────────────────────────────────┘
```

## Component Interface

Every component follows this interface:

```typescript
interface Component {
  type: string;           // Component type identifier
  render: () => void;     // Render function
  config?: any;           // Component-specific configuration
}
```

## Area Configuration

Each area (Header/Main/Footer) is a component container:

```typescript
interface AreaConfig {
  components: Component[];
}

interface PageLayoutConfig {
  header?: AreaConfig;
  mainArea?: AreaConfig;
  footer?: AreaConfig;
}
```

## Example Usage

```typescript
// Caller code handles logic
const menuOptions = buildMenuOptions();
const hints = generateHints(menuOptions);  // Based on menu options

renderPage({
  header: {
    components: [
      { type: 'ascii-art', render: () => renderAsciiArt([...]) },
      { type: 'title', render: () => renderTitle('My App') }
    ]
  },
  mainArea: {
    components: [
      { type: 'menu-options', render: () => renderMenuOptions(menuOptions) }
    ]
  },
  footer: {
    components: [
      { type: 'input-prompt', render: () => renderInputPrompt('Select') },
      { type: 'hints', render: () => renderHints(hints) }
    ]
  }
});
```

## Component Relationships

Components can have relationships, handled by caller:

```typescript
// Example: Menu options affect hints
const menuOptions = buildMenuOptions();
const hints = menuOptions.some(opt => /^\d+\./.test(opt))
  ? ['↑↓ Arrows', '0-9 Numbers', '⏎ Confirm']
  : ['↑↓ Arrows', '⏎ Confirm'];

// Example: Conditional confirmation
const result = await renderPage({...});
if (needsConfirmation(result)) {
  await renderPage({
    footer: {
      components: [
        { type: 'ask', render: () => askConfirmation('Are you sure?') }
      ]
    }
  });
}
```

## Benefits

1. ✅ **Complete Decoupling** - Components don't know about each other
2. ✅ **Flexible Assembly** - Any component in any area
3. ✅ **Reusable Components** - Use same component in different areas
4. ✅ **Clear Separation** - Layout renders, caller handles logic
5. ✅ **Easy Testing** - Test components independently
6. ✅ **Maintainable** - Changes to one component don't affect others
