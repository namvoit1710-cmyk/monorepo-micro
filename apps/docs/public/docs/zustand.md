# Zustand

**Version:** `zustand` (declared via workspace catalog)

Zustand is the global **client state** management library in LDC. One important rule: Zustand is only used for pure client state (UI preferences, theme, sidebar) — **never for server data** (that is the responsibility of TanStack Query).

---

## Why Zustand?

LDC needs a lightweight solution for global client state such as sidebar open/close and theme preference. Redux is too heavy for these needs. Zustand provides an extremely simple API with no Provider wrapping required.

---

## Pros

**Minimal API:** `create()` is all you need to know. No Actions, Reducers, or Sagas like Redux.

**No Provider required:** A store is globally available the moment it is created — no need to wrap the app in `<Provider>`.

**Selector subscriptions:** `useStore(state => state.count)` only re-renders when `count` changes — not the entire store.

**Tiny footprint:** ~1kb minified. No meaningful impact on bundle size.

**Middleware:** `devtools`, `persist` (localStorage), `immer` (mutable syntax) — all opt-in.

**Good TypeScript support:** Generic types, no decorators or classes needed.

## Cons

**Too simple for complex state:** Lacks built-in patterns for complex scenarios (normalised data, undo/redo, time-travel debugging).

**No opinionated structure:** Easy to misuse — developers may put server data into Zustand instead of using TanStack Query.

**DevTools need config:** Requires the `devtools` middleware to appear in the Redux DevTools Extension.

**Not suitable for server state:** Zustand has no caching, background refetch, or stale management.

---

## Usage patterns

### Basic store (UI state)

```ts
import { create } from "zustand";

interface AppState {
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
}

export const useAppStore = create<AppState>((set) => ({
  sidebarOpen: true,
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
}));

// In a component — only re-renders when sidebarOpen changes
const sidebarOpen = useAppStore((state) => state.sidebarOpen);
const toggleSidebar = useAppStore((state) => state.toggleSidebar);
```

### Store with devtools + persist

```ts
import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";

interface ThemeState {
  theme: "light" | "dark" | "system";
  setTheme: (theme: ThemeState["theme"]) => void;
}

export const useThemeStore = create<ThemeState>()(
  devtools(
    persist(
      (set) => ({
        theme: "system",
        setTheme: (theme) => set({ theme }),
      }),
      { name: "ldc-theme" }  // localStorage key
    ),
    { name: "ThemeStore" }   // DevTools label
  )
);
```

### Slice pattern (splitting a large store)

```ts
// store/slices/auth-slice.ts
interface AuthSlice {
  user: User | null;
  token: string | null;
  setAuth: (user: User, token: string) => void;
  clearAuth: () => void;
}

export const createAuthSlice = (set) => ({
  user: null,
  token: null,
  setAuth: (user, token) => set({ user, token }),
  clearAuth: () => set({ user: null, token: null }),
});

// store/index.ts
type StoreState = AuthSlice & UISlice;

export const useStore = create<StoreState>()((...args) => ({
  ...createAuthSlice(...args),
  ...createUISlice(...args),
}));

// Named selector exports to avoid anonymous functions on every render
export const useUser = () => useStore((s) => s.user);
export const useToken = () => useStore((s) => s.token);
```

---

## Rules for using Zustand in LDC

```
✅ Use Zustand for:
  - Sidebar open / close
  - Theme preference (light / dark)
  - User preferences (locale, density)
  - Temporary UI state that needs global access
  - Auth token after login (no refresh needed)

❌ Do NOT use Zustand for:
  - Data from the API          → TanStack Query
  - Form state                 → React Hook Form
  - Per-component UI state     → useState
  - Derived / computed data    → useMemo
```

---

## Comparison with alternatives

| Criterion | **Zustand** | Redux Toolkit | Jotai | Valtio | Context API |
|---|---|---|---|---|---|
| Bundle size | ✅ ~1kb | 🔶 ~15kb | ✅ ~3kb | ✅ ~3kb | ✅ 0 |
| Boilerplate | ✅ Minimal | 🔶 Medium | ✅ Minimal | ✅ Minimal | ⚠️ Re-renders |
| TypeScript | ✅ Good | ✅ Good | ✅ Good | ⚠️ Proxy magic | ✅ |
| DevTools | ✅ Redux DevTools | ✅ Best-in-class | ✅ Jotai DevTools | ⚠️ | ❌ |
| Selector perf | ✅ Good | ✅ | ✅ Atomic | ✅ | ❌ Excess re-renders |
| Persistence | ✅ Middleware | ✅ | ✅ atomWithStorage | ⚠️ | ❌ |
| Learning curve | ✅ Low | 🔶 High | ✅ Low | ✅ Low | ✅ Low |
| **Best for** | Global UI state | Complex apps | Atomic / granular state | Mutable-style syntax | Simple shared state |

> **Conclusion:** Zustand is the right choice for LDC because the client state surface is small. Jotai is a strong alternative if you need atomic state (each atom is isolated). Redux Toolkit is only worth the overhead when state logic is genuinely complex with many derived values and side effects.
