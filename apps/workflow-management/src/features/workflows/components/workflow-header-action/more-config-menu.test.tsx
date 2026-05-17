import { Children, cloneElement, createContext, useContext, useState, type Dispatch, type ReactElement, type ReactNode, type SetStateAction } from "react";

import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import MenuConfigSetting, { MenuActionEnum } from "./more-config-menu";

vi.mock("@/components/containers/language-provider", () => ({
    useLanguage: () => ({ t: (key: string) => key }),
}));

vi.mock("@common/components/ui/dropdown-menu", () => ({
    DropdownMenu: ({ children }: { children: ReactNode }) => {
        const [open, setOpen] = useState(false);

        return <DropdownMenuContext.Provider value={{ open, setOpen }}>{children}</DropdownMenuContext.Provider>;
    },
    DropdownMenuTrigger: ({ children }: { children: ReactNode }) => {
        const context = useContext(DropdownMenuContext);
        const child = Children.only(children) as ReactElement<{ onClick?: () => void }>;

        return cloneElement(child, {
            onClick: () => context?.setOpen((value) => !value),
        });
    },
    DropdownMenuContent: ({ children }: { children: ReactNode }) => {
        const context = useContext(DropdownMenuContext);

        if (!context?.open) {
            return null;
        }

        return <div>{children}</div>;
    },
    DropdownMenuItem: ({ children, onClick }: { children: ReactNode; onClick: () => void }) => (
        <button type="button" onClick={onClick}>
            {children}
        </button>
    ),
}));

const DropdownMenuContext = createContext<{ open: boolean; setOpen: Dispatch<SetStateAction<boolean>> } | null>(null);

describe("MenuConfigSetting", () => {
    it("renders the menu items and forwards the selected action", () => {
        const onAction = vi.fn();

        render(
            <MenuConfigSetting onAction={onAction}>
                <button type="button">open menu</button>
            </MenuConfigSetting>
        );

        expect(screen.queryByRole("button", { name: "replace_name" })).not.toBeInTheDocument();

        fireEvent.click(screen.getByRole("button", { name: "open menu" }));

        expect(screen.getByRole("button", { name: "replace_name" })).toBeInTheDocument();
        expect(screen.getByRole("button", { name: "replace_workflow_description" })).toBeInTheDocument();
        expect(screen.getByRole("button", { name: "setting_routing_path" })).toBeInTheDocument();

        fireEvent.click(screen.getByRole("button", { name: "replace_name" }));
        fireEvent.click(screen.getByRole("button", { name: "replace_workflow_description" }));
        fireEvent.click(screen.getByRole("button", { name: "setting_routing_path" }));

        expect(onAction).toHaveBeenNthCalledWith(1, MenuActionEnum.ReplaceName);
        expect(onAction).toHaveBeenNthCalledWith(2, MenuActionEnum.ReplaceDescription);
        expect(onAction).toHaveBeenNthCalledWith(3, MenuActionEnum.SettingRoutingPath);
    });
});