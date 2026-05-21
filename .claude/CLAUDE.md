# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Install
bun install

# Dev — all apps concurrently
bun run dev

# Dev — individual apps
bun run dev:shell        # shell host       → http://localhost:3000
bun run dev:dashboard    # dashboard remote → http://localhost:3001
bun run dev:docs         # docs remote      → http://localhost:3002
bun run dev:workflow     # workflow remote  → http://localhost:3004
bun run dev:smdg-ai      # AI chat remote   → http://localhost:3005

# Build
bun run build            # all workspaces
bun run build:shell      # shell only

# Quality
bun run typecheck
bun run lint
bun run lint:fix
bun run format:fix

# Scaffold a new app or package
bunx turbo gen
```

There is no test runner configured — use `bun run typecheck` as the primary correctness check.

## Architecture

### Micro-Frontend Module Federation

`shell` (port 3000) is the **host**. It dynamically loads four **remotes** at runtime via `@module-federation/rsbuild-plugin`. Each remote runs as an independent Rsbuild app and exposes specific entry points:

| Remote | Port | Exposed entry |
|--------|------|---------------|
| `dashboard` | 3001 | `./remote-dashboard` |
| `docs` | 3002 | `./remote-docs` |
| `workflow_management` | 3004 | `./App` |
| `smdg_ai` | 3005 | `./App` |

`react`, `react-dom`, `react-router-dom`, `i18next`, and `react-i18next` are shared singletons — only one copy runs in the browser even across remotes. The shell must be running for remote apps to appear inside it, but each remote can also run standalone for isolated development.

### Shared Packages

Packages export TypeScript source directly (`"exports": { ".": "./src/index.ts" }`) — there is no separate build step for package consumption in dev.

| Package | Purpose |
|---------|---------|
| `@ldc/api-sdk` | Axios-based HTTP client with retry logic and session-expiry interceptor |
| `@ldc/chat-sdk` | Chat UI built on `@assistant-ui/react`; exposes `SocketTransport`, `SSETransport`, `ChatRuntimeProvider` |
| `@ldc/ui` | shadcn/ui component library with Tailwind v4 theming |
| `@ldc/autoform` | Schema-driven form generation |
| `@ldc/workflow-editor` | Visual node-graph editor (Rete-based) |
| `@ldc/tanstack-query` | TanStack Query client, key factory, shared hooks |
| `@ldc/i18n` | i18next + react-i18next re-exports |
| `@ldc/env` | Zod-validated env vars (client/server split) |
| `@ldc/validators` | Shared Zod schemas |

### Chat SDK internals (`packages/chat-sdk`)

The SDK wraps `@assistant-ui/react` with a transport-agnostic runtime:

- **`ChatRuntimeProvider`** — top-level context provider; takes a `transport` prop
- **`useChatRuntime`** — creates the assistant-ui runtime wired to the transport
- **`SocketTransport`** — socket.io-based streaming transport
- **`SSETransport`** — server-sent events transport
- **`ChatTransportMiddleware`** — interceptor interface for logging/analytics (`beforeSend`, `onChunk`, `onError`)
- Components: `Thread`, `ThreadList`, `Reasoning`, `MarkdownText`, `ToolFallback`

### Tooling

All ESLint, Prettier, Tailwind, and TypeScript configs live in `tooling/` and are consumed by every app/package. The Tailwind config in `tooling/tailwind/` holds design tokens and theme variants (default, olive).

Turborepo caches `build`, `lint`, `typecheck`, and `format` outputs. Run `bun run clean:workspaces` to bust all caches.

---

<!-- gitnexus:start -->
# GitNexus — Code Intelligence

This project is indexed by GitNexus as **monorepo-micro** (6681 symbols, 12503 relationships, 269 execution flows). Use the GitNexus MCP tools to understand code, assess impact, and navigate safely.

> If any GitNexus tool warns the index is stale, run `npx gitnexus analyze` in terminal first.

## Always Do

- **MUST run impact analysis before editing any symbol.** Before modifying a function, class, or method, run `gitnexus_impact({target: "symbolName", direction: "upstream"})` and report the blast radius (direct callers, affected processes, risk level) to the user.
- **MUST run `gitnexus_detect_changes()` before committing** to verify your changes only affect expected symbols and execution flows.
- **MUST warn the user** if impact analysis returns HIGH or CRITICAL risk before proceeding with edits.
- When exploring unfamiliar code, use `gitnexus_query({query: "concept"})` to find execution flows instead of grepping. It returns process-grouped results ranked by relevance.
- When you need full context on a specific symbol — callers, callees, which execution flows it participates in — use `gitnexus_context({name: "symbolName"})`.

## Never Do

- NEVER edit a function, class, or method without first running `gitnexus_impact` on it.
- NEVER ignore HIGH or CRITICAL risk warnings from impact analysis.
- NEVER rename symbols with find-and-replace — use `gitnexus_rename` which understands the call graph.
- NEVER commit changes without running `gitnexus_detect_changes()` to check affected scope.

## Resources

| Resource | Use for |
|----------|---------|
| `gitnexus://repo/monorepo-micro/context` | Codebase overview, check index freshness |
| `gitnexus://repo/monorepo-micro/clusters` | All functional areas |
| `gitnexus://repo/monorepo-micro/processes` | All execution flows |
| `gitnexus://repo/monorepo-micro/process/{name}` | Step-by-step execution trace |

## CLI

| Task | Read this skill file |
|------|---------------------|
| Understand architecture / "How does X work?" | `.claude/skills/gitnexus/gitnexus-exploring/SKILL.md` |
| Blast radius / "What breaks if I change X?" | `.claude/skills/gitnexus/gitnexus-impact-analysis/SKILL.md` |
| Trace bugs / "Why is X failing?" | `.claude/skills/gitnexus/gitnexus-debugging/SKILL.md` |
| Rename / extract / split / refactor | `.claude/skills/gitnexus/gitnexus-refactoring/SKILL.md` |
| Tools, resources, schema reference | `.claude/skills/gitnexus/gitnexus-guide/SKILL.md` |
| Index, status, clean, wiki CLI commands | `.claude/skills/gitnexus/gitnexus-cli/SKILL.md` |

<!-- gitnexus:end -->
