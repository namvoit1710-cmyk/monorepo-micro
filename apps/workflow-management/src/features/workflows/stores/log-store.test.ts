/* @vitest-environment jsdom */
import { beforeEach, describe, expect, it } from "vitest";
import { useWorkflowLogStore } from "./log-store";

describe("useWorkflowLogStore", () => {
  beforeEach(() => {
    localStorage.clear();
    useWorkflowLogStore.getState().clearLogs();
  });

  it("starts with empty logs", () => {
    expect(useWorkflowLogStore.getState().logs).toEqual([]);
  });

  it("prepends logs and caps at 500 items", () => {
    for (let index = 0; index < 501; index += 1) {
      useWorkflowLogStore.getState().addLog({
        id: `log-${index}`,
        workflowId: "wf-1",
        actionName: "NODE_ADDED",
        timestamp: index,
      } as any);
    }

    const logs = useWorkflowLogStore.getState().logs;

    expect(logs).toHaveLength(500);
    expect(logs[0].id).toBe("log-500");
    expect(logs[499].id).toBe("log-1");
  });

  it("clears logs", () => {
    useWorkflowLogStore.getState().addLog({
      id: "log-1",
      workflowId: "wf-1",
      actionName: "NODE_ADDED",
      timestamp: 1,
    } as any);

    useWorkflowLogStore.getState().clearLogs();

    expect(useWorkflowLogStore.getState().logs).toEqual([]);
  });
});