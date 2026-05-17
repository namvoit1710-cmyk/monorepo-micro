import { createContext, useContext, type ReactNode } from "react";

import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import WorkflowsPage from "./workflows";

const mocks = vi.hoisted(() => ({
    navigate: vi.fn(),
    invalidateQueries: vi.fn(),
    setActiveTab: vi.fn(),
}));

const TabsContext = createContext<{ value: string; onValueChange: (value: string) => void } | null>(null);

vi.mock("@/components/containers/language-provider", () => ({
    useLanguage: () => ({ t: (key: string) => key }),
}));

vi.mock("react-router-dom", () => ({
    useNavigate: () => mocks.navigate,
}));

vi.mock("nuqs", () => ({
    parseAsString: {
        withDefault: (value: string) => value,
    },
    useQueryState: () => ["workflows", mocks.setActiveTab],
}));

vi.mock("@tanstack/react-query", () => ({
    useQueryClient: () => ({ invalidateQueries: mocks.invalidateQueries }),
}));

vi.mock("@common/components/ui/button", () => ({
    Button: ({ children, ...props }: { children: ReactNode }) => <button {...props}>{children}</button>,
}));

vi.mock("@common/components/ui/resizeable", () => ({
    ResizablePanelGroup: ({ children }: { children: ReactNode }) => <div>{children}</div>,
    ResizablePanel: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}));

vi.mock("@common/components/ui/tabs", () => ({
    Tabs: ({ value, onValueChange, children }: { value: string; onValueChange: (value: string) => void; children: ReactNode }) => (
        <TabsContext.Provider value={{ value, onValueChange }}>{children}</TabsContext.Provider>
    ),
    TabsList: ({ children }: { children: ReactNode }) => <div>{children}</div>,
    TabsTrigger: ({ value, children }: { value: string; children: ReactNode }) => {
        const context = useContext(TabsContext);

        return (
            <button type="button" onClick={() => context?.onValueChange(value)}>
                {children}
            </button>
        );
    },
    TabsContent: ({ value, children }: { value: string; children: ReactNode }) => {
        const context = useContext(TabsContext);

        if (context?.value !== value) {
            return null;
        }

        return <div>{children}</div>;
    },
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

vi.mock("@/features/workflows/components/workflow-list/workflow-list", () => ({
    default: ({ isActive }: { isActive: boolean }) => <div data-testid="workflow-list">{String(isActive)}</div>,
}));

vi.mock("@/features/workflows/components/execution-history/execution-history", () => ({
    default: ({ isActive }: { isActive: boolean }) => <div data-testid="execution-history">{String(isActive)}</div>,
}));

vi.mock("@/features/workflows/components/modals/workflow-create-modal", () => ({
    default: ({ open, onSave }: { open: boolean; onSave: (workflowId: string) => void }) => (
        <div>
            {open && <div data-testid="workflow-create-modal">open</div>}
            {open && (
                <button type="button" onClick={() => onSave("wf-new")}>save workflow</button>
            )}
        </div>
    ),
}));

vi.mock("@/features/workflows/components/panels/workflow-create-chatbot-panel", () => ({
    default: ({ onClose }: { onClose: () => void }) => (
        <div data-testid="workflow-chatbot-panel">
            <button type="button" onClick={onClose}>close chatbot</button>
        </div>
    ),
}));

describe("WorkflowsPage", () => {
    it("renders the overview content and switches tabs", () => {
        render(<WorkflowsPage />);

        expect(screen.getByTestId("page-title")).toHaveTextContent("overview");
        expect(screen.getByTestId("page-description")).toHaveTextContent("overview_description");
        expect(screen.getByTestId("workflow-list")).toHaveTextContent("true");

        fireEvent.click(screen.getByRole("button", { name: "execution_history" }));

        expect(mocks.setActiveTab).toHaveBeenCalledWith("execution-history");
    });

    it("opens the create modal and chatbot panel, then saves a new workflow", () => {
        render(<WorkflowsPage />);

        fireEvent.click(screen.getByRole("button", { name: "create_manually" }));
        expect(screen.getByTestId("workflow-create-modal")).toBeInTheDocument();

        fireEvent.click(screen.getByRole("button", { name: "create_with_ai" }));
        expect(screen.getByTestId("workflow-chatbot-panel")).toBeInTheDocument();

        fireEvent.click(screen.getByRole("button", { name: "save workflow" }));

        expect(mocks.navigate).toHaveBeenCalledWith("/workflow/wf-new");
        expect(mocks.invalidateQueries).toHaveBeenCalled();
    });
});