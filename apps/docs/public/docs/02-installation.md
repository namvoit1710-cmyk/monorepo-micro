# Installation

This guide walks you through setting up the LDC Frontend monorepo on your local machine.

---

## Prerequisites

Make sure you have the following installed before proceeding:

| Tool | Version | Notes |
|---|---|---|
| **Node.js** | `>=20.x` | LTS recommended |
| **Bun** | `1.3.11` | Package manager & runtime |
| **Git** | Latest | Version control |
| **Turbo** (optional) | `2.x` | Auto-installed via devDeps |

### Install Bun

```bash
# macOS / Linux
curl -fsSL https://bun.sh/install | bash

# Windows (via PowerShell)
powershell -c "irm bun.sh/install.ps1 | iex"

# Verify
bun --version  # Should output 1.3.11
```

---

## Clone the Repository

```bash
git clone https://github.com/your-org/ldc-fe.git
cd ldc-fe
```

---

## Install Dependencies

All packages across the monorepo are installed in a single command:

```bash
bun install
```

Bun will resolve workspace dependencies automatically. After installation, `node_modules` will be hoisted to the root where possible.

---

## Environment Variables

Copy the example env file at the root:

```bash
cp .env.example .env
```

Key variables:

```env
# API
PUBLIC_API_URL=http://localhost:8080

# Remote URLs (Module Federation)
PUBLIC_DASHBOARD_REMOTE_URL=http://localhost:3001
```

> Variables prefixed with `PUBLIC_` are injected into the browser bundle. Never put secrets here.

---

## Running the Applications

### Start All Apps (Recommended for development)

```bash
bun run dev
```

This runs `turbo watch dev --continue` — all apps and packages rebuild in parallel with watch mode.

### Start Only the Shell

```bash
bun run start:shell
# Equivalent to: bun install && turbo watch dev -F @ldc/shell
```

Shell runs on **http://localhost:3000**

### Start Only the Dashboard Remote

```bash
bun run start:dashboard
# Equivalent to: bun install && turbo watch dev -F @ldc/dashboard
```

Dashboard remote runs on **http://localhost:3001**

### Start Both Shell + Dashboard

```bash
bun run dev:shell &
bun run dev:dashboard
```

---

## Build for Production

```bash
# Build all apps and packages
bun run build

# Build only shell
bun run build:shell

# Build only dashboard
bun run build:dashboard
```

Build artifacts are output to each app/package's `dist/` folder.

---

## Code Quality Commands

```bash
# Type checking (all packages)
bun run typecheck

# Lint (ESLint across all workspaces)
bun run lint

# Auto-fix lint issues
bun run lint:fix

# Format check (Prettier)
bun run format

# Auto-format
bun run format:fix
```

---

## Clean Up

```bash
# Remove root node_modules
bun run clean

# Remove all workspace node_modules, dist, turbo cache
bun run clean:workspaces
```

## Troubleshooting

### Port conflicts
If port 3000 or 3001 is in use, change the port in the respective `rsbuild.config.ts`:

```ts
server: { port: 3002 }
```

### Remote app not loading in shell
Make sure the dashboard remote is running before loading the shell. The shell fetches the remote manifest from `http://localhost:3001/mf-manifest.json`.

### `bun install` fails
Ensure your Bun version matches exactly `1.3.11`. Run `bun upgrade --version 1.3.11` to pin it.
