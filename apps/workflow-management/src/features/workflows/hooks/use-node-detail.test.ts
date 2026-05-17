/* @vitest-environment jsdom */
import { renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useEditorStore } from "../stores/editor-stores";
import { useUIPanelStore } from "../stores/ui-panel-stores";

const useGetNodeOutputMock = vi.fn();
const useGetNodeVariableSuggestionsMock = vi.fn();

vi.mock("./apis/workflows", () => ({
  useGetNodeOutput: (...args: unknown[]) => useGetNodeOutputMock(...args),
  useGetNodeVariableSuggestions: (...args: unknown[]) => useGetNodeVariableSuggestionsMock(...args),
}));

import useNodeDetail from "./use-node-detail";

beforeEach(() => {
  useEditorStore.getState().resetEditorStore();
  useUIPanelStore.getState().resetUIPanelStore();
  useGetNodeOutputMock.mockReset();
  useGetNodeVariableSuggestionsMock.mockReset();

  useGetNodeOutputMock.mockReturnValue({
    data: undefined,
    isLoading: false,
  });

  useGetNodeVariableSuggestionsMock.mockReturnValue({
    data: undefined,
    isLoading: false,
    refetch: vi.fn(),
  });
});

describe("useNodeDetail", () => {
  it("returns idle state when nothing selected", () => {
    const { result } = renderHook(() => useNodeDetail());

    expect(result.current.currentNodeId).toBeUndefined();
    expect(result.current.currentNodeStatus).toBe("idle");
    expect(result.current.showOutputSchema).toBe(false);
    expect(result.current.outputArtifacts).toEqual([]);
    expect(result.current.outputSchemaData).toEqual({});
    expect(useGetNodeOutputMock).toHaveBeenCalledWith(
      { nodeId: "", runId: "" },
      expect.objectContaining({ enabled: false })
    );
  });

  it("enables output and variable queries when selected node is completed", () => {
    useEditorStore.setState({
      selectedNode: { id: "node-1" } as any,
      workflowInfo: { id: "wf-1", name: "Workflow", status: "DRAFT", nodes: [], edges: [], test_run_id: "run-1" },
      nodeExecutionMap: {
        "node-1": { status: "completed" },
      },
      workflowData: { nodes: [], connections: [] },
    });
    useUIPanelStore.setState({ isOpenNodesPopup: true });

    useGetNodeOutputMock.mockReturnValue({
      data: {
        data: {
          artifacts: [{ id: "artifact-1" }],
          columns: ["name", "status"],
          preview_rows: [{ name: "Node 1", status: "ok" }],
        },
      },
      isLoading: true,
    });

    useGetNodeVariableSuggestionsMock.mockReturnValue({
      data: {
        data: {
          artifacts: [{ id: "artifact-input" }],
          sources: [{ id: "source-1" }],
        },
      },
      isLoading: true,
      refetch: vi.fn(),
    });

    const { result } = renderHook(() => useNodeDetail());

    expect(result.current.currentNodeId).toBe("node-1");
    expect(result.current.currentNodeStatus).toBe("completed");
    expect(result.current.showOutputSchema).toBe(true);
    expect(result.current.outputArtifacts).toEqual([{ id: "artifact-1" }]);
    expect(result.current.outputSchemaData).toEqual({ name: "Node 1", status: "ok" });
    expect(result.current.artifactInputs).toEqual([{ id: "artifact-input" }]);
    expect(result.current.variablesInputs).toEqual([{ id: "source-1" }]);
    expect(result.current.isLoadingInput).toBe(true);
    expect(result.current.isLoadingOutputSchema).toBe(true);
    expect(useGetNodeOutputMock).toHaveBeenCalledWith(
      { nodeId: "node-1", runId: "run-1" },
      expect.objectContaining({ enabled: true, staleTime: 0 })
    );
  });
});