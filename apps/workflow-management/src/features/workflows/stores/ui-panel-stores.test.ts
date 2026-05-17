import { beforeEach, describe, expect, it } from "vitest";
import { useUIPanelStore } from "./ui-panel-stores";

describe("useUIPanelStore", () => {
  beforeEach(() => {
    useUIPanelStore.getState().resetUIPanelStore();
  });

  it("starts closed", () => {
    const state = useUIPanelStore.getState();

    expect(state.isOpenNodesPopup).toBe(false);
    expect(state.isOpenChatPanel).toBe(false);
    expect(state.isOpenNodeListPanel).toBe(false);
    expect(state.isOpenParameterSetting).toBe(false);
    expect(state.isOpenRunConfigModal).toBe(false);
    expect(state.isOpenNodeInfoEditorModal).toBe(false);
  });

  it("toggles and sets panel flags", () => {
    const store = useUIPanelStore.getState();

    store.setIsOpenNodesPopup(true);
    store.setIsOpenParameterSetting(true);
    store.setIsOpenNodeListPanel(true);
    store.toggleNodesPopup();
    store.toggleChatPanel();
    store.toggleNodeListPanel();
    store.openRunConfigModal();
    store.setIsOpenNodeInfoEditorModal(true);

    expect(useUIPanelStore.getState().isOpenNodesPopup).toBe(false);
    expect(useUIPanelStore.getState().isOpenChatPanel).toBe(true);
    expect(useUIPanelStore.getState().isOpenNodeListPanel).toBe(false);
    expect(useUIPanelStore.getState().isOpenParameterSetting).toBe(true);
    expect(useUIPanelStore.getState().isOpenRunConfigModal).toBe(true);
    expect(useUIPanelStore.getState().isOpenNodeInfoEditorModal).toBe(true);

    store.closeRunConfigModal();
    store.closeNodesPopup();

    expect(useUIPanelStore.getState().isOpenRunConfigModal).toBe(false);
    expect(useUIPanelStore.getState().isOpenNodesPopup).toBe(false);
  });

  it("resets to initial state", () => {
    useUIPanelStore.getState().setIsOpenNodesPopup(true);
    useUIPanelStore.getState().resetUIPanelStore();

    expect(useUIPanelStore.getState().isOpenNodesPopup).toBe(false);
    expect(useUIPanelStore.getState().isOpenNodeInfoEditorModal).toBe(false);
  });
});