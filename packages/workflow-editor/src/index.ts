// ─── Main Component ───────────────────────────────────────────────────────────
export { default as WorkflowEditor } from "./components/workflow-editor/workflow-editor";
export type { WorkflowEditorHandle } from "./components/workflow-editor/workflow-editor";

// ─── Rete Editor Core ─────────────────────────────────────────────────────────
export { createEditor, makeCreateEditor } from "./components/rete-editor/core/editor";
export { BaseNode } from "./components/rete-editor/nodes/base-node";
export { ObjectControl } from "./components/rete-editor/nodes/object-control";
export { socket } from "./components/rete-editor/nodes/socket";
export { default as DynamicNodeIcon } from "./components/rete-editor/nodes/components/dynamic-node-icon";
export { default as LoadingSpin } from "./components/rete-editor/nodes/components/loading-spin/loading-spin";

// ─── i18n ─────────────────────────────────────────────────────────────────────
export { addReteEditorResources } from "./i18n";

// ─── Types ────────────────────────────────────────────────────────────────────
export type {
    AreaExtra,
    Connection,
    EditorConfig,
    EditorDirection, IEditorConnectionValue,
    IEditorInstance,
    IEditorNode, IEditorNodeValue, IEditorValue,
    NodeExecutionStatus,
    NodePort,
    NodePortConfig,
    NodeSizeConfig, Schemes
} from "./components/rete-editor/types";

