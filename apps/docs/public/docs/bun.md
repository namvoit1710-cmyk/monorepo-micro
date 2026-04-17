# Bun

**Version:** `bun@1.3.11` (pinned)

Bun is a JavaScript runtime and package manager that replaces Node.js + npm/pnpm in LDC Frontend. It serves as the foundation for all `install`, `run`, and `exec` commands in the monorepo.

---

## Why Bun?

LDC needs a package manager that supports workspaces efficiently, is fast, and has catalog versioning to pin shared versions across the entire monorepo. Bun meets all three criteria while being significantly faster than npm/pnpm during installation.

---

## Advantages

**Extremely fast installs:** Written in Zig, Bun installs dependencies 10–25x faster than npm and 3–5x faster than pnpm.

**Workspace catalog:** Bun supports `catalog` in `package.json` to pin shared versions — all packages in the monorepo use the same versions of React, Zod, TypeScript without manual synchronization.

**Built-in test runner:** `bun test` runs Jest-compatible tests without configuration.

**Native TypeScript:** Run `.ts` files directly without compilation (`bun src/index.ts`).

**npm compatible:** Works with the entire npm registry, with its own lockfile format (`bun.lockb`) that remains compatible.

## Disadvantages

**Exact version pinning required:** `bun@1.3.11` — team members using different versions may encounter lockfile conflicts.

**Not Node.js:** Some Node.js-specific APIs (e.g., certain native addons) are incompatible. Most web tooling works fine.

**Underutilized runtime:** In LDC, Bun is primarily used as a package manager, not as a server runtime. Its runtime capabilities are not heavily leveraged.

**Binary lockfile:** `bun.lockb` is not human-readable when reviewing diffs on GitHub. Must use `bun install --frozen-lockfile` in CI.

---

## Workspace Configuration in the Project

```json
// package.json (root)
{
  "name": "@ldc-fe/root",
  "packageManager": "bun@1.3.11",
  "workspaces": {
    "packages": [
      "apps/*",
      "packages/*",
      "tooling/*"
    ],
    // Catalog: version chung cho toàn monorepo
    "catalog": {
      "typescript": "5.9.3",
      "tailwindcss": "^4.1.16",
      "zod": "4.3.6",
      "vite": "7.1.12",
      "react-router-dom": "7.14.0",
      "@tanstack/react-query": "^5.90.20",
      "lucide-react": "^1.7.0"
    },
    // Catalog theo tag — React 19 riêng
    "catalogs": {
      "react19": {
        "react": "19.1.4",
        "react-dom": "19.1.4",
        "@types/react": "~19.1.0",
        "@types/react-dom": "~19.1.0"
      }
    }
  }
}
```

In individual `package.json` files:

```json
{
  "dependencies": {
    "react": "catalog:react19",    // Use from react19 catalog
    "zod": "catalog:",             // Use from main catalog
    "typescript": "catalog:"
  }
}
```

---

## Daily Usage

```bash
# Install entire monorepo
bun install

# Install frozen (CI/CD)
bun install --frozen-lockfile

# Add dependency to a specific package
bun add axios -w packages/api-sdk

# Run scripts from root
bun run dev
bun run build
bun run typecheck

# Run script in specific workspace
bun run --filter @ldc/shell dev

# Run TypeScript file directly
bun run src/script.ts
```

---

## Version Management with Catalog

When upgrading a dependency used across the monorepo:

```json
// Only edit one place in root package.json
"catalog": {
  "zod": "4.4.0"   // All packages using "catalog:" are updated
}
```

Then run `bun install` to update `bun.lockb`.

---

## Comparison with Other Package Managers

| Criteria | **Bun** | pnpm | npm | Yarn Berry |
|---|---|---|---|---|
| Install speed | ⚡⚡ Fastest | ⚡ Fast | 🐢 Slow | ⚡ Fast |
| Workspace support | ✅ | ✅ Best | ✅ Basic | ✅ |
| Catalog versioning | ✅ Built-in | ⚠️ Not native | ❌ | ⚠️ Resolutions |
| Disk space | ✅ Small | ✅ Small (hard-link) | ❌ Large | ✅ Small |
| Lockfile readable | ❌ Binary | ✅ YAML | ✅ JSON | ✅ YAML |
| Node compat | ⚠️ ~95% | ✅ 100% | ✅ 100% | ✅ 100% |
| **Use when** | Speed + catalog | Monorepo standard | Simple project | Plug'n'Play |

> **Conclusion:** pnpm remains the most popular monorepo standard (used by Nx and many OSS projects). Bun was chosen for LDC due to its installation speed and cleaner catalog feature. If Node compatibility issues arise, pnpm is a safe fallback.
