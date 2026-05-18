import { render } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { IWorkflowLogs } from "@/features/workflows/types/workflow-log";

import LogList from "./log-list";

const logItemMock = vi.fn();

vi.mock("./log-item", () => ({
    default: ({ log }: { log: IWorkflowLogs }) => {
        logItemMock(log);
        return <div data-testid="log-item">{log.id}</div>;
    },
}));

describe("LogList", () => {
    beforeEach(() => {
        logItemMock.mockReset();
        Object.defineProperty(HTMLElement.prototype, "scrollIntoView", {
            configurable: true,
            value: vi.fn(),
        });
    });

    it("renders the logs and scrolls to the top marker when the list changes", () => {
        const { rerender } = render(
            <LogList
                logs={[
                    {
                        id: "log-1",
                        workflowId: "wf-1",
                        timestamp: 1,
                        actionName: "NODE_ADDED",
                    },
                ]}
            />
        );

        rerender(
            <LogList
                logs={[
                    {
                        id: "log-1",
                        workflowId: "wf-1",
                        timestamp: 1,
                        actionName: "NODE_ADDED",
                    },
                    {
                        id: "log-2",
                        workflowId: "wf-1",
                        timestamp: 2,
                        actionName: "WORKFLOW_EXECUTED",
                    },
                ]}
            />
        );

        expect(logItemMock).toHaveBeenCalledTimes(3);
        expect(HTMLElement.prototype.scrollIntoView).toHaveBeenCalled();
    });
});