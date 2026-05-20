import { create } from "zustand";
import type { AgentStep } from "../mocks/mock-data";

export type WorkspaceMode = "form" | "flowchart";

interface WorkspaceState {
  isOpen: boolean;
  mode: WorkspaceMode;
  data: unknown;
  steps: AgentStep[];
  open: (mode: WorkspaceMode, data?: unknown) => void;
  close: () => void;
  toggle: (mode?: WorkspaceMode) => void;
  updateStep: (step: AgentStep) => void;
  resetSteps: () => void;
}

export const useWorkspaceStore = create<WorkspaceState>((set) => ({
  isOpen: false,
  mode: "flowchart",
  data: null,
  steps: [],

  open: (mode, data) => set({ isOpen: true, mode, data }),

  close: () => set({ isOpen: false }),

  toggle: (mode) =>
    set((s) => {
      if (!mode) return { isOpen: !s.isOpen };
      if (s.isOpen && s.mode === mode) return { isOpen: false };
      return { isOpen: true, mode };
    }),

  updateStep: (step) =>
    set((s) => {
      const existing = s.steps.find((st) => st.id === step.id);
      if (existing) {
        return { steps: s.steps.map((st) => (st.id === step.id ? step : st)) };
      }
      return { steps: [...s.steps, step] };
    }),

  resetSteps: () => set({ steps: [] }),
}));
