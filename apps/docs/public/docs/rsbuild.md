# Rsbuild

**Version:** `@rsbuild/core@^1.7.5` · `@rsbuild/plugin-react@^1.4.6` · `@module-federation/rsbuild-plugin@^2.3.1`

Rsbuild is the primary build tool for the entire LDC Frontend system, used for all apps (`shell`, `dashboard`, ...). Built on **Rspack** — a bundler written in Rust, API-compatible with Webpack but 5–10x faster.

---

## Why Rsbuild?

LDC requires Module Federation v2 for its micro frontend architecture. Vite doesn't have stable official MF support. Rsbuild provides `@module-federation/rsbuild-plugin` maintained by the same MF team, ensuring the highest compatibility.

---

## Advantages

**Fast build speed:** Rspack is written in Rust, with cold start and rebuild 5–10x faster than Webpack. Dev server starts in seconds.

**Official Module Federation v2:** The `@module-federation/rsbuild-plugin` supports full manifest-based remote loading, type sharing, and runtime plugins.

**Webpack ecosystem compatible:** Most Webpack loaders and plugins work. No rewrite needed when migrating from Webpack.

**Cleaner API than Webpack:** `defineConfig` is clean with less boilerplate compared to `webpack.config.js`.

**Good PostCSS integration:** Configure `@tailwindcss/postcss` directly via `tools.postcss`.

## Disadvantages

**Smaller ecosystem than Vite:** Fewer plugins available, some Vite plugins don't have equivalents.

**Documentation still evolving:** Some edge cases aren't documented. Need to read source or issue tracker for rare errors.

**Less popular:** New developers need extra learning time as online tutorials mainly target Vite/Webpack.

---

## Usage in the Project

### Shell App (Host)

```ts
// apps/shell/rsbuild.config.ts
export default defineConfig({
  source: {
    define: publicVars,          // Inject env vars into bundle
    entry: { index: "./src/main.tsx" },
  },
  plugins: [
    pluginReact(),
    pluginModuleFederation({
      name: "shell",
      remotes: {
        dashboard: "dashboard@http://localhost:3001/mf-manifest.json",
      },
      shared: {
        react: { singleton: true, eager: true, requiredVersion: "^18" },
        "react-dom": { singleton: true, eager: true, requiredVersion: "^18" },
        "react-router-dom": { singleton: true, eager: true },
        "i18next": { singleton: true, eager: true },
        "react-i18next": { singleton: true, eager: true },
      },
    }),
  ],
  tools: {
    postcss: { postcssOptions: { plugins: [require("@tailwindcss/postcss")] } },
  },
  resolve: { alias: { "@": "./src" } },
  server: { port: 3000 },
});
```

### Dashboard (Remote — Expose Component)

```ts
// apps/dashboard/rsbuild.config.ts
pluginModuleFederation({
  name: "dashboard",
  exposes: { "./remote-dashboard": "./src/pages/home" },
  shared: {
    react: { singleton: true, eager: true, requiredVersion: "^18" },
    // requiredVersion: false for i18n to avoid version mismatch
    "react-i18next": { singleton: true, eager: true, requiredVersion: false },
    "i18next":       { singleton: true, eager: true, requiredVersion: false },
  },
}),
```

> ⚠️ **Important:** `singleton: true` is required for React/React Router. Missing it → each remote has its own React instance → hooks/context don't work across remotes.
>
> `eager: true` is needed for the shell to avoid "Shared module is not available for eager consumption" error.

---

## Common Commands

```bash
rsbuild dev       # Dev server + HMR
rsbuild build     # Build production
rsbuild preview   # Preview build
```

---

## Comparison with Similar Tools

| Criteria | **Rsbuild** | Vite | Webpack 5 | Turbopack |
|---|---|---|---|---|
| Dev speed | ⚡ Very fast (Rust) | ⚡ Fast (esbuild) | 🐢 Slow | ⚡⚡ Fastest |
| Module Federation | ✅ Official | ⚠️ Not stable | ✅ Native | ❌ None |
| Plugin ecosystem | 🔶 Evolving | ✅ Largest | ✅ Large | 🔶 New |
| Config API | ✅ Simple | ✅ Simple | ⚠️ Complex | N/A |
| Production stability | ✅ Stable | ✅ Very stable | ✅ Standard | 🔶 Beta |
| **Use when** | MF + speed | SPA / library | Plugin-heavy | Next.js |

> **Conclusion for LDC:** Module Federation + high speed → Rsbuild is the optimal choice. Without MF, Vite would be more popular.
