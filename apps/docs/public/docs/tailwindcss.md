# Tailwind CSS

**Version:** `tailwindcss@^4.1.16`
**Internal package:** `@ldc/tailwind-config`

Tailwind CSS v4 is the primary styling framework for all LDC Frontend UI. Combined with shadcn/ui it forms a complete design system.

---

## Why Tailwind?

Tailwind lets the team write consistent UI without naming classes (BEM, SMACSS), eliminates CSS specificity wars, and automatically purges unused styles for a smaller bundle. With Tailwind v4, configuration moves to CSS-first — no `tailwind.config.js` required.

---

## Pros

**No naming required:** No time wasted thinking up class names (`.card-header-title-wrapper`). Utility classes describe the style directly.

**Small bundle:** Tailwind v4 uses the Oxide engine (Rust), automatically scanning and removing unused classes. Production CSS bundle is extremely small.

**Integrated design system:** CSS variables for colors, spacing, and radius — in sync with shadcn/ui and dark mode.

**Co-location:** Styles live right inside JSX, easier to read and maintain than separate CSS files.

**v4 CSS-first:** No complex `tailwind.config.js` needed. Everything lives in a CSS file.

## Cons

**Long classnames:** JSX lines can become lengthy and hard to read with many utility classes.

**Learning curve:** You need to memorize utility shorthands. Unfamiliar developers will frequently consult the docs.

**v4 breaking changes:** Tailwind v4 differs significantly from v3 (CSS-first, reduced `@apply` usage). v3 code requires migration.

**Not semantic:** Reading HTML alone does not reveal the design intent of a component.

---

## Configuration in this project

### Entry point CSS

```css
/* tooling/tailwind/styles/core.css */
@import "tailwindcss";
@import "./theme.css";     /* CSS variables for colors and radius */
@import "./base.css";      /* Base HTML resets */
@import "./variants.css";  /* Custom variants */

@source "@ldc/ui";         /* Scan @ldc/ui for classes */
```

### App import

```css
/* apps/shell/src/index.css */
@import "@ldc/tailwind-config/core";

/* Scan sources of used packages */
@source "../../../packages/ui/src/**/*.{ts,tsx}";
@source "../../dashboard/src/**/*.{ts,tsx}";
```

### Theme CSS variables (shadcn/ui compatible)

```css
/* tooling/tailwind/styles/theme.css */
:root {
  --background: oklch(1 0 0);
  --foreground: oklch(0.141 0.005 285.823);
  --primary: oklch(0.21 0.006 285.885);
  --primary-foreground: oklch(0.985 0 0);
  --border: oklch(0.92 0.004 286.32);
  --radius: 0.625rem;
  --sidebar: oklch(0.985 0 0);
  /* ... */
}
.dark {
  --background: oklch(0.141 0.005 285.823);
  /* ... */
}
```

---

## Usage

### Basic utility classes

```tsx
// Instead of writing separate CSS:
<div className="flex items-center gap-4 p-6 rounded-lg border bg-card">
  <h2 className="text-xl font-semibold text-foreground">Title</h2>
  <p className="text-sm text-muted-foreground">Description</p>
</div>
```

### Responsive design

```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {/* Mobile: 1 col  |  Tablet: 2 col  |  Desktop: 3 col */}
</div>
```

### Dark mode

```tsx
// Automatic via CSS variable — no dark: prefix needed
<div className="bg-background text-foreground">
  {/* bg-background uses var(--background) — switches automatically with .dark class */}
</div>
```

### Using the `cn()` utility (shadcn/ui pattern)

```ts
import { cn } from "@ldc/ui";

function Button({ className, variant }: Props) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-md text-sm font-medium",
        variant === "destructive" && "bg-destructive text-destructive-foreground",
        className  // Override from parent
      )}
    />
  );
}
```

### Inside `@ldc/data-table`

```tsx
<TableCell
  className={cn(
    "min-h-12 shrink-0",
    cell.column.columnDef.meta?.align === "center" && "text-center",
    getPinningStyles(cell.column).className
  )}
/>
```

---

## Adding a shadcn component

```bash
# From the monorepo root
bun run ui-add
# → turbo run ui-add → shadcn CLI inside packages/ui
```

---

## Comparison with other CSS solutions

| Criterion | **Tailwind v4** | CSS Modules | Styled Components | UnoCSS |
|---|---|---|---|---|
| Bundle size | ✅ Small | ✅ Small | ⚠️ Runtime CSS | ✅ Smallest |
| Type safety | ⚠️ String classes | ✅ | ✅ | ⚠️ |
| Dark mode | ✅ | ⚠️ Manual | ✅ | ✅ |
| Design system | ✅ CSS vars | 🔶 DIY setup | ✅ | ✅ |
| DX / Speed | ✅ Fast | 🔶 | ⚠️ Slow (runtime) | ⚡ Fastest |
| Learning curve | 🔶 Medium | ✅ Low | ✅ Low | 🔶 |
| **Best for** | Design systems, teams | Isolated styles | Heavy theming | Performance-critical |

> **Conclusion:** Tailwind + shadcn/ui is the most popular combo for React enterprise in 2024–2025. A perfect fit for LDC because design tokens are already exposed as CSS variables and integrate cleanly with Module Federation via the `@source` directive.
