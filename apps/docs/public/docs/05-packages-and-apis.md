# Packages & APIs

This page documents all internal packages currently available in the system, their public APIs, and packages planned for future development.

---

## Currently Available

### `@ldc/ui`

**Design system and component library.** All UI components are built on shadcn/ui + Radix UI with Tailwind CSS v4.

**Usage:**
```ts
import { Button, Input, Dialog, DataTable } from "@ldc/ui";
```

**Key exports:**
- Form controls: `Button`, `Input`, `Select`, `Checkbox`, `Switch`, `Textarea`
- Layout: `Card`, `Sheet`, `Dialog`, `Drawer`, `Tabs`, `Separator`
- Feedback: `Toast`, `Alert`, `Badge`, `Skeleton`, `Progress`
- Navigation: `Breadcrumb`, `DropdownMenu`, `NavigationMenu`, `Tooltip`
- Data display: `Table`, `Avatar`, `Collapsible`, `Accordion`

**Add new shadcn components:**
```bash
bun run ui-add
```

---

### `@ldc/api-sdk`

**Centralized HTTP client** for backend API communication.

**Usage:**
```ts
import { apiClient } from "@ldc/api-sdk";

// GET request
const user = await apiClient.get("/users/123");

// POST request
const result = await apiClient.post("/workflows", payload);
```

Built on `axios` with shared configuration (base URL, auth headers, interceptors).

---

### `@ldc/autoform`

**Auto-generated forms from Zod schemas.** Renders form fields automatically based on schema shape and type.

**Usage:**
```tsx
import { AutoForm } from "@ldc/autoform";
import { z } from "zod";

const schema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  role: z.enum(["admin", "viewer"]),
});

<AutoForm schema={schema} onSubmit={(values) => console.log(values)} />
```

**Supported field types:**
- `string` → `Input`
- `number` → `Input` (type=number)
- `boolean` → `Switch` / `Checkbox`
- `enum` → `Select`
- `object` / `array` → nested forms
- JSON/YAML fields → Monaco Editor (`@monaco-editor/react`)

**Dependencies:** `react-hook-form`, `@hookform/resolvers`, `zod`, `@ldc/ui`, `@ldc/data-table`

---

### `@ldc/data-table`

**Advanced data grid component** with sorting, filtering, pagination, and virtual scrolling.

**Usage:**
```tsx
import { DataTable } from "@ldc/data-table";
import type { ColumnDef } from "@tanstack/react-table";

const columns: ColumnDef<User>[] = [
  { accessorKey: "name", header: "Name" },
  { accessorKey: "email", header: "Email" },
];

<DataTable columns={columns} data={users} />
```

**Features:**
- Column sorting and filtering
- Row selection
- Virtual scrolling for large datasets (`@tanstack/react-virtual`)
- Zod-typed column definitions

---

### `@ldc/workflow-editor`

**Visual node-based workflow editor.** Drag-and-drop interface for building executable workflows.

**Usage:**
```tsx
import { WorkflowEditor } from "@ldc/workflow-editor";
import type { IEditorValue, WorkflowEditorHandle } from "@ldc/workflow-editor";

const editorRef = useRef<WorkflowEditorHandle>(null);

<WorkflowEditor
  ref={editorRef}
  value={workflowData}
  onChange={(newValue) => saveWorkflow(newValue)}
  readOnly={false}
/>
```

**Imperative API via ref:**
```ts
editorRef.current.setNodeStatus("node-1", "executing");
editorRef.current.setNodeStatus("node-1", "completed");
```

**Events:**
- `onChange(value: IEditorValue)` — emitted on every structural change (debounced)
- `onExecuteNode(nodeId: string)` — emitted when user right-clicks and selects "Execute"

**Read-only mode:** Pass `readOnly={true}` to render execution history without editing capability.

---

### `@ldc/i18n`

**Internationalization** wrapper. Provides a configured `i18next` instance shared as a singleton across all Module Federation remotes.

**Usage:**
```ts
import { i18n, useTranslation } from "@ldc/i18n";

// In React components
function MyComponent() {
  const { t } = useTranslation();
  return <p>{t("common.save")}</p>;
}
```

