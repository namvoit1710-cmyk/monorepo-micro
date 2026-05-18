import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import type { IWorkflowLogs } from "@/features/workflows/types/workflow-log";

import LogItem from "./log-item";

vi.mock("@/components/containers/language-provider", () => ({
    useLanguage: () => ({ t: (key: string) => key }),
}));

vi.mock("@common/components/ldc-workflow-editor/components/rete-editor/nodes/components/dynamic-node-icon", () => ({
    default: ({ name }: { name: string }) => <span data-testid="dynamic-node-icon" data-name={name} />,
}));

vi.mock("@common/components/ui/collapsible", () => ({
    Collapsible: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    CollapsibleTrigger: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    CollapsibleContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

vi.mock("@/features/workflows/utils/workflow-log-utils", () => ({
    formatDuration: (value: number) => `${value}ms`,
    formatLogTime: (value: number) => `time-${value}`,
    getExecutionDuration: (log: IWorkflowLogs) => log.timestamp,
}));

vi.mock("./execution-status-badge", () => ({
    default: ({ status }: { status: string }) => <span data-testid="execution-status-badge">{status}</span>,
}));

describe("LogItem", () => {
    it("renders the log row with its status and timing details", () => {
        render(
            <LogItem
                log={{
                    id: "log-1",
                    workflowId: "wf-1",
                    timestamp: 125,
                    actionName: "NODE_ADDED",
                    nodeName: "Customer Node",
                    status: "SUCCESS",
                }}
            />
        );

        expect(screen.getByText("log.actions.NODE_ADDED")).toBeInTheDocument();
        expect(screen.getByText("Customer Node")).toHaveAttribute("title", "Customer Node");
        expect(screen.getByTestId("execution-status-badge")).toHaveTextContent("SUCCESS");
        expect(screen.getByText("time-125")).toBeInTheDocument();
        expect(screen.getByText("125ms log.ago")).toBeInTheDocument();
        expect(screen.getByTestId("dynamic-node-icon")).toHaveAttribute("data-name", "plus");
    });

    it("renders the error details when the log contains an error", () => {
        render(
            <LogItem
                log={{
                    id: "log-2",
                    workflowId: "wf-1",
                    timestamp: 250,
                    actionName: "WORKFLOW_EXECUTED",
                    status: "ERROR",
                    errorMessage: "something failed",
                }}
            />
        );

        expect(screen.getByText("log.status.ERROR:")).toBeInTheDocument();
        expect(screen.getByText("something failed")).toBeInTheDocument();
    });
});