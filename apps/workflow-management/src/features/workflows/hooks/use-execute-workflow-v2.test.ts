/* @vitest-environment jsdom */
import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useEditorStore } from "../stores/editor-stores";

const { runNodeMutateMock, runWorkflowMutateMock, stopWorkflowMutateMock, resumeTaskMutateMock, invalidateQueriesMock, toastLoadingMock, toastSuccessMock, toastErrorMock, toastDismissMock, messageBoxMock } = vi.hoisted(() => ({
  runNodeMutateMock: vi.fn(),
  runWorkflowMutateMock: vi.fn(),
  stopWorkflowMutateMock: vi.fn(),
  resumeTaskMutateMock: vi.fn(),
  invalidateQueriesMock: vi.fn(),
  toastLoadingMock: vi.fn(() => "run-toast"),
  toastSuccessMock: vi.fn(),
  toastErrorMock: vi.fn(),
  toastDismissMock: vi.fn(),
  messageBoxMock: vi.fn(),
}));

vi.mock("@/components/containers/language-provider", () => ({
  useLanguage: () => ({ t: (key: string) => key }),
}));

vi.mock("@/components/containers/messagebox-provider", () => ({
  useMessageBox: () => messageBoxMock,
}));

vi.mock("@/lib/socket", () => ({
  pushGatewaySocket: {
    connect: vi.fn(),
  },
}));

vi.mock("@common/components/ldc-toast", () => ({
  toast: {
    loading: toastLoadingMock,
    success: toastSuccessMock,
    error: toastErrorMock,
    dismiss: toastDismissMock,
    info: vi.fn(),
  },
}));

vi.mock("@tanstack/react-query", () => ({
  useQueryClient: () => ({ invalidateQueries: invalidateQueriesMock }),
}));

vi.mock("./apis/workflows", () => ({
  workflowKey: {
    getWorkflowById: (id: string) => ["workflow", id],
  },
  useRunNode: () => ({
    mutate: runNodeMutateMock,
    isPending: false,
    variables: undefined,
  }),
  useRunWorkflow: () => ({
    mutate: runWorkflowMutateMock,
    isPending: false,
  }),
  useStopWorkflow: () => ({
    mutate: stopWorkflowMutateMock,
  }),
  useResumeTask: () => ({
    mutate: resumeTaskMutateMock,
  }),
}));

vi.mock("./use-interaction-modal", () => ({
  InteractionModalEnum: {
    WORKFLOW_EXECUTION: "workflow_execution",
    INPUT_REQUESTED: "input.requested",
    HUMAN_ACTION_REQUESTED: "human_action.requested",
    DATA_EDIT_REQUESTED: "data_edit.requested",
    APPROVAL_FLOW_VIEWER: "approval_flow.viewer",
  },
}));

import useExecuteWorkflow from "./use-execute-workflow-v2";

beforeEach(() => {
  useEditorStore.getState().resetEditorStore();
  runNodeMutateMock.mockReset();
  runWorkflowMutateMock.mockReset();
  stopWorkflowMutateMock.mockReset();
  resumeTaskMutateMock.mockReset();
  invalidateQueriesMock.mockReset();
  toastLoadingMock.mockClear();
  toastSuccessMock.mockClear();
  toastErrorMock.mockClear();
  toastDismissMock.mockClear();
  messageBoxMock.mockReset();

  useEditorStore.setState({
    workflowInfo: {
      id: "wf-1",
      name: "Workflow 1",
      status: "DRAFT",
      nodes: [
        {
          id: "node-1",
          name: "Node 1",
          title: "Node 1",
          node_type: "TASK",
          color: "#fff",
          description: "",
          ports: { inputs: [], outputs: [] },
          status: "idle",
        },
      ],
      edges: [],
    } as any,
    workflowData: {
      nodes: [
        {
          id: "node-1",
          data: { title: "Node 1", name: "Node 1" },
        } as any,
      ],
      connections: [],
    },
    localExecution: null,
  });
});

describe("useExecuteWorkflowV2", () => {
  it("runs node execution when workflow id exists", () => {
    const editorRef = {
      current: {
        updateNodeConnectionStatus: vi.fn(),
        resetAllNodeStatus: vi.fn(),
      },
    };
    const onSaveWorkflow = vi.fn();

    const { result } = renderHook(() =>
      useExecuteWorkflow({
        prompt: vi.fn(),
        editorRef: editorRef as any,
        onSaveWorkflow,
      })
    );

    act(() => {
      result.current.onRunNode("node-1");
    });

    expect(editorRef.current.updateNodeConnectionStatus).toHaveBeenCalledWith("node-1", "idle");
    expect(onSaveWorkflow).toHaveBeenCalled();
    expect(runNodeMutateMock).toHaveBeenCalledWith({ workflowId: "wf-1", nodeId: "node-1" });

    return waitFor(() => {
      expect(useEditorStore.getState().localExecution).toEqual({ type: "node", nodeId: "node-1" });
    });
  });

  it("does not run node when workflow id is missing", () => {
    useEditorStore.setState({
      workflowInfo: null as any,
    });

    const editorRef = {
      current: {
        updateNodeConnectionStatus: vi.fn(),
        resetAllNodeStatus: vi.fn(),
      },
    };

    const { result } = renderHook(() =>
      useExecuteWorkflow({
        prompt: vi.fn(),
        editorRef: editorRef as any,
      })
    );

    act(() => {
      result.current.onRunNode("node-1");
    });

    expect(runNodeMutateMock).not.toHaveBeenCalled();
  });

  it("starts workflow run when prompt returns input data", async () => {
    const editorRef = {
      current: {
        resetAllNodeStatus: vi.fn(),
      },
    };
    const prompt = vi.fn().mockResolvedValue({ input_data: `{"foo":"bar"}` });
    const onSaveWorkflow = vi.fn();

    const { result } = renderHook(() =>
      useExecuteWorkflow({
        prompt,
        editorRef: editorRef as any,
        onSaveWorkflow,
      })
    );

    await act(async () => {
      await result.current.onRunWorkflow();
    });

    expect(prompt).toHaveBeenCalled();
    expect(onSaveWorkflow).toHaveBeenCalled();
    expect(runWorkflowMutateMock).toHaveBeenCalledWith({
      workflowId: "wf-1",
      config: { input_data: { foo: "bar" } },
    });
    expect(toastLoadingMock).toHaveBeenCalled();
    expect(useEditorStore.getState().localExecution).toEqual({ type: "workflow", runId: undefined });
  });

  it("returns early when prompt is cancelled", async () => {
    const editorRef = {
      current: {
        resetAllNodeStatus: vi.fn(),
      },
    };
    const prompt = vi.fn().mockResolvedValue(null);

    const { result } = renderHook(() =>
      useExecuteWorkflow({
        prompt,
        editorRef: editorRef as any,
      })
    );

    await act(async () => {
      await result.current.onRunWorkflow();
    });

    expect(runWorkflowMutateMock).not.toHaveBeenCalled();
    expect(toastLoadingMock).not.toHaveBeenCalled();
  });
});