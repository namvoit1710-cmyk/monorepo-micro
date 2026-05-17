/* @vitest-environment jsdom */
import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { useEditorStore } from "../stores/editor-stores";
import useSelectNode from "./use-select-node";

beforeEach(() => {
  useEditorStore.getState().resetEditorStore();
});

describe("useSelectNode", () => {
  it("updates selected node and related node lists", () => {
    const editorRef = {
      current: {
        getPredecessorNodes: (nodeId: string) => [{ id: `${nodeId}-pre` }] as any,
        getIncomerNodes: (nodeId: string) => [{ id: `${nodeId}-in` }] as any,
        getOutGoerNodes: (nodeId: string) => [{ id: `${nodeId}-out` }] as any,
      },
    };

    const { result } = renderHook(() => useSelectNode(editorRef as any));

    act(() => {
      result.current.onSelectedNode({ id: "node-1" } as any);
    });

    expect(useEditorStore.getState().selectedNode?.id).toBe("node-1");
    expect(useEditorStore.getState().predecessorNodes).toEqual([{ id: "node-1-pre" }]);
    expect(useEditorStore.getState().incomerNodes).toEqual([{ id: "node-1-in" }]);
    expect(useEditorStore.getState().outgoerNodes).toEqual([{ id: "node-1-out" }]);
  });

  it("writes empty lists when editor ref has no node helpers", () => {
    const editorRef = { current: null };
    const { result } = renderHook(() => useSelectNode(editorRef as any));

    act(() => {
      result.current.onSelectedNode({ id: "node-2" } as any);
    });

    expect(useEditorStore.getState().selectedNode?.id).toBe("node-2");
    expect(useEditorStore.getState().predecessorNodes).toBeUndefined();
    expect(useEditorStore.getState().incomerNodes).toBeUndefined();
    expect(useEditorStore.getState().outgoerNodes).toBeUndefined();
  });
});