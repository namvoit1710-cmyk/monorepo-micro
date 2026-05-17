import { INodeDefinition } from "@/features/node-definitions/types/node-definition";
import { create } from "zustand";

interface NodeDefinitionState {
    selectedDefinition: INodeDefinition | null;
    isCreateModalOpen: boolean;
    isEditModalOpen: boolean;
    isDeleteDialogOpen: boolean;
}

interface NodeDefinitionActions {
    setSelectedDefinition: (definition: INodeDefinition | null) => void;

    openCreateModal: () => void;
    closeCreateModal: () => void;

    openEditModal: (definition: INodeDefinition) => void;
    closeEditModal: () => void;

    openDeleteDialog: (definition: INodeDefinition) => void;
    closeDeleteDialog: () => void;

    resetNodeDefinitionStore: () => void;
}

type NodeDefinitionStore = NodeDefinitionState & NodeDefinitionActions;

const initialState: NodeDefinitionState = {
    selectedDefinition: null,
    isCreateModalOpen: false,
    isEditModalOpen: false,
    isDeleteDialogOpen: false,
};

export const useNodeDefinitionStore = create<NodeDefinitionStore>((set) => ({
    ...initialState,

    setSelectedDefinition: (definition) => set({ selectedDefinition: definition }),

    openCreateModal: () => set({ isCreateModalOpen: true }),
    closeCreateModal: () => set({ isCreateModalOpen: false, selectedDefinition: null }),

    openEditModal: (definition) => set({ isEditModalOpen: true, selectedDefinition: definition }),
    closeEditModal: () => set({ isEditModalOpen: false, selectedDefinition: null }),

    openDeleteDialog: (definition) => set({ isDeleteDialogOpen: true, selectedDefinition: definition }),
    closeDeleteDialog: () => set({ isDeleteDialogOpen: false, selectedDefinition: null }),

    resetNodeDefinitionStore: () => set(initialState),
}));