**Adding translations:** Place JSON files in `packages/i18n/locales/{locale}/`.

---

### `@ldc/tanstack-query`

**TanStack Query v5 utilities.** Re-exports configured hooks and a typed query key factory pattern.

**Usage:**
```ts
import { queryClient, createQueryKeyFactory } from "@ldc/tanstack-query";

const userKeys = createQueryKeyFactory("users");
// → { all: ["users"], list: (filters) => ["users", "list", filters], ... }
```

**Exports:**
- `queryClient` — pre-configured `QueryClient`
- `createQueryKeyFactory` — typed key factory helper
- Re-exported TanStack Query hooks: `useQuery`, `useMutation`, `useSuspenseQuery`, etc.

---

### `@ldc/env`

**Environment variable validation.** Parses and validates env vars at startup using Zod. Shared across all apps.

```ts
import { env } from "@ldc/env";
console.log(env.PUBLIC_API_URL);
```

---

## Shell Infrastructure APIs

The `apps/shell/src/infra` layer exposes APIs for micro frontend communication:

### `mfEventBus`

Type-safe cross-remote event bus:

```ts
import { mfEventBus } from "@ldc/shell/infra";

// Emit from shell
mfEventBus.emit("auth:login", { userId: "123", token: "..." });

// Subscribe in remote
mfEventBus.on("auth:login", ({ userId }) => console.log(userId));

// React hook with auto-cleanup
useMFEvent("shell:theme-change", ({ theme }) => applyTheme(theme));
```

**Built-in event types:**

| Event | Payload |
|---|---|
| `auth:login` | `{ userId, token }` |
| `auth:logout` | `{ reason? }` |
| `auth:token-refreshed` | `{ token, expiresAt }` |
| `nav:route-change` | `{ path, remoteName? }` |
| `shell:notification` | `{ type, message }` |
| `shell:theme-change` | `{ theme }` |
| `shell:locale-change` | `{ locale }` |
| `remote:mounted` | `{ remoteName }` |
| `custom:*` | `unknown` |

### `MFAuthProvider` / `useMFAuth`

Propagate auth state from shell to all remotes:

```tsx
// Shell (host)
<MFAuthProvider user={user} token={token} permissions={perms} onLogout={logout}>
  <App />
</MFAuthProvider>

// Remote
const { user, token, isAuthenticated, hasPermission } = useMFAuth();
```

---

## Planned / Coming Soon

> These packages are on the roadmap and are not yet available.

### `@ldc/charts` *(planned)*
Data visualization components built on a charting library (e.g., Recharts or ECharts). Will cover bar, line, pie, and area charts with consistent theming from `@ldc/ui`.

### `@ldc/notifications` *(planned)*
Unified notification center — real-time push notifications, toast management, and a notification history drawer. Will integrate with the MF event bus.

### `@ldc/permissions` *(planned)*
RBAC permission utilities. A `<PermissionGuard>` component and `usePermission()` hook that integrate with `useMFAuth` permissions array.

### `@ldc/file-upload` *(planned)*
Drag-and-drop file uploader with progress tracking, image preview, and multi-file support. Will use `@ldc/ui` for styled UI.

### `@ldc/markdown-editor` *(planned)*
Rich Markdown editor component leveraging `react-markdown` (already in catalog) plus an editing interface.

### `@ldc/analytics` *(planned)*
Analytics event tracking abstraction layer. Will support multiple backends (Mixpanel, Amplitude, custom).

---

## Workspace Catalog (Shared Versions)

All packages share these exact dependency versions via the Bun workspace catalog:

| Package | Version |
|---|---|
| `react` | `19.1.4` |
| `typescript` | `5.9.3` |
| `tailwindcss` | `^4.1.16` |
| `zod` | `4.3.6` |
| `vite` | `7.1.12` |
| `@tanstack/react-query` | `^5.90.20` |
| `@trpc/client` | `^11.7.1` |
| `react-router-dom` | `7.14.0` |
| `axios` | `^1.13.2` |
| `lucide-react` | `^1.7.0` |
| `react-hook-form` | `^7.55.0` |
