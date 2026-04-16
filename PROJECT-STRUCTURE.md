# Auto Form Monorepo - Project Structure

## Overview
This is a monorepo workspace for an auto-form application, organized with Turborepo and using module federation architecture.

```
auto-form-monorepo/
├── package.json              # Root package configuration for workspace dependencies.
├── turbo.json                # Turborepo configuration for build pipeline and caching.
├── run-auto-form-app.cmd     # Launch script to start the application.
├── README.md                 # Project documentation and setup instructions.
│
├── apps/                     # 📱 Applications - Main executable applications in the monorepo.
│   ├── dashboard/            # Dashboard application exposed as a federated module.
│   │   ├── package.json      # Dashboard-specific dependencies and scripts.
│   │   ├── rsbuild.config.ts # Rsbuild configuration with Module Federation setup.
│   │   ├── tsconfig.json     # TypeScript configuration for type checking.
│   │   ├── eslint.config.ts  # ESLint rules for code quality and consistency.
│   │   ├── index.html        # Entry HTML file for the application.
│   │   ├── env.d.ts          # Environment variable type definitions.
│   │   └── src/
│   │       ├── main.tsx           # Entry point - Imports bootstrap for async loading.
│   │       ├── bootstrap.tsx      # Bootstrap logic - Dynamic imports, federated setup.
│   │       ├── app.tsx            # Main React component - Root application wrapper.
│   │       ├── env.ts             # Environment configuration and validation.
│   │       ├── index.css          # Global styles and CSS imports.
│   │       ├── layouts/
│   │       │   └── root-layout.tsx # Root layout component with common UI structure.
│   │       └── pages/
│   │           └── home.tsx        # Home page component.
│   │
│   └── shell/                # Shell host application - Orchestrates module federation.
│       ├── package.json      # Shell-specific dependencies and scripts.
│       ├── rsbuild.config.ts # Rsbuild config for host app with remote module loading.
│       ├── tsconfig.json     # TypeScript configuration.
│       ├── eslint.config.ts  # ESLint rules.
│       ├── index.html        # Entry HTML file.
│       ├── @mf-types/        # Module Federation type definitions (auto-generated).
│       │   ├── index.d.ts
│       │   └── dashboard/
│       │       ├── apis.d.ts              # API types from dashboard remote.
│       │       ├── remote-dashboard.d.ts  # Remote module type definitions.
│       │       └── compiled-types/        # Compiled TypeScript types.
│       └── src/
│           ├── main.tsx      # Entry point for shell application.
│           ├── bootstrap.tsx # Bootstrap logic - Loads remote modules asynchronously.
│           ├── app.tsx       # Main app component - Routes and federated module integration.
│           ├── env.ts        # Environment configuration.
│           ├── index.css     # Global styles.
│           ├── remotes.d.ts  # Type declarations for remote federated modules.
│           ├── components/   # Shared UI components specific to shell.
│           ├── configs/      # Configuration files (routes, navigation, settings).
│           ├── infra/        # Infrastructure code (API clients, utilities).
│           ├── layouts/      # Layout components (header, sidebar, footer).
│           └── pages/        # Page components and route handlers.
│
├── packages/                 # 📦 Shared Packages - Reusable libraries across apps.
│   ├── api-sdk/              # API SDK for centralized API communication.
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   ├── eslint.config.ts
│   │   └── src/
│   │       └── index.ts      # Main export - API client, methods, types.
│   │
│   ├── env/                  # Environment variable management and validation.
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   ├── eslint.config.ts
│   │   └── src/
│   │       ├── index.ts      # Public API exports.
│   │       ├── client.ts     # Client-side environment variable access.
│   │       └── server.ts     # Server-side environment variable validation.
│   │
│   ├── tanstack-query/       # TanStack Query utilities and configurations.
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   ├── eslint.config.ts
│   │   └── src/
│   │       ├── index.ts               # Main exports.
│   │       ├── query-client.ts        # QueryClient setup with default options.
│   │       ├── query-key-factory.ts   # Factory pattern for consistent query keys.
│   │       ├── hooks/                 # Custom React Query hooks (useQuery, useMutation wrappers).
│   │       └── types/                 # Type definitions for queries.
│   │
│   ├── ui/                   # Shared UI component library (Design System).
│   │   ├── package.json
│   │   ├── components.json   # Component registry for shadcn/ui or similar.
│   │   ├── tsconfig.json
│   │   ├── eslint.config.ts
│   │   └── src/
│   │       ├── index.ts      # Public component exports.
│   │       ├── components/   # Reusable UI components (Button, Input, Modal, etc.).
│   │       ├── hooks/        # Custom React hooks (useClickOutside, useDebounce, etc.).
│   │       ├── lib/          # Utility functions (cn, formatters, validators).
│   │       └── styles/       # Component-specific styles.
│   │
│   ├── validators/           # Shared validation schemas and utilities (Zod, Yup).
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   ├── eslint.config.ts
│   │   └── src/
│   │       └── index.ts      # Validation schemas for forms, API requests.
│   │
│   ├── workflow-business/    # Business logic for workflow management.
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── eslint.config.ts
│   │
│   └── worklfow-editor/      # Visual workflow editor component (Node-based editor).
│       ├── package.json
│       ├── tsconfig.json
│       └── eslint.config.ts
│
├── tooling/                  # 🛠️ Development Tooling - Shared configurations.
│   ├── eslint/               # ESLint configuration packages.
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   ├── base.ts           # Base ESLint config for all projects.
│   │   ├── react.ts          # React-specific ESLint rules.
│   │   └── nextjs.ts         # Next.js-specific ESLint rules.
│   │
│   ├── prettier/             # Prettier configuration for consistent code formatting.
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── index.js          # Prettier config with rules and plugins.
│   │
│   ├── tailwind/             # Tailwind CSS configuration and theming.
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   ├── eslint.config.ts
│   │   ├── postcss-config.js # PostCSS configuration for Tailwind processing.
│   │   ├── constants.ts      # Design tokens (colors, spacing, breakpoints).
│   │   ├── base.css          # Base Tailwind directives and resets.
│   │   ├── index.css         # Main CSS entry point.
│   │   ├── theme.css         # Default theme variables.
│   │   ├── olive.css         # Olive theme variant.
│   │   ├── variants.css      # CSS variants and utilities.
│   │   ├── libs/             # Utility libraries for Tailwind.
│   │   ├── registry/
│   │   │   └── theme.ts      # Theme registry and configuration.
│   │   └── types/
│   │       └── index.ts      # Type definitions for Tailwind config.
│   │
│   └── typescript/           # TypeScript configuration packages.
│       ├── package.json
│       ├── base.json         # Base tsconfig for all TypeScript projects.
│       └── compiled-package.json # Config for compiled packages.
│
└── turbo/                    # 🔧 Turbo Tooling - Code generation and scaffolding.
    └── generators/           # Turbo generators for creating new apps/packages.
        ├── config.ts         # Generator configuration and prompts.
        └── templates/        # Handlebars templates for scaffolding.
            ├── app-app.tsx.hbs            # App component template.
            ├── app-bootstrap.tsx.hbs      # Bootstrap template.
            ├── app-home.tsx.hbs           # Home page template.
            ├── app-index.css.hbs          # CSS template.
            ├── app-index.html.hbs         # HTML entry template.
            ├── app-main.tsx.hbs           # Main entry point template.
            ├── app-package.json.hbs       # App package.json template.
            ├── app-root-layout.tsx.hbs    # Root layout template.
            ├── app-rsbuild.config.ts.hbs  # Rsbuild config template.
            ├── app-tsconfig.json.hbs      # App tsconfig template.
            ├── eslint.config.ts.hbs       # ESLint config template.
            ├── package.json.hbs           # Generic package.json template.
            └── tsconfig.json.hbs          # Generic tsconfig template.
```

---

## Architecture Highlights

1. **Monorepo Structure**: Uses Turborepo for efficient builds, task orchestration, and caching across packages.
2. **Module Federation**: Shell app acts as host and dynamically loads Dashboard as a federated remote module.
3. **Shared Packages**: Common code (UI components, API SDK, validation, query utils) shared across applications.
4. **Code Generation**: Turbo generators provide consistent scaffolding for new apps and packages using Handlebars templates.
5. **Unified Tooling**: Centralized ESLint, Prettier, Tailwind, and TypeScript configurations ensure consistency.
6. **Build Tool**: Rsbuild (Rspack-powered) for fast, optimized builds with Module Federation support.
