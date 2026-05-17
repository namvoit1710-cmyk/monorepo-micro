/* @vitest-environment jsdom */
import { renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const useQueryNodePalleteMock = vi.fn();

vi.mock("@/components/containers/language-provider", () => ({
  useLanguage: () => ({ t: (key: string) => key }),
}));

vi.mock("./apis/node-pallete", () => ({
  useQueryNodePallete: () => useQueryNodePalleteMock(),
}));

import useGenerateWorkerMenu from "./use-merge-nodes";

beforeEach(() => {
  useQueryNodePalleteMock.mockReset();
  useQueryNodePalleteMock.mockReturnValue({
    data: undefined,
    isLoading: false,
  });
});

describe("useGenerateWorkerMenu", () => {
  it("returns empty menu when no palette data exists", () => {
    const { result } = renderHook(() => useGenerateWorkerMenu());

    expect(result.current.nodeMenuItems).toEqual([]);
    expect(result.current.menuGroups).toEqual([]);
    expect(result.current.isLoading).toBe(false);
  });

  it("maps palette categories into group and node menu items", () => {
    useQueryNodePalleteMock.mockReturnValue({
      data: {
        data: {
          categories: {
            core: [
              { id: "node-1", name: "Node 1", icon: "rocket" },
              { id: "node-2", name: "Node 2", icon: null },
            ],
            ai: [
              { id: "node-3", name: "Node 3", icon: "brain" },
            ],
          },
        },
      },
      isLoading: true,
    });

    const { result } = renderHook(() => useGenerateWorkerMenu());

    expect(result.current.isLoading).toBe(true);
    expect(result.current.menuGroups).toEqual([
      {
        text: "nodes.core",
        type: "Group",
        nodes: [
          { text: "Node 1", type: "Node", icon: "rocket", original: { id: "node-1", name: "Node 1", icon: "rocket" } },
          { text: "Node 2", type: "Node", icon: "ethernet-port", original: { id: "node-2", name: "Node 2", icon: null } },
        ],
      },
      {
        text: "nodes.ai",
        type: "Group",
        nodes: [
          { text: "Node 3", type: "Node", icon: "brain", original: { id: "node-3", name: "Node 3", icon: "brain" } },
        ],
      },
    ]);

    expect(result.current.nodeMenuItems).toEqual([
      { text: "Node 1", type: "Node", icon: "rocket", original: { id: "node-1", name: "Node 1", icon: "rocket" } },
      { text: "Node 2", type: "Node", icon: "ethernet-port", original: { id: "node-2", name: "Node 2", icon: null } },
      { text: "Node 3", type: "Node", icon: "brain", original: { id: "node-3", name: "Node 3", icon: "brain" } },
    ]);
  });
});