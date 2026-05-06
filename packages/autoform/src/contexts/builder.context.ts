import type { ComponentType } from "react";
import { createContext, useContext } from "react";
import type { FieldComponentProps, FieldWrapperProps, ISchema } from "../types/schema";

export type BuilderServiceHandler = (endpoint: string, params: Record<string, any>) => unknown;
export interface BuilderServices {
    [key: string]: BuilderServiceHandler | BuilderServices;
}

interface IBuilderContext {
    schema: ISchema;
    fieldComponent: Record<string, ComponentType<FieldComponentProps> | null>;
    wrapperComponent: Record<string, ComponentType<FieldWrapperProps> | null>;

    services?: BuilderServices;

    registerRefetch?: (key: string, fn: () => Promise<void>) => void;
    unregisterRefetch?: (key: string) => void;

    refresh?: boolean;
    setRefresh?: (refresh: boolean) => void;

    onFormActions?: (action: string, payload?: Record<string, unknown>) => Promise<void> | void | Record<string, unknown> | null;
}

const BuilderContext = createContext<IBuilderContext | null>(null);

export const BuilderProvider = BuilderContext.Provider;

export const useBuilderContext = () => {
    const context = useContext(BuilderContext);
    if (!context) {
        throw new Error(
            "useBuilderContext must be used within an BuilderProvider"
        );
    }

    return context;
};
