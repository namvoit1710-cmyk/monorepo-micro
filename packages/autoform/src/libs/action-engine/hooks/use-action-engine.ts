// ============================================================================
// useActionEngine Hook
// ============================================================================
// Bridge giữa Action Engine và Builder.
// Đọc ActionConfig[] → index by name → handleFormActions callback.
// Inject vào Builder qua onFormActions prop.
// ============================================================================

import type { SocketClient } from "@ldc/api-sdk/socket";
import { useCallback, useMemo, useRef, useState } from "react";
import { BuilderRef } from "../../../components/builder/builder";
import { runAction } from "../core/runner";
import type { ActionConfig, EngineContext, RefetchParams } from "../types";

// ----------------------------------------------------------------------------
// Types
// ----------------------------------------------------------------------------

export interface UseActionEngineOptions {
    /** Action configs — từ JSON schema hoặc fetch từ API */
    actions: ActionConfig[];

    /** Builder ref — để lấy react-hook-form methods */
    builderRef: React.RefObject<BuilderRef | null>;

    /** SocketClient instance — cho trigger_workflow step */
    actionSocket?: SocketClient;

    /** Registered API services: { governance: sdk, odata: sdk } */
    services?: Record<
        string,
        { fetch: (endpoint: string, params?: Record<string, any>) => Promise<any> }
    >;

    /** Custom handlers cho step type: "custom" */
    customHandlers?: Record<string, (ctx: EngineContext) => Promise<void>>;

    /** Refetch callback — ODataWrapper inject */
    refetchData?: (params?: RefetchParams) => Promise<void>;

    // --- UI callbacks ---
    toast?: (message: string, variant?: string) => void;
    confirm?: (message: string, title?: string) => Promise<boolean>;
    redirect?: (url: string) => void;
    closeDialog?: () => void;
    refresh?: () => void;
    onEvent?: (event: string, payload?: unknown) => void;
}

export interface UseActionEngineReturn {
    /** Callback truyền vào Builder's onFormActions */
    handleFormActions: (
        actionName: string,
        payload?: Record<string, unknown>
    ) => Promise<void>;

    /** Kiểm tra action name có config hay không */
    hasAction: (actionName: string) => boolean;

    /** True khi trigger_workflow đang chờ socket — dùng disable button */
    isWaitingWorkflow: boolean;
}

// ----------------------------------------------------------------------------
// Default UI Implementations
// ----------------------------------------------------------------------------

function defaultToast(message: string, variant?: string) {
    console.log(`[Toast][${variant ?? "info"}] ${message}`);
}

function defaultConfirm(message: string, _title?: string): Promise<boolean> {
    return Promise.resolve(window.confirm(message));
}

function defaultRedirect(url: string) {
    window.location.href = url;
}

// ----------------------------------------------------------------------------
// Hook
// ----------------------------------------------------------------------------

export function useActionEngine(
    options: UseActionEngineOptions
): UseActionEngineReturn {
    const {
        actions,
        builderRef,
        actionSocket,
        services,
        customHandlers,
        refetchData,
        toast = defaultToast,
        confirm = defaultConfirm,
        redirect = defaultRedirect,
        closeDialog,
        refresh,
        onEvent,
    } = options;

    // Guard concurrent trigger_workflow
    const [isWaitingWorkflow, setIsWaitingWorkflow] = useState(false);
    const isWaitingWorkflowRef = useRef(false);

    // Index actions by name → O(1) lookup
    const actionMap = useMemo(() => {
        const map = new Map<string, ActionConfig>();
        for (const action of actions) {
            map.set(action.action, action);
        }
        return map;
    }, [actions]);

    const hasAction = useCallback(
        (actionName: string) => actionMap.has(actionName),
        [actionMap]
    );

    const handleFormActions = useCallback(
        async (actionName: string, payload?: Record<string, unknown>) => {
            const config = actionMap.get(actionName);
            if (!config) {
                console.warn(
                    `[useActionEngine] No action config for: "${actionName}"`
                );
                return;
            }

            const methods = builderRef.current?.getMethods();
            if (!methods) {
                console.warn("[useActionEngine] Builder ref not available");
                return;
            }

            // Guard: block if another trigger_workflow is running
            const hasTriggerWorkflow = config.steps.some(
                (s) => s.type === "trigger_workflow"
            );
            if (hasTriggerWorkflow && isWaitingWorkflowRef.current) {
                console.warn(
                    `[useActionEngine] Action "${actionName}" blocked: trigger_workflow already running`
                );
                return;
            }
            if (hasTriggerWorkflow) {
                isWaitingWorkflowRef.current = true;
                setIsWaitingWorkflow(true);
            }

            // Build engine context
            const ctx: EngineContext = {
                formValues:
                    (payload?.formValues as Record<string, unknown>) ??
                    methods.getValues(),
                methods: {
                    setValue: methods.setValue,
                    getValues: methods.getValues,
                    trigger: methods.trigger,
                    setError: methods.setError,
                    reset: methods.reset,
                    clearErrors: methods.clearErrors,
                },

                // Row context
                rowId: payload?.rowId as string | undefined,
                rowIndex: payload?.rowIndex as number | undefined,
                rowData: payload?.rowData as Record<string, unknown> | undefined,
                updateRow: payload?.updateRow as
                    | ((partial: Record<string, unknown>) => void)
                    | undefined,

                // Dependencies
                customHandlers,
                refetchData: refetchData ?? undefined,
                actionSocket: actionSocket ?? undefined,
                services: services ?? undefined,

                // UI
                ui: {
                    toast,
                    confirm,
                    redirect,
                    closeDialog,
                    refresh: refresh ?? (() => builderRef.current?.setRefresh()),
                    emitEvent: onEvent,
                },
            };

            try {
                await runAction(config, ctx);
            } finally {
                if (hasTriggerWorkflow) {
                    isWaitingWorkflowRef.current = false;
                    setIsWaitingWorkflow(false);
                }
            }
        },
        [
            actionMap,
            builderRef,
            actionSocket,
            services,
            customHandlers,
            refetchData,
            toast,
            confirm,
            redirect,
            closeDialog,
            refresh,
            onEvent,
        ]
    );

    return { handleFormActions, hasAction, isWaitingWorkflow };
}