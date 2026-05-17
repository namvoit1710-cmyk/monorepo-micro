import { beforeEach, describe, expect, it } from "vitest";
import { useEditorStore } from "./editor-stores";

describe("useEditorStore", () => {
  beforeEach(() => {
    useEditorStore.getState().resetEditorStore();
  });

  it("starts with empty editor state", () => {
    const state = useEditorStore.getState();

    expect(state.workflowInfo).toBeNull();
    expect(state.selectedNode).toBeNull();
    expect(state.localExecution).toBeNull();
    expect(state.predecessorNodes).toEqual([]);
    expect(state.outgoerNodes).toEqual([]);
    expect(state.incomerNodes).toEqual([]);
    expect(state.workflowData).toEqual({ nodes: [], connections: [] });
    expect(state.nodeExecutionMap).toEqual({});
  });

  it("updates workflow data, selection, and connections", () => {
    useEditorStore.getState().setWorkflowInfo({
      id: "wf-1",
      name: "Workflow 1",
      status: "DRAFT",
      nodes: [],
      edges: [],
    } as any);

    useEditorStore.getState().setSelectedNode({ id: "node-1" } as any);
    useEditorStore.getState().setPredecessorNodes([{ id: "pre-1" } as any]);
    useEditorStore.getState().setOutgoerNodes([{ id: "out-1" } as any]);
    useEditorStore.getState().setIncomerNodes([{ id: "in-1" } as any]);
    useEditorStore.getState().setWorkflowData({ nodes: [], connections: [] });
    useEditorStore.getState().setWorkflowConnections([
      { id: "conn-1", source: "node-1", target: "node-2", sourceOutput: "out", targetInput: "in" },
    ] as any);

    const state = useEditorStore.getState();

    expect(state.workflowInfo?.id).toBe("wf-1");
    expect(state.selectedNode?.id).toBe("node-1");
    expect(state.predecessorNodes[0]?.id).toBe("pre-1");
    expect(state.outgoerNodes[0]?.id).toBe("out-1");
    expect(state.incomerNodes[0]?.id).toBe("in-1");
    expect(state.workflowData.connections).toHaveLength(1);
  });

  it("tracks node execution and local execution state", () => {
    useEditorStore.getState().setNodeExecution("node-1", {
      status: "executing",
      cacheKey: "cache-1",
      timestamp: 10,
    } as any);
    useEditorStore.getState().setLocalExecution({ type: "node", nodeId: "node-1" });

    expect(useEditorStore.getState().nodeExecutionMap["node-1"]).toEqual({
      status: "executing",
      cacheKey: "cache-1",
      timestamp: 10,
    });
    expect(useEditorStore.getState().localExecution).toEqual({ type: "node", nodeId: "node-1" });

    useEditorStore.getState().resetNodeExecution("node-1");
    expect(useEditorStore.getState().nodeExecutionMap["node-1"]).toBeUndefined();

    useEditorStore.getState().setNodeExecution("node-2", { status: "failed" } as any);
    useEditorStore.getState().resetAllNodeExecutions();
    expect(useEditorStore.getState().nodeExecutionMap).toEqual({});
  });

  it("resets editor store to initial state", () => {
    useEditorStore.getState().setWorkflowInfo({
      id: "wf-2",
      name: "Workflow 2",
      status: "DRAFT",
      nodes: [],
      edges: [],
    } as any);

    useEditorStore.getState().resetEditorStore();

    expect(useEditorStore.getState().workflowInfo).toBeNull();
    expect(useEditorStore.getState().nodeExecutionMap).toEqual({});
  });
});