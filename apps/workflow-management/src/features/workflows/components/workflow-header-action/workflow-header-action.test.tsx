import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import WorkflowDetailHeaderAction from "./workflow-header-action";

const navigateMock = vi.fn();
const invalidateQueriesMock = vi.fn();

vi.mock("@/components/containers/language-provider", () => ({
    useLanguage: () => ({ t: (key: string) => key }),
}));

vi.mock("react-router-dom", () => ({
    useLocation: () => ({ state: { listSearch: "workflow search" } }),
    useNavigate: () => navigateMock,
}));

vi.mock("@tanstack/react-query", () => ({
    useQueryClient: () => ({ invalidateQueries: invalidateQueriesMock }),
}));

vi.mock("@ldc/ui/components/button", () => ({
    Button: ({ children, ...props }: { children: React.ReactNode }) => <button {...props}>{children}</button>,
}));

vi.mock("../../stores/editor-stores", () => ({
    useEditorStore: (selector: (state: { workflowInfo: { id: string; description: string; routing_path: string } }) => unknown) =>
        selector({
            workflowInfo: {
                id: "wf-123",
                description: "Sample workflow",
                routing_path: "/routing/sample",
            },
        }),
}));

vi.mock("@common/components/ldc-workflow-editor/components/rete-editor/nodes/components/loading-spin/loading-spin", () => ({
    default: () => <span data-testid="loading-spin" />,
}));

vi.mock("./more-config-menu", () => ({
    default: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

vi.mock("../modals/workflow-rename-modal", () => ({
    default: () => null,
}));

vi.mock("../modals/workflow-rename-description-modal", () => ({
    default: () => null,
}));

vi.mock("../modals/workflow-rename-routing-modal", () => ({
    default: () => null,
}));

describe("WorkflowDetailHeaderAction", () => {
    it("navigates back and triggers save and execute actions", () => {
        const onSave = vi.fn();
        const onExecute = vi.fn();
        const onStop = vi.fn();

        render(
            <WorkflowDetailHeaderAction
                workflowTitle="Sample workflow"
                onSave={onSave}
                onExecute={onExecute}
                onStop={onStop}
            />
        );

        fireEvent.click(screen.getByText("back_to_workflow"));
        fireEvent.click(screen.getByText("save"));
        fireEvent.click(screen.getByText("execute"));

        expect(navigateMock).toHaveBeenCalledWith("/", { state: { listSearch: "workflow search" } });
        expect(onSave).toHaveBeenCalledWith();
        expect(onExecute).toHaveBeenCalled();
        expect(onStop).not.toHaveBeenCalled();
    });

    it("switches to stop mode while a workflow is executing", () => {
        const onExecute = vi.fn();
        const onStop = vi.fn();

        render(
            <WorkflowDetailHeaderAction
                workflowTitle="Sample workflow"
                isRunWorkflowExecuting
                onSave={() => undefined}
                onExecute={onExecute}
                onStop={onStop}
            />
        );

        fireEvent.click(screen.getByText("executing"));

        expect(onStop).toHaveBeenCalled();
        expect(onExecute).not.toHaveBeenCalled();
    });
});