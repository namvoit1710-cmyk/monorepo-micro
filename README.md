# Auto Form Monorepo

A modern, highly-scalable monorepo implementing a Micro-Frontend architecture. Built to deliver strong typing, performance, and seamless module federations using the latest web tooling ecosystem.

## 🚀 Tech Stack

- **Package Manager**: [Bun](https://bun.sh/)
- **Monorepo Tool**: [Turborepo](https://turbo.build/)
- **Build Tool / Bundler**: [Rsbuild](https://rsbuild.dev/) with [React](https://react.dev/)
- **Architecture**: Module Federation (Micro-Frontends)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **State & Data Fetching**: [TanStack Query](https://tanstack.com/query/latest)
- **Forms & Validation**: [React Hook Form](https://react-hook-form.com/) & [Zod](https://zod.dev/)

## 📂 Project Structure

This repository uses Turborepo workspaces and natively resolves dependencies using the Bun local workspace catalog.

```text
.
├── apps/
│   ├── shell/           # The main Host application integrating remotes
│   └── dashboard/       # A Remote micro-frontend dashboard application
├── packages/
│   ├── api-sdk/         # Typesafe API SDK definitions and client generators
│   ├── env/             # Centralized environment variable definitions and validation
│   ├── tanstack-query/  # Shared React Query configuration and hooks
│   ├── ui/              # Shared UI component library (shadcn/ui based)
│   └── validators/      # Shared Zod validation schemas
└── tooling/
    ├── eslint/          # Shared ESLint configuration
    ├── prettier/        # Shared Prettier configuration
    ├── tailwind/        # Shared Tailwind setup and design tokens
    └── typescript/      # Base tsconfig definitions
```

## 🛠️ Getting Started

### 1. Prerequisites

Make sure you have [Bun](https://bun.sh/) installed locally:
```bash
curl -fsSL https://bun.sh/install | bash
```
*(On Windows, follow the [official guide](https://bun.sh/docs/installation) or run `powershell -c "irm bun.sh/install.ps1|iex"`)*

### 2. Installation

Install all workspace dependencies:
```bash
bun install
```
*(Note: If you encounter metadata issues or broken link errors at any point, run `bun install --force` to refresh all packages).*

### 3. Running the Development Server

The repository has multiple development scripts configured through Turbo.

To start the whole application suite:
```bash
bun run dev
```

If you only want to build or run specific applications:
```bash
# Start just the Shell host application
bun run dev:shell

# Start just the Dashboard remote application
bun run dev:dashboard
```

## 📦 Core Scripts

- `bun run build` — Builds all workspaces and micro-frontends.
- `bun run dev` — Starts all dev servers in watch mode concurrently.
- `bun run clean:workspaces` — Deep cleans all `node_modules` and cache directories across the monorepo.
- `bun run format` — Prettier checks across the codebase.
- `bun run lint` — ESLint validation across the codebase.
- `bun run typecheck` — Runs TypeScript type inference verification.

## 🔗 Architecture Notes
The application implements micro-frontends using Module Federation. `shell` consumes `dashboard` components at runtime. Auto-generated types for Module Federation are routed into `@mf-types/` which should not be committed to source control.
