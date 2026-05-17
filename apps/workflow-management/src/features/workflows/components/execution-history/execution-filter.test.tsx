import type { ReactNode } from "react";

import { act, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import ExecutionFilter from "./execution-filter";

const useWorkflowListInfiniteMock = vi.fn();

vi.mock("@/components/containers/language-provider", () => ({
    useLanguage: () => ({ t: (key: string) => key }),
}));

vi.mock("../../hooks/apis/workflows", () => ({
    useWorkflowListInfinite: (...args: unknown[]) => useWorkflowListInfiniteMock(...args),
}));

vi.mock("@common/components/ui/button", () => ({
    Button: ({ children, ...props }: { children: ReactNode }) => <button {...props}>{children}</button>,
}));

vi.mock("@common/components/ui/command", () => ({
    Command: ({ children }: { children: ReactNode }) => <div>{children}</div>,
    CommandEmpty: ({ children }: { children: ReactNode }) => <div>{children}</div>,
    CommandInput: ({ value, onValueChange, placeholder }: { value: string; onValueChange: (value: string) => void; placeholder: string }) => (
        <input aria-label={placeholder} value={value} onChange={(event) => onValueChange(event.target.value)} />
    ),
    CommandItem: ({ children, onSelect, "data-checked": dataChecked }: { children: ReactNode; onSelect: () => void; "data-checked"?: boolean }) => (
        <button type="button" data-checked={dataChecked ? "true" : "false"} onClick={onSelect}>
            {children}
        </button>
    ),
    CommandList: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}));

vi.mock("@common/components/ui/popover", () => ({
    Popover: ({ children }: { children: ReactNode }) => <div>{children}</div>,
    PopoverTrigger: ({ children }: { children: ReactNode }) => <div>{children}</div>,
    PopoverContent: ({ children, className }: { children: ReactNode; className?: string }) => (
        <div data-testid={className?.includes("w-[160px]") ? "status-popover-content" : "workflow-popover-content"}>{children}</div>
    ),
}));

vi.mock("@common/components/ui/spinner", () => ({
    Spinner: () => <div data-testid="spinner" />,
}));

vi.stubGlobal("IntersectionObserver", class {
    observe = vi.fn();
    disconnect = vi.fn();
});

describe("ExecutionFilter", () => {
    beforeEach(() => {
        vi.useFakeTimers();
        useWorkflowListInfiniteMock.mockReset();
        useWorkflowListInfiniteMock.mockReturnValue({
            data: {
                pages: [
                    {
                        data: {
                            items: [
                                { id: "wf-1", name: "Invoice Approval" },
                                { id: "wf-2", name: "Onboarding" },
                            ],
                        },
                    },
                ],
            },
            fetchNextPage: vi.fn(),
            hasNextPage: false,
            isFetchingNextPage: false,
        });
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it("renders the current workflow and status labels", () => {
        render(
            <ExecutionFilter
                isActive
                initialFilter={{ workflowId: "wf-2", executionStatus: "completed" }}
                setWorkflowId={() => undefined}
                setExecutionStatus={() => undefined}
            />
        );

        expect(screen.getByRole("button", { name: /Onboarding/ })).toBeInTheDocument();
        expect(screen.getByRole("button", { name: /Completed/ })).toBeInTheDocument();
        expect(useWorkflowListInfiniteMock).toHaveBeenCalledWith({ $filter: undefined }, { enabled: true });
    });

    it("updates the workflow search filter passed to the query hook", () => {
        render(
            <ExecutionFilter
                isActive
                initialFilter={{ workflowId: "all", executionStatus: "" }}
                setWorkflowId={() => undefined}
                setExecutionStatus={() => undefined}
            />
        );

        fireEvent.change(within(screen.getByTestId("workflow-popover-content")).getByLabelText("search_workflow"), {
            target: { value: "invoice" },
        });

        act(() => {
            vi.advanceTimersByTime(300);
        });

        expect(useWorkflowListInfiniteMock).toHaveBeenLastCalledWith(
            { $filter: "contains(name, 'invoice')" },
            { enabled: true }
        );
    });

    it("forwards workflow and status selections", () => {
        const setWorkflowId = vi.fn();
        const setExecutionStatus = vi.fn();

        render(
            <ExecutionFilter
                isActive
                initialFilter={{ workflowId: "all", executionStatus: "" }}
                setWorkflowId={setWorkflowId}
                setExecutionStatus={setExecutionStatus}
            />
        );

        fireEvent.click(within(screen.getByTestId("workflow-popover-content")).getByRole("button", { name: "Invoice Approval" }));
        fireEvent.click(within(screen.getByTestId("status-popover-content")).getByRole("button", { name: "Completed" }));

        expect(setWorkflowId).toHaveBeenCalledWith("wf-1");
        expect(setExecutionStatus).toHaveBeenCalledWith("completed");
    });
});