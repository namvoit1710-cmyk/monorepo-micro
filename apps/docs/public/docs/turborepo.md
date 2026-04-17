# Turborepo

**Version:** `turbo@^2.9.4`

Turborepo is the build system orchestration layer for the LDC monorepo. It does not build code itself — it coordinates task execution order, caches results, and maximises parallelism to cut CI/CD times.

---

## Why Turborepo?

In a monorepo with many apps and packages, running `bun run build` at the root without any coordination can cause the `shell` app to build before `@ldc/ui` is ready — resulting in errors. Turborepo solves this by building a dependency graph: it knows which package depends on which, and runs tasks in the correct order.

---

## Pros

**Remote caching:** Build results are cached by content hash. If the source has not changed, the task is skipped entirely — CI runs after the first are nearly instant.

**Smart parallel execution:** Tasks with no mutual dependencies run in parallel across all available CPU cores.

**Incremental builds:** Only packages that have actually changed are rebuilt. The entire monorepo is never rebuilt unnecessarily.

**Dependency-aware ordering:** `dependsOn: ["^build"]` guarantees that upstream packages are built before the current one.

**Terminal UI:** `"ui": "tui"` in `turbo.json` enables a clear, interactive terminal dashboard during watch mode.

## Cons

**Learning curve:** You need a solid understanding of `dependsOn`, `inputs`, and `outputs` to configure correctly. Mistakes lead to constant cache misses or stale output.

**Harder to debug:** When a task fails because of a stale cache, debugging is more involved than running the command directly.

**Remote cache requires a server:** Sharing cache between developers requires Vercel or a self-hosted cache server.

**Not a build tool:** Turborepo only orchestrates — it does not replace Rsbuild, Vite, or tsc.

---

## Configuration in this project

```json
// turbo.json
{
  "$schema": "https://turborepo.com/schema.json",
  "ui": "tui",
  "tasks": {
    "topo": {
      "dependsOn": ["^topo"]          // Topology check — verifies dep graph integrity
    },
    "build": {
      "cache": true,
      "dependsOn": ["^build"],        // Build upstream packages first
      "inputs": ["src/**", "package.json", "rsbuild.config.ts"],
      "outputs": [".cache/tsbuildinfo.json", "dist/**"]
    },
    "dev": {
      "cache": false,                 // Never cache dev servers
      "persistent": true,             // Long-running process — do not wait for exit
      "dependsOn": ["^build"]         // Packages must be built before the app dev server starts
    },
    "lint": {
      "dependsOn": ["^topo", "^build"],
      "outputs": [".cache/.eslintcache"]
    },
    "typecheck": {
      "dependsOn": ["^topo", "^build"],
      "outputs": [".cache/tsbuildinfo.json"]
    },
    "format": {
      "outputs": [".cache/.prettiercache"],
      "outputLogs": "new-only"
    },
    "clean": { "cache": false }       // Clean is never cached
  }
}
```

---

## Daily usage

```bash
# Run all apps and packages in watch mode
turbo watch dev --continue

# Build the entire monorepo
turbo run build

# Build only one specific app (and its dependencies)
turbo build -F @ldc/shell

# Typecheck everything
turbo run typecheck

# Lint and auto-fix everything
turbo run lint --continue -- --fix --cache --cache-location .cache/.eslintcache

# Visualise the task dependency graph
turbo run build --graph
```

---

## Understanding `dependsOn`

```
"^build"   → build all upstream packages first (recursive)
"^topo"    → verify topology only (no build, faster)
"build"    → build within the same package (not upstream)
```

**Example execution flow:**

```
@ldc/ui (build) ──▶ @ldc/autoform (build) ──▶ @ldc/dashboard (build)
                                           └──▶ @ldc/shell (build)
```

Turborepo runs `@ldc/ui` first, then `@ldc/autoform`, `@ldc/dashboard`, and `@ldc/shell` in parallel.

---

## LDC pipeline scripts

```bash
bun run dev        = turbo watch dev --continue
bun run dev:shell  = turbo watch dev -F @ldc/shell
bun run build      = turbo run build
bun run typecheck  = turbo run typecheck
bun run lint       = turbo run lint --continue
```

---

## Comparison with alternatives

| Criterion | **Turborepo** | Nx | Lerna | Rush |
|---|---|---|---|---|
| Setup | ✅ Simple | ⚠️ Complex | ✅ Simple | ⚠️ Complex |
| Remote caching | ✅ Built-in | ✅ Built-in | ❌ | ✅ |
| Task graph | ✅ JSON config | ✅ project.json | ⚠️ Basic | ✅ |
| Incremental build | ✅ | ✅ | ❌ | ✅ |
| Bun integration | ✅ Good | ⚠️ | ✅ | ⚠️ |
| Code generation | ✅ `turbo gen` | ✅ More powerful | ❌ | ✅ |
| Learning curve | ✅ Low | 🔶 High | ✅ Low | 🔶 High |
| **Best for** | Simple to medium monorepos | Enterprise, plugin systems | Legacy | Enterprise JS |

> **Conclusion:** Turborepo is the right fit for LDC thanks to its simple configuration, excellent Bun workspace integration, and built-in `turbo gen` for scaffolding new apps and packages.
