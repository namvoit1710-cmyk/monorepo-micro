# Rete.js

**Version:** `rete@2.0.6` + plugins
**Internal package:** `@ldc/workflow-editor`

Rete.js is a framework for creating **visual node-based editors** in the browser. LDC uses Rete.js v2 to build `@ldc/workflow-editor` — a drag-and-drop interface for creating and running AI workflows.

---

## Why Rete.js?

LDC needs an editor where users can drag and drop nodes (AI processing steps) and connect them with edges to create automated workflows. Rete.js v2 is a specialized framework for this type of UI, with a complete plugin ecosystem and official React renderer support.

---

## Plugin Stack in `@ldc/workflow-editor`

```json
"rete": "2.0.6",
"rete-area-plugin": "2.1.5",          // Canvas viewport (zoom, pan)
"rete-auto-arrange-plugin": "2.0.2",  // Auto-arrange nodes by layout
"rete-connection-path-plugin": "2.0.4", // Custom connection paths
"rete-connection-plugin": "2.0.5",    // Drag to connect nodes
"rete-context-menu-plugin": "2.0.6",  // Right-click context menu
"rete-history-plugin": "2.1.1",       // Undo / Redo
"rete-react-plugin": "2.1.0"          // Render nodes with React components
```

---

## Advantages

**Plugin-based:** Each feature is an independent plugin. Use only what you need, don't load what you don't.

**React renderer:** `rete-react-plugin` allows rendering all Node UI with regular React components — leverage the entire React ecosystem.

**Event-driven:** All interactions (node added, connection created, node translated) are events that can be intercepted via `editor.addPipe()`.

**Extensible:** `BaseNode` class can be extended with custom properties like `executionStatus`.

**Facade pattern:** `@ldc/workflow-editor` wraps the entire Rete API into `IEditorInstance` — consumers don't need to know Rete internals.

## Disadvantages

**Thin documentation:** Rete.js v2 has fewer tutorials and examples compared to alternatives. Many things require reading source code.

**Breaking changes v1→v2:** API completely changed from v1. v1 code is incompatible.

**Less popular:** Smaller community than React Flow, fewer Stack Overflow answers.

**Complex React rendering in canvas:** Requires handling event isolation (pointer/dblclick not conflicting with Area zooming).

---

## `@ldc/workflow-editor` Architecture

```
packages/workflow-editor/src/
├── components/
│   └── rete-editor/
│       ├── core/
│       │   ├── editor.ts      # Facade — IEditorInstance API
│       │   └── plugins.tsx    # Setup all Rete plugins
│       ├── nodes/
│       │   ├── base-node.ts   # Node class with executionStatus
│       │   └── components/    # React UI for each Node type
│       ├── operations/        # Separated domain logic
│       │   ├── nodes-operation.ts
│       │   ├── connection-operation.ts
│       │   ├── serialization.ts
│       │   └── view-operation.ts
│       └── connections/       # Custom connection rendering
└── hooks/
    ├── use-editor-setup.ts    # Initialize editor from JSON data
    └── use-editor-sync.ts     # Debounce sync → onChange callback
```

**Facade pattern:** `editor.ts` exports `IEditorInstance` — a flat interface that hides all Rete complexity.

---

## Usage

### In React Component

```tsx
import { WorkflowEditor } from "@ldc/workflow-editor";
import type { WorkflowEditorHandle, IEditorValue } from "@ldc/workflow-editor";
import { useRef } from "react";

function WorkflowPage() {
  const editorRef = useRef<WorkflowEditorHandle>(null);

  // Control editor from outside via ref
  const handleRun = (nodeId: string) => {
    editorRef.current?.setNodeStatus(nodeId, "executing");

    // After API response:
    editorRef.current?.setNodeStatus(nodeId, "completed");
    // or "failed"
  };

  return (
    <WorkflowEditor
      ref={editorRef}
      value={workflowData}
      onChange={(newValue: IEditorValue) => {
        saveWorkflow(newValue);  // Debounced 300ms
      }}
      onExecuteNode={(nodeId) => {
        handleRun(nodeId);
      }}
      readOnly={false}
    />
  );
}
```

### Read-only Mode (Execution History)

```tsx
<WorkflowEditor
  value={completedWorkflowData}
  readOnly={true}   // Lock DnD, context menu, connections
/>
```

---

## Data Flow

```
1. Load:  App passes IEditorValue JSON
             → useEditorSetup → initialLoadNodes()
             → Rete renders nodes/connections

2. Edit:  User drags/drops/connects
             → Rete emits events
             → useEditorSync captures events
             → Debounce 300ms
             → onChange(serializeNodes()) → App saves

3. Run:   User right-click → "Execute"
             → onExecuteNode(nodeId)
             → App calls backend API
             → editorRef.current.setNodeStatus(id, "executing")
             → Node displays loading spinner
             → editorRef.current.setNodeStatus(id, "completed")
```

---

## Custom Connection Path

```tsx
// Magnetic connection: wire "snaps" to nearest socket when dragging
// Line connection: SVG path with Delete button in the middle
// Selectable connection: click to select connection
```

---

## Comparison with Similar Libraries

| Criteria | **Rete.js v2** | React Flow | Nodered | Blockly |
|---|---|---|---|---|
| React support | ✅ Plugin | ✅ Built-in | ❌ | ⚠️ |
| Headless | ✅ | ✅ | ❌ | ❌ |
| Plugin ecosystem | ✅ MF/History/Context | ⚠️ Less | ✅ Large (server) | ✅ |
| Community | 🔶 Small | ✅ Large | ✅ Large | ✅ |
| Documentation | 🔶 Medium | ✅ Good | ✅ Good | ✅ |
| Custom node UI | ✅ React component | ✅ | ⚠️ Template | ⚠️ |
| Undo/Redo | ✅ Plugin | ⚠️ Manual | ❌ | ❌ |
| TypeScript | ✅ | ✅ | ⚠️ | ⚠️ |
| **Use when** | React + extensible | Simple flow diagram | Server workflows | Block programming |

> **Conclusion:** React Flow has a larger community and is easier to get started with. Rete.js is better suited when you need flexible plugin architecture (custom connection paths, history, auto-arrange) and fully React-rendered Node UI. With LDC, Rete.js is well wrapped in `@ldc/workflow-editor` so developers don't need to know Rete internals.
