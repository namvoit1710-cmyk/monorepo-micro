import type { Virtualizer } from "@tanstack/react-virtual";
import { createContext, useContext } from "react";
import useTableVirtualizer from "../hooks/use-table-virtualizer";
import { useTableContext } from "./table-provider";

interface VirtualizationContextValue {
    rowVirtualizer: Virtualizer<HTMLDivElement, Element>;
    columnVirtualizer: Virtualizer<HTMLDivElement, Element>;
}

const Context =
    createContext<VirtualizationContextValue | null>(null);

interface VirtualizationProviderProps {
    children: React.ReactNode;
}

const VirtualizationProvider = ({ children }: VirtualizationProviderProps) => {
    const { table, scrollContainerRef, enableVirtualization } = useTableContext();

    const { rowVirtualizer, columnVirtualizer } = useTableVirtualizer({
        table,
        enabled: enableVirtualization,
        containerRef: scrollContainerRef,
    });

    return (
        <Context.Provider value={{ rowVirtualizer, columnVirtualizer }}>
            {children}
        </Context.Provider>
    );
};

export default VirtualizationProvider;

export function useVirtualizationContext() {
    const ctx = useContext(Context);
    if (!ctx) {
        throw new Error(
            "useVirtualizationContext must be used inside <VirtualizationProvider>."
        );
    }
    return ctx;
}