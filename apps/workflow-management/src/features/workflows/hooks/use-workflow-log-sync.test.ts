import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useWorkflowLogStore } from "../stores/log-store";
import { useWorkflowLogSync } from "./use-workflow-log-sync";

// ─── Setup ───────────────────────────────────────────────────────────────────

beforeEach(() => {
  useWorkflowLogStore.setState({ logs: [] });

  vi.stubGlobal("localStorage", {
    getItem: vi.fn(() => null),
    setItem: vi.fn(),
    removeItem: vi.fn(),
  });

  vi.useFakeTimers();
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.useRealTimers();
});


describe("useWorkflowLogSync", () => {

  describe("addLightLog", () => {
    it("adds a log to the store", () => {
      const { result } = renderHook(() => useWorkflowLogSync("wf-1"));

      act(() => result.current.addLightLog("NODE_ADDED"));

      expect(useWorkflowLogStore.getState().logs).toHaveLength(1);
    });

    it("sets the correct workflowId", () => {
      const { result } = renderHook(() => useWorkflowLogSync("wf-abc"));

      act(() => result.current.addLightLog("CONNECTION_ADDED"));

      expect(useWorkflowLogStore.getState().logs[0].workflowId).toBe("wf-abc");
    });

    it("sets the correct actionName", () => {
      const { result } = renderHook(() => useWorkflowLogSync("wf-1"));

      act(() => result.current.addLightLog("WORKFLOW_RENAMED"));

      expect(useWorkflowLogStore.getState().logs[0].actionName).toBe("WORKFLOW_RENAMED");
    });

    it("captures timestamp at call time", () => {
      vi.setSystemTime(50_000);
      const { result } = renderHook(() => useWorkflowLogSync("wf-1"));

      act(() => result.current.addLightLog("NODE_ADDED"));

      expect(useWorkflowLogStore.getState().logs[0].timestamp).toBe(50_000);
    });

    it("generates a non-empty string id", () => {
      const { result } = renderHook(() => useWorkflowLogSync("wf-1"));

      act(() => result.current.addLightLog("NODE_ADDED"));

      const { id } = useWorkflowLogStore.getState().logs[0];
      expect(typeof id).toBe("string");
      expect(id.length).toBeGreaterThan(0);
    });

    it("generates unique ids across multiple calls", () => {
      vi.setSystemTime(1_000);
      const { result } = renderHook(() => useWorkflowLogSync("wf-1"));

      act(() => {
        result.current.addLightLog("NODE_ADDED");
        vi.setSystemTime(1_001);
        result.current.addLightLog("NODE_ADDED");
      });

      const [log1, log2] = useWorkflowLogStore.getState().logs;
      expect(log1.id).not.toBe(log2.id);
    });

    it("does not include execution-specific fields (no status)", () => {
      const { result } = renderHook(() => useWorkflowLogSync("wf-1"));

      act(() => result.current.addLightLog("NODE_ADDED"));

      expect(useWorkflowLogStore.getState().logs[0].status).toBeUndefined();
    });

    it("uses the updated workflowId when prop changes", () => {
      const { result, rerender } = renderHook(
        ({ id }) => useWorkflowLogSync(id),
        { initialProps: { id: "wf-old" } }
      );

      rerender({ id: "wf-new" });

      act(() => result.current.addLightLog("NODE_ADDED"));

      expect(useWorkflowLogStore.getState().logs[0].workflowId).toBe("wf-new");
    });
  });

  describe("addExecutionLog", () => {
    it("adds a log to the store", () => {
      const { result } = renderHook(() => useWorkflowLogSync("wf-1"));

      act(() =>
        result.current.addExecutionLog("NODE_EXECUTED", {
          status: "SUCCESS",
          timestamp: 1_000,
        })
      );

      expect(useWorkflowLogStore.getState().logs).toHaveLength(1);
    });

    it("sets the correct workflowId and actionName", () => {
      const { result } = renderHook(() => useWorkflowLogSync("wf-1"));

      act(() =>
        result.current.addExecutionLog("WORKFLOW_SAVED", {
          status: "SUCCESS",
          timestamp: 2_000,
        })
      );

      const log = useWorkflowLogStore.getState().logs[0];
      expect(log.workflowId).toBe("wf-1");
      expect(log.actionName).toBe("WORKFLOW_SAVED");
    });

    it("uses the timestamp provided in meta (not Date.now())", () => {
      vi.setSystemTime(99_999);
      const { result } = renderHook(() => useWorkflowLogSync("wf-1"));

      act(() =>
        result.current.addExecutionLog("NODE_EXECUTED", {
          status: "SUCCESS",
          timestamp: 5_000,
        })
      );

      expect(useWorkflowLogStore.getState().logs[0].timestamp).toBe(5_000);
    });

    it("spreads all optional meta fields into the log", () => {
      const { result } = renderHook(() => useWorkflowLogSync("wf-1"));

      act(() =>
        result.current.addExecutionLog("NODE_EXECUTED", {
          status: "ERROR",
          timestamp: 1_000,
          nodeId: "node-42",
          nodeName: "GPT Node",
          errorMessage: "timeout",
          tokensUsed: 128,
        })
      );

      const log = useWorkflowLogStore.getState().logs[0];
      expect(log.status).toBe("ERROR");
      expect(log.nodeId).toBe("node-42");
      expect(log.nodeName).toBe("GPT Node");
      expect(log.errorMessage).toBe("timeout");
      expect(log.tokensUsed).toBe(128);
    });

    it("omits optional fields when not provided", () => {
      const { result } = renderHook(() => useWorkflowLogSync("wf-1"));

      act(() =>
        result.current.addExecutionLog("WORKFLOW_EXECUTED", {
          status: "SUCCESS",
          timestamp: 1_000,
        })
      );

      const log = useWorkflowLogStore.getState().logs[0];
      expect(log.nodeId).toBeUndefined();
      expect(log.nodeName).toBeUndefined();
      expect(log.errorMessage).toBeUndefined();
      expect(log.tokensUsed).toBeUndefined();
    });
  });

  describe("cleanup on unmount", () => {
    it("calls clearLogs when the hook unmounts", () => {
      const { result, unmount } = renderHook(() => useWorkflowLogSync("wf-1"));

      act(() => {
        result.current.addLightLog("NODE_ADDED");
        result.current.addLightLog("CONNECTION_ADDED");
      });
      expect(useWorkflowLogStore.getState().logs).toHaveLength(2);

      unmount();

      expect(useWorkflowLogStore.getState().logs).toEqual([]);
    });

    it("does not clear logs of other workflowIds after unmount", () => {
      const { result, unmount } = renderHook(() => useWorkflowLogSync("wf-1"));

      act(() => result.current.addLightLog("NODE_ADDED"));

      unmount();

      expect(useWorkflowLogStore.getState().logs).toEqual([]);
    });
  });
});
