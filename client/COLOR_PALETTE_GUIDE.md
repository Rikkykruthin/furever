# Color Palette Guide

## Overview
Your website now uses a custom color palette with full dark mode support. The palette consists of 5 color families, each with 11 shades (50-950).

## Color Families

### 1. Ink Black
Primary blue tones for main UI elements and accents.
- **Use for:** Primary buttons, links, interactive elements
- **Shades:** 50 (lightest) to 950 (darkest)
- **Example:** `bg-ink-black-500`, `text-ink-black-900`

### 2. Prussian Blue
Deep blue tones for headers and important elements.
- **Use for:** Headers, navigation, primary actions
- **Shades:** 50 (lightest) to 950 (darkest)
- **Example:** `bg-prussian-blue-600`, `text-prussian-blue-700`

### 3. Dusk Blue
Muted blue tones for secondary elements.
- **Use for:** Secondary buttons, cards, backgrounds
- **Shades:** 50 (lightest) to 950 (darkest)
- **Example:** `bg-dusk-blue-100`, `text-dusk-blue-600`

### 4. Dusty Denim
Neutral blue-grey tones for text and borders.
- **Use for:** Body text, borders, subtle backgrounds
- **Shades:** 50 (lightest) to 950 (darkest)
- **Example:** `text-dusty-denim-600`, `border-dusty-denim-300`

### 5. Alabaster Grey
Warm grey tones for backgrounds and neutral elements.
- **Use for:** Page backgrounds, cards, neutral UI elements
- **Shades:** 50 (lightest) to 950 (darkest)
- **Example:** `bg-alabaster-grey-50`, `text-alabaster-grey-700`

## Using the Colors

### CSS Variables
All colors are available as CSS variables:
```css
var(--color-ink-black-500)
var(--color-prussian-blue-600)
var(--color-dusk-blue-100)
var(--color-dusty-denim-400)
var(--color-alabaster-grey-200)
```

### Utility Classes
Use Tailwind-style utility classes:
```jsx
<div className="bg-prussian-blue-600 text-alabaster-grey-50">
  <h1 className="text-ink-black-300">Hello World</h1>
  <p className="text-dusty-denim-400 border-dusk-blue-200">
    This is a paragraph
  </p>
</div>
```

### Semantic Variables
The theme also provides semantic variables that automatically adapt to light/dark mode:
- `var(--background)` - Main background color
- `var(--foreground)` - Main text color
- `var(--primary)` - Primary action color
- `var(--secondary)` - Secondary elements
- `var(--muted)` - Muted backgrounds
- `var(--accent)` - Accent elements
- `var(--border)` - Border color
- `var(--card)` - Card backgrounds

## Dark Mode

### How It Works
Dark mode is controlled by the `dark` class on the `<html>` element. The ThemeContext manages this automatically.

### Using the Theme Toggle
The theme toggle button is already integrated into your NavbarWrapper component. Users can click the sun/moon icon to switch themes.

### Dark Mode in Components
Colors automatically adapt in dark mode. You can also add dark-specific styles:
```jsx
<div className="bg-white dark:bg-ink-black-950 text-ink-black-900 dark:text-alabaster-grey-50">
  Content that adapts to theme
</div>
```

## Light Mode Color Mapping
- **Background:** White
- **Primary:** Prussian Blue 600
- **Secondary:** Dusk Blue 100
- **Text:** Ink Black 900
- **Muted Text:** Dusty Denim 600
- **Borders:** Alabaster Grey 300

## Dark Mode Color Mapping
- **Background:** Ink Black 950
- **Primary:** Ink Black 400
- **Secondary:** Prussian Blue 900
- **Text:** Alabaster Grey 50
- **Muted Text:** Dusty Denim 400
- **Borders:** Dusty Denim 800

## Best Practices

### Contrast
- Always ensure sufficient contrast between text and background
- Light mode: Use darker shades (700-950) for text on light backgrounds (50-200)
- Dark mode: Use lighter shades (50-300) for text on dark backgrounds (800-950)

### Consistency
- Use Prussian Blue for primary actions across the site
- Use Dusty Denim for body text
- Use Alabaster Grey for backgrounds and neutral elements

### Accessibility
- Test color combinations for WCAG AA compliance (4.5:1 for normal text)
- Provide clear visual feedback for interactive elements
- Don't rely solely on color to convey information

## Example Components

### Button
```jsx
<button className="bg-prussian-blue-600 hover:bg-prussian-blue-700 text-white dark:bg-ink-black-600 dark:hover:bg-ink-black-500 px-4 py-2 rounded-lg transition-colors">
  Click Me
</button>
```

### Card
```jsx
<div className="bg-white dark:bg-ink-black-900 border border-alabaster-grey-300 dark:border-dusty-denim-800 rounded-lg p-6 shadow-lg">
  <h2 className="text-ink-black-900 dark:text-alabaster-grey-50 text-xl font-semibold mb-2">
    Card Title
  </h2>
  <p className="text-dusty-denim-600 dark:text-dusty-denim-300">
    Card content goes here
  </p>
</div>
```

### Input
```jsx
<input 
  type="text"
  className="bg-alabaster-grey-50 dark:bg-ink-black-900 border border-alabaster-grey-300 dark:border-dusty-denim-800 text-ink-black-900 dark:text-alabaster-grey-50 px-4 py-2 rounded-lg focus:ring-2 focus:ring-prussian-blue-500"
  placeholder="Enter text..."
/>
```

## Testing Dark Mode

1. Click the sun/moon icon in the navbar to toggle themes
2. The preference is saved to localStorage
3. The theme persists across page reloads
4. System preference is respected on first visit

## Customization

To adjust colors, edit the CSS variables in `client/src/app/globals.css`:
- Light mode variables are in `:root`
- Dark mode variables are in `.dark`
- Color definitions are at the top of `:root`
