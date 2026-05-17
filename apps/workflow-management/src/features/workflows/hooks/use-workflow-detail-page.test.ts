/* @vitest-environment jsdom */
import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useEditorStore } from "../stores/editor-stores";

const { useWorkflowByIdMock, usePrefetchQueryMock } = vi.hoisted(() => ({
  useWorkflowByIdMock: vi.fn(),
  usePrefetchQueryMock: vi.fn(),
}));

vi.mock("@tanstack/react-query", () => ({
  usePrefetchQuery: usePrefetchQueryMock,
}));

vi.mock("./apis/node-pallete", () => ({
  queryNodePalleteOptions: () => ({ queryKey: ["node-pallete"] }),
}));

vi.mock("./apis/workflows", () => ({
  useWorkflowById: (...args: unknown[]) => useWorkflowByIdMock(...args),
}));

import { useWorkflowDetail } from "./use-workflow-detail-page";

beforeEach(() => {
  useEditorStore.getState().resetEditorStore();
  useWorkflowByIdMock.mockReset();
  usePrefetchQueryMock.mockReset();
});

describe("useWorkflowDetail", () => {
  it("syncs workflow response into editor store", async () => {
    useWorkflowByIdMock.mockReturnValue({
      data: {
        ok: true,
        data: {
          id: "wf-1",
          name: "Workflow 1",
          description: "Workflow desc",
          status: "DRAFT",
          nodes: [
            {
              id: "node-1",
              name: "Node 1",
              type: "TASK",
              ports: { in: [], out: [] },
            },
          ],
          edges: [],
        },
      },
      isLoading: false,
    });

    const { result } = renderHook(() => useWorkflowDetail("wf-1"));

    await act(async () => {});

    expect(result.current.isLoading).toBe(false);
    expect(result.current.workflow?.id).toBe("wf-1");
    expect(usePrefetchQueryMock).toHaveBeenCalled();
    expect(useEditorStore.getState().workflowInfo?.name).toBe("Workflow 1");
    expect(useEditorStore.getState().workflowData.nodes).toHaveLength(1);
    expect(useEditorStore.getState().workflowData.connections).toHaveLength(0);
  });

  it("resets editor store when unmounted", async () => {
    useWorkflowByIdMock.mockReturnValue({
      data: undefined,
      isLoading: false,
    });

    const { unmount } = renderHook(() => useWorkflowDetail("wf-2"));

    await act(async () => {});

    useEditorStore.setState({
      workflowInfo: {
        id: "wf-x",
        name: "Temp",
        status: "DRAFT",
        nodes: [],
        edges: [],
      },
      workflowData: { nodes: [], connections: [] },
    });

    act(() => {
      unmount();
    });

    expect(useEditorStore.getState().workflowInfo).toBeNull();
    expect(useEditorStore.getState().workflowData).toEqual({ nodes: [], connections: [] });
  });
});