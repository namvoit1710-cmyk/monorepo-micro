# LDC Table

A robust, scalable, and highly performant Headless/Compound Table component using `@tanstack/react-table` and `@tanstack/react-virtual`.

This architecture follows "Pro React Patterns" such as **Custom Hooks for State Engine**, **Context Provider Pattern**, and **Dispatcher Pattern** to separate logic from UI, making the table extremely maintainable and scalable for future features.

---

## 🏗️ Architecture & Core Patterns

1. **Headless State Engine (`hooks/use-table-engine.ts`)**: Separates all complex data-processing, configuration, and state management of TanStack Table from the visual layer.
2. **Context Provider Pattern (`context/`)**: Distributes the table instance and virtualizer logic down the component tree without prop-drilling.
3. **Dispatcher Pattern (`components/table-*.tsx`)**: Components like `TableHeader` and `TableContent` act as dispatchers, delegating rendering to either `Standard` or `Virtualized` implementations based on the context configuration.
4. **Pluggable Renderers (`components/renderers/`)**: Reusable UI atoms for cells and headers that can be dynamically injected into the table config (e.g. selection checkboxes, sorting arrows).

---

## 🗂️ Folder Structure

```text
ldc-table/
├── components/                       # UI Components layer
│   ├── renderers/                    # Pluggable UI atoms for Cells/Headers
│   │   ├── checkbox-cell.tsx
│   │   ├── checkbox-header.tsx
│   │   ├── selection-column.tsx
│   │   └── sortable-header.tsx
│   ├── standard/                     # Standard DOM rendering implementations
│   │   ├── standard-content.tsx
│   │   └── standard-header.tsx
│   ├── virtualized/                 # Virtualized rendering implementations
│   │   ├── virtualized-content.tsx
│   │   └── virtualized-header.tsx
│   ├── table-body.tsx               # Flat layout components
│   ├── table-col-group.tsx
│   ├── table-content.tsx            # Dispatcher for Content (Standard vs Virtualized)
│   ├── table-empty.tsx
│   ├── table-header.tsx             # Dispatcher for Header (Standard vs Virtualized)
│   ├── table-pagination.tsx
│   └── table-viewport.tsx           # Main Scroll Container & Table Coordinator
├── context/
│   ├── table-provider.tsx           # Table Context Provider & Engine Instantiation
│   └── virtualized-provider.tsx     # Virtualizer Context Provider
├── hooks/
│   ├── use-table-engine.ts          # Core TanStack useReactTable logic wrapper
│   └── use-table-virtualizer.ts     # Core TanStack Virtual configuration
├── utils/
│   └── helpers.ts                   # Pure functions (Pagination math, Pinning styles)
├── data-table.tsx                   # Public Entry Point
├── index.ts                         # Public Exports
├── README.md                        # Documentation
└── types.ts                         # Type definitions
```

---

## 🚀 Public API & Usage

### Basic Usage (Standard Table)

```tsx
import { DataTable, IDataTableProps } from "@common/components/ldc-table";

export default function MyTable(props: IDataTableProps<MyType>) {
    return (
        <DataTable
            data={data}
            columns={columns}
            enablePagination
            // other props...
        />
    );
}
```

### Advanced Usage (Virtualized Table)

Virtualization is automatically handled by the internal dispatchers when you enable it.

```tsx
<DataTable
    data={massiveData}
    columns={manyColumns}
    enableVirtualization={true}
/>
```

### Column Visibility

You can easily toggle column visibility by passing the `columnVisibility` prop.

```tsx
const [columnVisibilities, setColumnVisibilities] =
    React.useState<VisibilityState>({});

<DataTable
    data={data}
    columns={columns}
    columnVisibility={columnVisibilities}
/>;
```

### Composition & Customization

The system exports all sub-components via `index.ts`. While `DataTable` provides a convenient ready-to-use wrapper, you can completely customize the internal layout by using the exported components directly:

```tsx
import {
    TableProvider,
    TableViewPort,
    TablePagination
    // ...
} from "@common/components/ldc-table";

function CustomTableLayout({ data, columns, options }) {
    return (
        <TableProvider data={data} columns={columns} {...options}>
            <div className="my-custom-layout">
                <TableViewPort />
                <div className="custom-footer">
                    <TablePagination />
                </div>
            </div>
        </TableProvider>
    );
}
```

---

## 🧠 Module Details

### `hooks/use-table-engine.ts`

The brain of the table. Resolves the final columns (e.g. injecting the selection checkbox column dynamically), establishes column pinning, normalizes TanStack's updater patterns, and instantiates `useReactTable()`.

### `hooks/use-table-virtualizer.ts`

The "physics engine" of the table. Instantiates the TanStack `useVirtualizer()` hooks for both rows and columns. Calculates total heights/widths and coordinate items (`translateX/Y`) based on scroll position.

### Dispatcher Components (`table-content.tsx` & `table-header.tsx`)

These components do not render UI directly. They read the `enableVirtualization` flag from Context and return either `<Standard* />` or `<Virtualized* />`.

### Virtualized Implementations (`components/virtualized/`)

Uses the CSS `transform` (specifically `translateX` and viewport offsets) mapped against the calculations generated by `use-table-virtualizer.ts` to seamlessly render ultra-large datasets without jank or natively scrolling the parent horizontally and breaking the structural `<table>` layout.
