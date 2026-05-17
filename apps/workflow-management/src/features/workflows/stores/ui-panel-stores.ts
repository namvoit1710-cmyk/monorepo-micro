import { create } from "zustand";

interface UIPanelState {
    isOpenNodesPopup: boolean;
    isOpenChatPanel: boolean;
    isOpenNodeListPanel: boolean;
    isOpenParameterSetting: boolean;
    isOpenRunConfigModal: boolean;

    isOpenNodeInfoEditorModal: boolean;
}

interface UIPanelActions {
    setIsOpenNodesPopup: (isOpen: boolean) => void;
    setIsOpenParameterSetting: (isOpen: boolean) => void;
    setIsOpenNodeListPanel: (isOpen: boolean) => void;
    toggleNodesPopup: () => void;
    toggleChatPanel: () => void;
    toggleNodeListPanel: () => void;
    openRunConfigModal: () => void;
    closeRunConfigModal: () => void;

    closeNodesPopup: () => void;

    resetUIPanelStore: () => void;

    setIsOpenNodeInfoEditorModal: (isOpen: boolean) => void;
}

type UIPanelStore = UIPanelState & UIPanelActions;

const initialState: UIPanelState = {
    isOpenNodesPopup: false,
    isOpenChatPanel: false,
    isOpenNodeListPanel: false,
    isOpenParameterSetting: false,
    isOpenRunConfigModal: false,

    isOpenNodeInfoEditorModal: false,
};

export const useUIPanelStore = create<UIPanelStore>((set) => ({
    ...initialState,

    setIsOpenNodesPopup: (isOpen) => set({ isOpenNodesPopup: isOpen }),
    setIsOpenParameterSetting: (isOpen) => set({ isOpenParameterSetting: isOpen }),
    setIsOpenNodeListPanel: (isOpen) => set({ isOpenNodeListPanel: isOpen }),
    toggleNodesPopup: () => set((s) => ({ isOpenNodesPopup: !s.isOpenNodesPopup })),
    toggleChatPanel: () => set((s) => ({ isOpenChatPanel: !s.isOpenChatPanel })),
    toggleNodeListPanel: () => set((s) => ({ isOpenNodeListPanel: !s.isOpenNodeListPanel })),
    openRunConfigModal: () => set({ isOpenRunConfigModal: true }),
    closeRunConfigModal: () => set({ isOpenRunConfigModal: false }),
    closeNodesPopup: () => set({ isOpenNodesPopup: false }),

    setIsOpenNodeInfoEditorModal: (isOpen) => set({ isOpenNodeInfoEditorModal: isOpen }),

    resetUIPanelStore: () => set(initialState),
}));