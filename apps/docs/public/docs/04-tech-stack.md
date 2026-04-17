# Tech Stack

A comprehensive overview of every major technology used in the LDC Frontend system.

---

## Core Runtime

| Technology | Version | Role |
|---|---|---|
| **React** | `19.1.4` | UI rendering |
| **TypeScript** | `5.9.3` | Type-safe JavaScript |
| **Bun** | `1.3.11` | Package manager & JS runtime |

---

## Build & Bundling

### Rsbuild (Rspack)
The primary build tool for all apps. Rsbuild is a Rspack-based build system that offers:

- Near-instant cold starts (written in Rust)
- Drop-in replacement for Webpack in Module Federation
- Native React Fast Refresh

```ts
// rsbuild.config.ts
import { pluginReact } from "@rsbuild/plugin-react";
import { defineConfig } from "@rsbuild/core";

export default defineConfig({
  plugins: [pluginReact()],
  server: { port: 3000 },
});
```

### Turborepo
Task orchestration across the monorepo:

- Incremental builds with caching (`turbo run build`)
- Parallel execution of dev servers
- Dependency-aware task graph (`^build`)

### Vite
Used in select packages for library builds (non-app packages).

---

## Micro Frontend

### Module Federation v2 (`@module-federation/rsbuild-plugin`)

The architecture uses **Module Federation** to split the app into independently deployable remotes.

```
Shell (host) ──────────────────────────────────────────
  │
  ├── loads → dashboard@http://localhost:3001/mf-manifest.json
  │
  └── shared singletons: react, react-dom, react-router-dom, i18next
```

**Shared singletons** prevent duplicate React instances across remotes. Each shared package is declared with `singleton: true, eager: true` in the shell config.

---

## UI & Styling

### Tailwind CSS v4
CSS utility framework used across all apps and packages. LDC Frontend uses the **CSS-first** approach of Tailwind v4 with CSS variables for theming.

```css
/* tooling/tailwind/styles/core.css */
@import "tailwindcss";
@import "./theme.css";
@import "./base.css";
@import "./variants.css";
```

### shadcn/ui
Component primitives built on **Radix UI**, styled with Tailwind. All components live in `packages/ui` and are shared across apps.

- Base color: `neutral`
- CSS variables for color tokens
- Dark/light mode support

### Lucide React
Icon library used throughout. Declared as a workspace catalog dependency so all packages use the same version.

---

## Routing

### React Router DOM v7
Used in the **Shell** app for top-level routing. Routes are defined declaratively with lazy-loaded remote components:

```tsx
const Dashboard = lazy(() => import("dashboard/remote-dashboard"));

export const routes: RouteObject[] = [
  {
    path: "/",
    element: <RootLayout />,
    children: [
      { path: "dashboard", element: <Suspense fallback={...}><Dashboard /></Suspense> }
    ],
  },
];
```

### TanStack Router *(packages)*
Used in individual feature-rich packages for type-safe, file-based routing within remotes.

---

## Data Fetching & State

### TanStack Query v5 (`@tanstack/react-query`)
Server state management. Provides:

- Automatic caching and background refetching
- Query key factories via `@ldc/tanstack-query`
- Suspense-compatible queries (`useSuspenseQuery`)

### tRPC v11 (`@trpc/client`, `@trpc/server`, `@trpc/tanstack-react-query`)
End-to-end type-safe API layer. tRPC procedures map directly to TypeScript types — no code generation needed.

### Axios
Used in `@ldc/api-sdk` for REST API calls where tRPC is not applicable (e.g., legacy endpoints or file uploads).

---

## Forms

### React Hook Form v7
Performant form state management with minimal re-renders.

### Zod v4
Runtime schema validation. Used for:

- Form validation schemas (via `@hookform/resolvers`)
- API response validation
- Environment variable parsing

### @ldc/autoform
First-class auto-form generation from Zod schemas — see [Packages & APIs](./05-packages-and-apis.md).

---

## Workflow Editor

### Rete.js v2
Visual node-based editor framework. The `@ldc/workflow-editor` package uses the following Rete plugins:

| Plugin | Purpose |
|---|---|
| `rete-area-plugin` | Canvas viewport management |
| `rete-connection-plugin` | Drag-and-drop connections |
| `rete-react-plugin` | React-based node rendering |
| `rete-context-menu-plugin` | Right-click context menus |
| `rete-history-plugin` | Undo / Redo |
| `rete-auto-arrange-plugin` | Auto-layout of nodes |
| `rete-connection-path-plugin` | Custom connection path rendering |

---

## Internationalization

### i18next + react-i18next
All translations managed via `@ldc/i18n`. The package is shared as a **Module Federation singleton** so all remote apps use the same translation instance and locale state.

---

## Code Quality

| Tool | Purpose |
|---|---|
| **ESLint** | Linting (`@ldc/eslint-config`) |
| **Prettier** | Code formatting (`@ldc/prettier-config`) |
| **TypeScript strict mode** | Type safety |

---

## Mobile

### Expo
Mobile application support via Expo CLI. Run Android/iOS builds from the root:

```bash
bun run android
bun run ios
```

---

## Summary Diagram

```
┌─────────────────────────────────────────────────────┐
│                   Browser                           │
│  ┌──────────────┐     ┌──────────────────────────┐  │
│  │  Shell App   │────▶│  Dashboard Remote        │  │
│  │  (port 3000) │ MF  │  (port 3001)             │  │
│  └──────┬───────┘     └──────────────────────────┘  │
└─────────┼───────────────────────────────────────────┘
          │
     React Router DOM v7
     TanStack Query v5
     tRPC v11
          │
┌─────────▼───────────────────────────────────────────┐
│             Shared Packages                         │
│  @ldc/ui  @ldc/api-sdk  @ldc/i18n  @ldc/autoform   │
│  @ldc/data-table  @ldc/workflow-editor              │
└─────────────────────────────────────────────────────┘
          │
     Rsbuild + Turborepo (build layer)
     Bun Workspaces (dependency management)
```

---

## Detailed Documentation

For in-depth guides on specific technologies, see the following documentation:

### Build & Development
- **[Bun](./bun.md)** — Package manager, workspaces, and catalog versioning
- **[Rsbuild](./rsbuild.md)** — Build tool, Module Federation, and configuration
- **[Turborepo](./turborepo.md)** — Task orchestration, caching, and monorepo builds
- **[T3 Env](./t3-env.md)** — Environment variable validation with Zod

### UI & Styling
- **[Tailwind CSS](./tailwindcss.md)** — Utility-first CSS, theming, and design system

### Data Management
- **[TanStack Query](./tanstack-query.md)** — Server state, caching, and Suspense queries
- **[TanStack Table](./tanstack-table.md)** — Headless table engine and virtualization
- **[Zustand](./zustand.md)** — Client state management

### Specialized Tools
- **[Rete.js](./rete.md)** — Visual workflow editor and node-based UI
