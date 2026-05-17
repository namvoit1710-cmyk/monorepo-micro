import { createContext, forwardRef, useImperativeHandle, type ReactNode } from "react";

import { act, fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import WorkflowDetailPage from "./workflow-detail";

const mocks = vi.hoisted(() => ({
    onSave: vi.fn(),
    onRunNode: vi.fn(),
    onRunWorkflow: vi.fn(),
    stopWorkflow: vi.fn(),
    addLightLog: vi.fn(),
    addExecutionLog: vi.fn(),
    setWorkflowData: vi.fn(),
    setIsOpenNodesPopup: vi.fn(),
    toggleNodeListPanel: vi.fn(),
    setIsOpenNodeInfoEditorModal: vi.fn(),
    onSelectedNode: vi.fn(),
    editorAddNode: vi.fn(),
}));

const interactionModalMock = vi.hoisted(() => ({
    state: null as null | { payload?: { type?: string } },
}));

const panelStateMock = vi.hoisted(() => ({
    isOpenNodeListPanel: false,
}));

const PanelContext = createContext<{ openNodeListPanel: boolean; onToggle: () => void } | null>(null);

vi.mock("react-router-dom", () => ({
    useParams: () => ({ workflowId: "wf-123" }),
}));

vi.mock("@/components/containers/page", () => {
    function Page({ children }: { children: ReactNode }) {
        return <div>{children}</div>;
    }

    function PageHeader({ title, description, actions }: { title: ReactNode; description?: ReactNode; actions?: ReactNode }) {
        return (
            <div>
                <div data-testid="page-title">{title}</div>
                <div data-testid="page-description">{description}</div>
                <div data-testid="page-actions">{actions}</div>
            </div>
        );
    }

    Page.Header = PageHeader;
    Page.displayName = "Page";
    PageHeader.displayName = "PageHeader";

    return { default: Page };
});

vi.mock("@/components/containers/language-provider", () => ({
    useLanguage: () => ({ t: (key: string) => key }),
}));

vi.mock("@/features/workflows/hooks/use-workflow-detail-page", () => ({
    useWorkflowDetail: () => ({ workflow: { name: "Invoice Flow", description: "Main workflow", main_flow: true }, isLoading: false }),
}));

vi.mock("@/features/workflows/hooks/use-workflow-log-sync", () => ({
    useWorkflowLogSync: () => ({ addLightLog: mocks.addLightLog, addExecutionLog: mocks.addExecutionLog }),
}));

vi.mock("@/features/workflows/hooks/use-interaction-modal", () => ({
    InteractionModalEnum: { APPROVAL_FLOW_VIEWER: "APPROVAL_FLOW_VIEWER" },
    useInteractionModal: () => ({ modalState: interactionModalMock.state, prompt: vi.fn(), dismiss: vi.fn() }),
}));

vi.mock("@/features/workflows/hooks/use-save-workflow", () => ({
    default: () => ({ onSave: mocks.onSave, isSaving: false }),
}));

vi.mock("@/features/workflows/hooks/use-execute-workflow-v2", () => ({
    default: () => ({
        onRunNode: mocks.onRunNode,
        onRunWorkflow: mocks.onRunWorkflow,
        stopWorkflow: mocks.stopWorkflow,
        isRunNodeLoading: false,
        loadingNodeId: undefined,
        isRunWorkflowExecuting: false,
        isPrepareWorkflowExecuting: false,
    }),
}));

vi.mock("@/features/workflows/hooks/use-select-node", () => ({
    default: () => ({ onSelectedNode: mocks.onSelectedNode }),
}));

vi.mock("@/features/workflows/stores/editor-stores", () => ({
    useEditorStore: (selector: (state: { workflowData: unknown; setWorkflowData: (value: unknown) => void }) => unknown) =>
        selector({ workflowData: { nodes: [] }, setWorkflowData: mocks.setWorkflowData }),
}));

vi.mock("@/features/workflows/stores/ui-panel-stores", () => ({
    useUIPanelStore: (selector: (state: { setIsOpenNodesPopup: (value: boolean) => void; isOpenNodeListPanel: boolean; toggleNodeListPanel: () => void; setIsOpenNodeInfoEditorModal: (value: boolean) => void }) => unknown) =>
        selector({
            setIsOpenNodesPopup: mocks.setIsOpenNodesPopup,
            isOpenNodeListPanel: panelStateMock.isOpenNodeListPanel,
            toggleNodeListPanel: mocks.toggleNodeListPanel,
            setIsOpenNodeInfoEditorModal: mocks.setIsOpenNodeInfoEditorModal,
        }),
}));

vi.mock("@common/components/ldc-seo/ldc-seo", () => ({
    default: ({ title, description }: { title: string; description: string }) => (
        <div data-testid="seo" data-title={title} data-description={description} />
    ),
}));

vi.mock("@common/components/ldc-workflow-editor/components/workflow-editor/workflow-editor", () => ({
    default: forwardRef(function WorkflowEditorMock(
        {
            value,
            onAddNode,
            onChange,
            onExecuteNode,
            onOpenNodePopup,
            onNodeSelected,
            onNodeAdded,
            onConnectionAdded,
            onEditNode,
        }: {
            value: unknown;
            onAddNode: () => void;
            onChange: (value: unknown) => void;
            onExecuteNode: (nodeId: string) => void;
            onOpenNodePopup: (node: { id: string; name: string }) => void;
            onNodeSelected: (node: { id: string; name: string }) => void;
            onNodeAdded: () => void;
            onConnectionAdded: () => void;
            onEditNode: (node: { id: string; name: string }) => void;
        },
        _ref
    ) {
        useImperativeHandle(_ref, () => ({
            addNode: mocks.editorAddNode,
            removeConnectionBySource: vi.fn(),
            removeConnectionByTarget: vi.fn(),
            updateNodeView: vi.fn(),
            serializeAndEmitChange: vi.fn(),
        }));

        return (
            <div data-testid="workflow-editor">
                <button type="button" onClick={onAddNode}>add node</button>
                <button type="button" onClick={() => onChange({ nodes: [1] })}>change editor</button>
                <button type="button" onClick={() => onExecuteNode("node-1")}>execute node</button>
                <button type="button" onClick={() => onOpenNodePopup({ id: "node-1", name: "Node 1" })}>open node popup</button>
                <button type="button" onClick={() => onNodeSelected({ id: "node-2", name: "Node 2" })}>select node</button>
                <button type="button" onClick={onNodeAdded}>add log node</button>
                <button type="button" onClick={onConnectionAdded}>add log connection</button>
                <button type="button" onClick={() => onEditNode({ id: "node-3", name: "Node 3" })}>edit node</button>
                <div data-testid="workflow-editor-value">{JSON.stringify(value)}</div>
            </div>
        );
    }),
}));

vi.mock("@/features/workflows/components/node-palette/node-palette", () => ({
    default: ({ isOpen, onClose, children }: { isOpen: boolean; onClose: () => void; children: ReactNode }) => (
        <div data-testid="node-palette" data-open={String(isOpen)}>
            <button type="button" onClick={onClose}>close palette</button>
            {isOpen && children}
        </div>
    ),
}));

vi.mock("@/features/workflows/components/node-palette/palette-content", () => ({
    default: ({ onCloseDrawer, onSelectNode }: { onCloseDrawer: () => void; onSelectNode: (node: { id: string; name: string }) => void }) => (
        <div>
            <button type="button" onClick={() => onSelectNode({ id: "node-x", name: "Selected Node" })}>select from palette</button>
            <button type="button" onClick={onCloseDrawer}>close drawer</button>
        </div>
    ),
}));

vi.mock("@/features/workflows/components/workflow-header-action/workflow-header-action", () => ({
    default: ({ onExecute, onStop, onSave }: { onExecute: () => void; onStop: () => void; onSave: (name?: string) => void }) => (
        <div data-testid="header-action">
            <button type="button" onClick={onExecute}>run workflow</button>
            <button type="button" onClick={onStop}>stop workflow</button>
            <button type="button" onClick={() => onSave("renamed")}>save workflow</button>
        </div>
    ),
}));

vi.mock("@/features/workflows/components/logs/logs", () => ({
    default: ({ workflowId }: { workflowId: string }) => <div data-testid="logs" data-workflow-id={workflowId} />,
}));

vi.mock("@/features/workflows/components/loading-overlay/loading-overlay", () => ({
    default: ({ isLoading }: { isLoading: boolean }) => <div data-testid="loading-overlay" data-loading={String(isLoading)} />,
}));

vi.mock("@/features/workflows/components/modals/nodes-detail-modal/detail-modal", () => ({
    default: ({ onExecuteNode, onSelectNode, removeConnection, updateNodeView }: { onExecuteNode: (nodeId: string) => void; onSelectNode: (node: { id: string }) => void; removeConnection: (args: { sourceId?: string; targetId?: string }) => void; updateNodeView: (nodeId: string) => void }) => (
        <div data-testid="nodes-detail-modal">
            <button type="button" onClick={() => onExecuteNode("node-modal")}>execute node from modal</button>
            <button type="button" onClick={() => onSelectNode({ id: "node-modal" })}>select node from modal</button>
            <button type="button" onClick={() => removeConnection({ sourceId: "s-1", targetId: "t-1" })}>remove connection</button>
            <button type="button" onClick={() => updateNodeView("node-modal")}>update node view</button>
        </div>
    ),
}));

vi.mock("@/features/workflows/components/modals/approval-flow-modal/approval-flow-modal", () => ({
    default: () => <div data-testid="approval-flow-modal" />,
}));

vi.mock("@/features/workflows/components/modals/interaction-modal/components/interaction-modal", () => ({
    default: () => <div data-testid="interaction-modal" />,
}));

vi.mock("@/features/workflows/components/modals/node-edit-infor-modal", () => ({
    default: () => <div data-testid="node-edit-info-modal" />,
}));

vi.mock("@/features/workflows/utils/node-mapper-utils", () => ({
    mapNodeToEditorNode: (node: { id: string }) => ({ id: `editor-${node.id}` }),
}));

describe("WorkflowDetailPage", () => {
    beforeEach(() => {
        interactionModalMock.state = null;
        panelStateMock.isOpenNodeListPanel = false;
        vi.clearAllMocks();
    });

    it("renders the workflow detail page shell and passes workflow data to the editor", () => {
        render(<WorkflowDetailPage />);

        expect(screen.getByTestId("seo")).toHaveAttribute("data-title", "AI Workflow: Invoice Flow");
        expect(screen.getByTestId("page-title")).toHaveTextContent("Invoice Flow");
        expect(screen.getByTestId("page-description")).toHaveTextContent("Main workflow");
        expect(screen.getByTestId("workflow-editor-value")).toHaveTextContent("{\"nodes\":[]}");
        expect(screen.getByTestId("logs")).toHaveAttribute("data-workflow-id", "wf-123");
        expect(screen.getByTestId("loading-overlay")).toHaveAttribute("data-loading", "false");
    });

    it("routes page callbacks through the workflow editor and header actions", async () => {
        panelStateMock.isOpenNodeListPanel = true;

        render(<WorkflowDetailPage />);

        await act(async () => {
            fireEvent.click(screen.getByRole("button", { name: "add node" }));
            fireEvent.click(screen.getByRole("button", { name: "change editor" }));
            fireEvent.click(screen.getByRole("button", { name: "execute node" }));
            fireEvent.click(screen.getByRole("button", { name: "open node popup" }));
            fireEvent.click(screen.getByRole("button", { name: "select node" }));
            fireEvent.click(screen.getByRole("button", { name: "add log node" }));
            fireEvent.click(screen.getByRole("button", { name: "add log connection" }));
            fireEvent.click(screen.getByRole("button", { name: "edit node" }));
            fireEvent.click(screen.getByRole("button", { name: "run workflow" }));
            fireEvent.click(screen.getByRole("button", { name: "save workflow" }));
            fireEvent.click(screen.getByRole("button", { name: "select from palette" }));
        });

        expect(mocks.toggleNodeListPanel).toHaveBeenCalled();
        expect(mocks.setWorkflowData).toHaveBeenCalledWith({ nodes: [1] });
        expect(mocks.onSave).toHaveBeenCalledWith("wf-123");
        expect(mocks.onRunNode).toHaveBeenCalledWith("node-1");
        expect(mocks.onRunWorkflow).toHaveBeenCalled();
        expect(mocks.onSave).toHaveBeenLastCalledWith("wf-123", "renamed");
        expect(mocks.onSelectedNode).toHaveBeenCalled();
        expect(mocks.addLightLog).toHaveBeenCalledWith("NODE_ADDED");
        expect(mocks.addLightLog).toHaveBeenCalledWith("CONNECTION_ADDED");
        expect(mocks.setIsOpenNodesPopup).toHaveBeenCalledWith(true);
        expect(mocks.setIsOpenNodeInfoEditorModal).toHaveBeenCalledWith(true);
        expect(mocks.editorAddNode).toHaveBeenCalledWith({ id: "editor-node-x" });
    });

    it("renders the approval flow modal branch when the modal state is an approval flow viewer", () => {
        interactionModalMock.state = { payload: { type: "APPROVAL_FLOW_VIEWER" } };

        render(<WorkflowDetailPage />);

        expect(screen.getByTestId("approval-flow-modal")).toBeInTheDocument();
        expect(screen.queryByTestId("interaction-modal")).not.toBeInTheDocument();
    });

    it("renders the interaction modal branch for non-approval modal states", () => {
        interactionModalMock.state = { payload: { type: "INTERACTION" } };

        render(<WorkflowDetailPage />);

        expect(screen.getByTestId("interaction-modal")).toBeInTheDocument();
        expect(screen.queryByTestId("approval-flow-modal")).not.toBeInTheDocument();
    });
});