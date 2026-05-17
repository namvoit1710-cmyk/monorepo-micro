import { createContext, useContext } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import WorkflowFilter from "./workflow-filter";

const SelectContext = createContext<{ onValueChange?: (value: string) => void } | null>(null);

vi.mock("@/components/containers/language-provider", () => ({
    useLanguage: () => ({ t: (key: string) => key }),
}));

vi.mock("@common/hooks/use-debounce-callback", () => ({
    useDebounceCallback: (callback: (value: string) => void) => callback,
}));

vi.mock("@common/components/ui/input", () => ({
    SearchInput: ({ placeholder, value, onChange }: { placeholder: string; value: string; onChange: (event: { target: { value: string } }) => void }) => (
        <input aria-label={placeholder} placeholder={placeholder} value={value} onChange={onChange} />
    ),
}));

vi.mock("@common/components/ui/select", () => ({
    Select: ({ children, onValueChange }: { children: React.ReactNode; onValueChange: (value: string) => void }) => (
        <SelectContext.Provider value={{ onValueChange }}>{children}</SelectContext.Provider>
    ),
    SelectTrigger: ({ children }: { children: React.ReactNode }) => <button type="button">{children}</button>,
    SelectValue: ({ placeholder }: { placeholder: string }) => <span>{placeholder}</span>,
    SelectContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    SelectItem: ({ children, value }: { children: React.ReactNode; value: string }) => {
        const context = useContext(SelectContext);

        return (
            <button type="button" onClick={() => context?.onValueChange?.(value)}>
                {children}
            </button>
        );
    },
}));

describe("WorkflowFilter", () => {
    it("renders the current filter state", () => {
        render(
            <WorkflowFilter
                filter={{ search: "finance", mainFlow: false }}
                onChangeFilter={() => undefined}
            />
        );

        expect(screen.getByLabelText("search_workflow")).toHaveValue("finance");
        expect(screen.getByText("main_flow_select")).toBeInTheDocument();
    });

    it("updates the search filter when the input changes", () => {
        const onChangeFilter = vi.fn();

        render(
            <WorkflowFilter
                filter={{ search: "", mainFlow: false }}
                onChangeFilter={onChangeFilter}
            />
        );

        fireEvent.change(screen.getByLabelText("search_workflow"), {
            target: { value: "invoice" },
        });

        expect(onChangeFilter).toHaveBeenCalledWith({ search: "invoice", mainFlow: false });
    });

    it("updates the main flow filter when selecting the main flow option", () => {
        const onChangeFilter = vi.fn();

        render(
            <WorkflowFilter
                filter={{ search: "", mainFlow: false }}
                onChangeFilter={onChangeFilter}
            />
        );

        fireEvent.click(screen.getByRole("button", { name: "main_flow" }));

        expect(onChangeFilter).toHaveBeenCalledWith({ search: "", mainFlow: true });
    });
});