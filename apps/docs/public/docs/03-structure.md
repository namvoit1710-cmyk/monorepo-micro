# Project Structure

LDC Frontend follows a **monorepo** layout managed by Bun Workspaces and Turborepo. All packages, apps, and tooling live in a single repository.

---

## Top-Level Layout

```
@ldc-fe/root/
├── apps/                    # Deployable micro frontend applications
│   ├── shell/               # Host application (MF orchestrator)
│   └── dashboard/           # Remote app — analytics & reporting
│
├── packages/                # Shared internal libraries
│   ├── ui/                  # Design system & component library (@ldc/ui)
│   ├── api-sdk/             # HTTP API client (@ldc/api-sdk)
│   ├── autoform/            # Auto-generated forms (@ldc/autoform)
│   ├── data-table/          # Data grid component (@ldc/data-table)
│   ├── workflow-editor/     # Visual node editor (@ldc/workflow-editor)
│   ├── i18n/                # Internationalization (@ldc/i18n)
│   └── tanstack-query/      # TanStack Query utilities (@ldc/tanstack-query)
│
├── tooling/                 # Shared configuration packages
│   ├── eslint-config/       # ESLint rules (@ldc/eslint-config)
│   ├── prettier-config/     # Prettier config (@ldc/prettier-config)
│   ├── tailwind/            # Tailwind CSS base (@ldc/tailwind-config)
│   └── tsconfig/            # TypeScript base configs (@ldc/tsconfig)
│
├── turbo/                   # Turborepo generators & templates
│   └── generators/
│       └── templates/       # Scaffold templates for new apps/packages
│
├── turbo.json               # Turborepo task pipeline definition
├── package.json             # Root workspace manifest
└── .env.example             # Environment variable template
```

---

## Apps

### `apps/shell`

The **Shell** is the main host application. It is the entry point users navigate to and is responsible for:

- Global layout (sidebar, navigation, app bar)
- Routing (`react-router-dom` v7)
- Loading remote apps via Module Federation
- Auth propagation to all remotes
- i18n singleton registration
- Micro Frontend infrastructure (event bus, error handling, CSS isolation)

**Port:** `3000`

```
apps/shell/src/
├── configs/          # App menu config, feature flags
├── infra/            # MF infrastructure layer (event bus, auth, guards)
│   ├── mf-event-bus.ts
│   ├── mf-auth-propagation.ts
│   ├── mf-fetch-interceptor.ts
│   ├── mf-shared-scope-guard.ts
│   ├── mf-lifecycle-timeout.ts
│   ├── mf-error-suppressor.ts
│   ├── mf-css-isolation.ts
│   └── mf-remote-registry.ts
├── layouts/          # Root layout, sidebar
├── pages/            # Top-level page components
├── routes.tsx        # React Router route definitions
└── main.tsx          # App entry point
```

### `apps/dashboard`

The **Dashboard** is a **Module Federation remote** app. It exposes a `remote-dashboard` component that the shell loads lazily at `/dashboard`.

**Port:** `3001`

---

## Packages

### `@ldc/ui`

The core **design system** and component library. Built on top of **shadcn/ui** with Tailwind CSS v4. All components are exported from a single entry point.

- Uses CSS variables for theming (`neutral` base color)
- Supports dark/light mode via CSS class toggling
- Icon library: `lucide-react`

### `@ldc/api-sdk`

Centralized **HTTP client** built with `axios`. Provides typed API methods for all backend endpoints.

### `@ldc/autoform`

**Auto-generated forms** from Zod schemas. Uses `react-hook-form` with `@hookform/resolvers` and integrates `@ldc/ui` form components. Supports Monaco Editor fields for JSON/YAML inputs.

### `@ldc/data-table`

Feature-rich **data grid** built on `@tanstack/react-table` with virtual scrolling via `@tanstack/react-virtual`.

### `@ldc/workflow-editor`

A **visual node-based workflow editor** built on the **Rete.js v2** framework. Supports drag-and-drop, connections, context menus, history (undo/redo), and read-only mode.

### `@ldc/i18n`

Internationalization wrapper around `i18next` and `react-i18next`. Registered as a singleton in Module Federation so all remotes share the same i18n instance.

### `@ldc/tanstack-query`

Re-exports and configuration utilities for **TanStack Query v5**, including a typed query key factory and shared query client setup.

---

## Tooling

| Package | Purpose |
|---|---|
| `@ldc/eslint-config` | Shared ESLint rules for all apps and packages |
| `@ldc/prettier-config` | Shared Prettier formatting rules |
| `@ldc/tailwind-config` | Tailwind CSS base config and theme tokens |
| `@ldc/tsconfig` | Base `tsconfig.json` presets |

---

## Feature Directory Convention (within apps)

Each feature within an app follows this structure:

```
features/
  my-feature/
    api/            # API service calls (axios)
    components/     # Feature-specific React components
    hooks/          # Custom hooks (useQuery, useMutation, etc.)
    helpers/        # Pure utility functions
    types/          # TypeScript interfaces and types
    index.ts        # Public API (named exports only)
```

Only `index.ts` exports should be used when importing from outside the feature folder.

---

## Turborepo Task Graph

The `turbo.json` defines the build pipeline:

```
build    → requires upstream ^build
dev      → persistent watch, requires upstream ^build
lint     → requires ^topo and ^build
typecheck→ requires ^topo and ^build
format   → independent
clean    → no cache
```

This ensures packages are always compiled before the apps that depend on them.
