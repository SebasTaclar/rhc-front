# Theme System Documentation

## Overview

The application now supports both dark and light themes with a reusable ThemeToggle component and CSS variable system.

## Components

### ThemeToggle.vue

A reusable component that allows users to switch between dark and light themes.

**Features:**

- Toggle switch with sun/moon icons
- Smooth animations and transitions
- Saves preference to localStorage
- Respects system preference on first visit
- Mobile responsive design

**Usage:**

```vue
<template>
  <ThemeToggle />
</template>

<script setup>
import ThemeToggle from '@/components/ThemeToggle.vue'
</script>
```

## CSS Variable System

### Theme Variables

The theme system uses CSS custom properties that automatically switch based on the `data-theme` attribute on the root element.

#### Dark Theme (Default)

```css
--bg-primary: #2d2d2d --bg-secondary: rgba(255, 255, 255, 0.1)
  --bg-tertiary: rgba(255, 255, 255, 0.05) --text-primary: #ffffff
  --text-secondary: rgba(255, 255, 255, 0.9) --text-muted: rgba(255, 255, 255, 0.7)
  --border-primary: rgba(255, 255, 255, 0.2) --border-secondary: rgba(255, 255, 255, 0.1)
  --backdrop-blur: blur(20px) --overlay-bg: rgba(0, 0, 0, 0.7);
```

#### Light Theme

```css
--bg-primary: #f8f9fa --bg-secondary: rgba(255, 255, 255, 0.8)
  --bg-tertiary: rgba(255, 255, 255, 0.6) --text-primary: #333333 --text-secondary: #555555
  --text-muted: #666666 --border-primary: rgba(0, 0, 0, 0.1) --border-secondary: rgba(0, 0, 0, 0.05)
  --backdrop-blur: blur(5px) --overlay-bg: rgba(0, 0, 0, 0.5);
```

### Brand Colors (Theme Independent)

```css
--primary-color: #9b3b32 --primary-color-dark: #7a2e27 --primary-color-light: #b8453a
  --primary-color-alpha-30: rgba(155, 59, 50, 0.3) --primary-color-alpha-40: rgba(155, 59, 50, 0.4)
  --primary-color-alpha-60: rgba(155, 59, 50, 0.6) --primary-color-alpha-80: rgba(155, 59, 50, 0.8)
  --primary-gradient: linear-gradient(135deg, #9b3b32 0%, #7a2e27 100%)
  --primary-gradient-hover: linear-gradient(135deg, #7a2e27 0%, #9b3b32 100%);
```

## How to Use Theme Variables

### In Components

Replace hardcoded colors with theme variables:

**Before:**

```css
background: rgba(255, 255, 255, 0.1);
color: white;
border: 1px solid rgba(255, 255, 255, 0.2);
```

**After:**

```css
background: var(--bg-secondary);
color: var(--text-primary);
border: 1px solid var(--border-primary);
```

### Utility Classes

Use predefined utility classes for common styling:

```css
.bg-secondary {
  background: var(--bg-secondary);
}
.bg-tertiary {
  background: var(--bg-tertiary);
}
.text-primary {
  color: var(--text-primary);
}
.text-secondary {
  color: var(--text-secondary);
}
.text-muted {
  color: var(--text-muted);
}
.border-primary {
  border-color: var(--border-primary);
}
.border-secondary {
  border-color: var(--border-secondary);
}
```

## Theme Switching Logic

The theme is controlled by the `data-theme` attribute on the root element:

- `data-theme="dark"` - Dark theme (default)
- `data-theme="light"` - Light theme

The ThemeToggle component automatically:

1. Sets the appropriate `data-theme` attribute
2. Saves the preference to localStorage
3. Loads the saved preference on app startup
4. Falls back to system preference if no saved preference exists

## Best Practices

1. **Always use theme variables** instead of hardcoded colors
2. **Test both themes** when creating new components
3. **Use semantic variable names** (bg-primary, text-primary) rather than color values
4. **Include transitions** for smooth theme switching: `transition: all 0.3s ease`
5. **Consider contrast** - ensure text is readable in both themes

## Migration Guide

To make existing components theme-aware:

1. Replace hardcoded background colors with `var(--bg-primary)`, `var(--bg-secondary)`, etc.
2. Replace hardcoded text colors with `var(--text-primary)`, `var(--text-secondary)`, etc.
3. Replace hardcoded border colors with `var(--border-primary)`, `var(--border-secondary)`
4. Add transition properties for smooth theme changes
5. Test the component in both light and dark themes

## Examples

### Button Component

```css
.btn-secondary {
  background: var(--bg-secondary);
  color: var(--text-primary);
  border: 1px solid var(--border-primary);
  transition: all 0.3s ease;
}

.btn-secondary:hover {
  background: var(--bg-tertiary);
  border-color: var(--primary-color-alpha-60);
}
```

### Card Component

```css
.card {
  background: var(--bg-secondary);
  border: 1px solid var(--border-primary);
  border-radius: 12px;
  padding: 1rem;
  backdrop-filter: var(--backdrop-blur);
  box-shadow: 0 4px 16px var(--shadow-primary);
  transition: all 0.3s ease;
}

.card-title {
  color: var(--text-primary);
}

.card-subtitle {
  color: var(--text-secondary);
}

.card-muted {
  color: var(--text-muted);
}
```
