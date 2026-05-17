/* @vitest-environment jsdom */
import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useEditorStore } from "../stores/editor-stores";

const { mutateAsyncMock, invalidateQueriesMock, toastSuccessMock } = vi.hoisted(() => ({
  mutateAsyncMock: vi.fn(),
  invalidateQueriesMock: vi.fn(),
  toastSuccessMock: vi.fn(),
}));

let updateWorkflowOptions: { onSuccess?: () => void } | undefined;

vi.mock("@/components/containers/language-provider", () => ({
  useLanguage: () => ({ t: (key: string) => key }),
}));

vi.mock("@/hooks/use-last-ref", () => ({
  useLatestRef: <T,>(value: T) => ({ current: value }),
}));

vi.mock("@common/components/ldc-toast", () => ({
  toast: {
    success: toastSuccessMock,
  },
}));

vi.mock("@tanstack/react-query", () => ({
  useQueryClient: () => ({ invalidateQueries: invalidateQueriesMock }),
}));

vi.mock("./apis/workflows", () => ({
  workflowKey: { all: ["workflow"] },
  useUpdateWorkflow: (options?: { onSuccess?: () => void }) => {
    updateWorkflowOptions = options;
    return {
      mutateAsync: async (payload: unknown) => {
        mutateAsyncMock(payload);
        updateWorkflowOptions?.onSuccess?.();
        return { ok: true };
      },
      isPending: false,
    };
  },
}));

import useSaveWorkflow from "./use-save-workflow";

beforeEach(() => {
  useEditorStore.getState().resetEditorStore();
  mutateAsyncMock.mockReset();
  invalidateQueriesMock.mockReset();
  toastSuccessMock.mockReset();
  updateWorkflowOptions = undefined;

  useEditorStore.setState({
    workflowInfo: {
      id: "wf-1",
      name: "Original Name",
      status: "DRAFT",
      nodes: [],
      edges: [],
    },
    workflowData: {
      nodes: [],
      connections: [],
    },
  });
});

describe("useSaveWorkflow", () => {
  it("saves current workflow data and triggers success side effects", async () => {
    const onSaved = vi.fn();
    vi.useFakeTimers();
    vi.setSystemTime(123456);

    const { result } = renderHook(() => useSaveWorkflow({ onSaved }));

    await act(async () => {
      await result.current.onSave("wf-1");
    });

    expect(mutateAsyncMock).toHaveBeenCalledWith(
      expect.objectContaining({
        workflowId: "wf-1",
        payload: expect.objectContaining({
          id: "wf-1",
          name: "Original Name",
        }),
      })
    );
    expect(invalidateQueriesMock).toHaveBeenCalledTimes(1);
    expect(toastSuccessMock).toHaveBeenCalledWith(
      "notification.success",
      "notification.workflow_saved_successfully"
    );
    expect(onSaved).toHaveBeenCalledWith({ timestamp: 123456 });

    vi.useRealTimers();
  });

  it("overrides workflow name when provided", async () => {
    const { result } = renderHook(() => useSaveWorkflow());

    await act(async () => {
      await result.current.onSave("wf-1", "Renamed Workflow");
    });

    expect(mutateAsyncMock).toHaveBeenCalledWith(
      expect.objectContaining({
        payload: expect.objectContaining({
          name: "Renamed Workflow",
        }),
      })
    );
  });

  it("exposes pending state from update mutation", () => {
    const { result } = renderHook(() => useSaveWorkflow());

    expect(result.current.isSaving).toBe(false);
  });
});