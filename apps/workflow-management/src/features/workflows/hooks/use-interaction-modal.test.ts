/* @vitest-environment jsdom */
import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { InteractionModalEnum, useInteractionModal } from "./use-interaction-modal";

const showMessageBoxMock = vi.fn();

vi.mock("@/components/containers/language-provider", () => ({
  useLanguage: () => ({ t: (key: string) => key }),
}));

vi.mock("@/components/containers/messagebox-provider", () => ({
  useMessageBox: () => showMessageBoxMock,
}));

describe("useInteractionModal", () => {
  it("opens modal for workflow execution prompt and resolves on dismiss", async () => {
    const { result } = renderHook(() => useInteractionModal());

    let promptPromise: Promise<unknown>;
    await act(async () => {
      promptPromise = result.current.prompt({
        type: InteractionModalEnum.WORKFLOW_EXECUTION,
        node_id: "node-1",
        input_schema: [],
      } as any);
    });

    expect(result.current.modalState?.title).toBe("workflow_executing");
    expect(result.current.modalState?.payload.node_id).toBe("node-1");

    act(() => {
      result.current.dismiss("node-1");
    });

    await expect(promptPromise!).resolves.toBeNull();
    expect(result.current.modalState).toBeNull();
  });

  it("uses message box for human action requests", async () => {
    showMessageBoxMock.mockResolvedValueOnce(true);
    const { result } = renderHook(() => useInteractionModal());

    const response = await result.current.prompt({
      type: InteractionModalEnum.HUMAN_ACTION_REQUESTED,
      node_id: "node-2",
      instruction: "Confirm this step",
    } as any);

    expect(response).toBe(true);

    expect(showMessageBoxMock).toHaveBeenCalledWith("Confirm this step", "human_action.requested");
    expect(result.current.modalState).toBeNull();
  });

  it("keeps modal open when dismiss uses different node id", async () => {
    const { result } = renderHook(() => useInteractionModal());

    act(() => {
      result.current.prompt({
        type: InteractionModalEnum.INPUT_REQUESTED,
        node_id: "node-3",
      } as any);
    });

    act(() => {
      result.current.dismiss("other-node");
    });

    expect(result.current.modalState?.payload.node_id).toBe("node-3");
  });
});