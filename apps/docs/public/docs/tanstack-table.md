# TanStack Table

**Version:** `@tanstack/react-table@^8.21.3` · `@tanstack/react-virtual@^3.13.23`
**Internal package:** `@ldc/data-table`

TanStack Table is the headless table engine used inside `@ldc/data-table`. "Headless" means it handles all the logic (sorting, filtering, pagination, selection) but renders no HTML — the UI is built entirely by `@ldc/data-table` on top of `@ldc/ui`.

---

## Why TanStack Table?

LDC needs data tables with sorting, filtering, pagination, row selection, column pinning, and virtual scrolling for large datasets. TanStack Table provides all of this as headless hooks, giving `@ldc/data-table` complete freedom to build UI that matches the team's design system.

---

## Pros

**Fully headless:** 100% UI freedom. Not locked into the style of any UI library.

**Complete type safety:** `ColumnDef<TData>` with TypeScript generics — column definitions are type-checked against the data type.

**Virtual scrolling:** Combined with `@tanstack/react-virtual`, renders thousands of rows with no lag.

**Everything built-in:** Sorting, multi-sort, filtering, global filter, column visibility, column pinning, row selection, pagination — all included.

**Framework agnostic:** Core logic can be used with any framework.

## Cons

**Headless = you build the UI:** You must write all table HTML and styles yourself. There is no out-of-the-box UI like AG Grid or MUI DataGrid.

**Verbose config:** `ColumnDef` arrays can become long, especially with custom cell renderers.

**Complex virtual scrolling:** Combining row and column virtualization requires careful CSS transform calculations (as seen in `@ldc/data-table`).

---

## `@ldc/data-table` architecture

```
@ldc/data-table
├── hooks/
│   ├── use-table-engine.ts       # Wraps useReactTable() — all logic
│   └── use-table-virtualizer.ts  # Wraps useVirtualizer() — row + column virtual
├── context/
│   ├── table-provider.tsx        # Context provider — no prop drilling
│   └── virtualized-provider.tsx  # Virtualizer context
├── components/
│   ├── standard/                 # Normal rendering (< 1000 rows)
│   ├── virtualized/              # CSS transform rendering (> 1000 rows)
│   ├── renderers/                # Atoms: checkbox, sortable header
│   ├── table-content.tsx         # Dispatcher: Standard vs Virtualized
│   └── table-header.tsx          # Dispatcher: Standard vs Virtualized
└── data-table.tsx                # Public entry point
```

**Dispatcher pattern:** `table-content.tsx` reads `enableVirtualization` from context and delegates to `<StandardContent />` or `<VirtualizedContent />`. No if/else needed in the parent component.

---

## Usage

### Basic table

```tsx
import { DataTable } from "@ldc/data-table";
import type { ColumnDef } from "@tanstack/react-table";

interface User { _id: string; name: string; email: string; role: string; }

const columns: ColumnDef<User>[] = [
  {
    accessorKey: "name",
    header: "Name",
    size: 200,
  },
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "role",
    header: "Role",
    cell: ({ row }) => (
      <Badge variant={row.original.role === "admin" ? "default" : "secondary"}>
        {row.original.role}
      </Badge>
    ),
  },
];

<DataTable
  data={users}
  columns={columns}
  enablePagination
  enableSelection
/>
```

### Virtualized table (large datasets)

```tsx
<DataTable
  data={massiveDataset}   // Thousands of rows
  columns={columns}
  enableVirtualization    // → uses CSS transform rendering
/>
```

### Controlled sorting + pagination

```tsx
const [sorting, setSorting] = useState<SortingState>([]);
const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 20 });

<DataTable
  data={data}
  columns={columns}
  sorting={sorting}
  onSortingChange={setSorting}
  pagination={pagination}
  onPaginationChange={setPagination}
  manualPagination       // Server-side pagination
  rowCount={totalRows}
/>
```

### Column visibility

```tsx
const [columnVisibilities, setColumnVisibilities] = useState<VisibilityState>({});

<DataTable
  data={data}
  columns={columns}
  columnVisibility={columnVisibilities}
/>
```

### Composition API (custom layout)

```tsx
import { TableProvider, TableViewPort, TablePagination } from "@ldc/data-table";

<TableProvider data={data} columns={columns} enablePagination>
  <div className="my-custom-layout">
    <MyToolbar />
    <TableViewPort />
    <div className="flex items-center justify-between p-2">
      <ExportButton />
      <TablePagination />
    </div>
  </div>
</TableProvider>
```

---

## How virtual scrolling works

```ts
// packages/data-table/src/hooks/use-table-virtualizer.ts
const rowVirtualizer = useVirtualizer({
  count: rows.length,
  getScrollElement: () => containerRef.current,
  estimateSize: () => 40,       // Estimated row height
  overscan: 5,                  // Render 5 extra rows outside the viewport
  enabled: !!enableVirtualization,
});

const columnVirtualizer = useVirtualizer({
  count: unpinnedColumns.length,
  horizontal: true,
  estimateSize: (i) => unpinnedColumns[i]?.getSize() ?? 150,
  overscan: 5,
  enabled: !!enableVirtualization,
});
```

Instead of rendering all `<tr>` elements, `VirtualizedContent` only renders rows inside the viewport plus the overscan, using CSS `translateY` to position them correctly:

```tsx
{/* Top spacer to maintain correct scroll height */}
<TableRow style={{ height: virtualRows[0]?.start ?? 0 }} />

{virtualRows.map(vr => <TableRow key={vr.index} ... />)}

{/* Bottom spacer */}
<TableRow style={{ height: totalHeight - lastRow?.end ?? 0 }} />
```

---

## Comparison with alternatives

| Criterion | **TanStack Table** | AG Grid | MUI DataGrid | React Table v7 |
|---|---|---|---|---|
| Headless | ✅ Fully | ❌ Pre-styled | ❌ Pre-styled | ✅ |
| Type safety | ✅ Strong | ✅ | ✅ | ⚠️ |
| Virtual scrolling | ✅ (+ react-virtual) | ✅ Built-in | ✅ (Pro) | ❌ |
| Column pinning | ✅ | ✅ | ✅ (Pro) | ❌ |
| Bundle size | ✅ Small (~15kb) | ❌ Very large | 🔶 Medium | ✅ |
| License | ✅ MIT | ⚠️ Community/Enterprise | ✅ MIT / 💰 Pro | ✅ MIT |
| Customization | ✅ Absolute | 🔶 Limited | 🔶 | ✅ |
| **Best for** | Custom design systems | Excel-like grids | MUI ecosystem | Legacy |

> **Conclusion:** TanStack Table + `@ldc/data-table` is the ideal combo when you need a custom design system. AG Grid is more powerful for enterprise Excel-like features but is heavy and charges for advanced features. MUI DataGrid is only a natural fit if you are already using the MUI ecosystem.
