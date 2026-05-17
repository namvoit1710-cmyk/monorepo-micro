import { workflowProfileManagerApi, workflowValidationRuleAgentApi } from "@/lib/api";
import { IButtonAction } from "@common/components/ldc-auto-form/interfaces/component.interface";
import { toast } from "@common/components/ldc-toast";
import { isEmpty } from "lodash-es";
import { useCallback } from "react";

interface AgentApiResponse {
    message: string;
    status: string;
    session_id: string;
    data: Record<string, unknown>;
    agent_data: Record<string, unknown>;
    error?: string;
    error_code?: string;
    correlation_id: string | null;
    duration_ms: number;
    interrupted: boolean;
    interrupt_payload: unknown | null;
}

interface ValidateRuleRowParams {
    buttonAction?: Omit<IButtonAction, "actionFunc">;
    rowId?: string;
    rowData?: Record<string, unknown>;
    callback?: (data: Record<string, unknown>, error?: Record<string, unknown> | null) => void;
}

interface FormActionPayload extends ValidateRuleRowParams {
    rowIndex?: number;
}

export const useFormActions = () => {
    const validateRuleRowByKey = useCallback(async (params: ValidateRuleRowParams): Promise<Record<string, unknown> | null> => {
        const { buttonAction, rowData, callback } = params;
        const toastId = toast.loading("Validating...", "Please wait while we validate the rule row.");

        try {
            const result = await workflowValidationRuleAgentApi.post<AgentApiResponse>("api/v1/execute", {
                message: rowData?.[buttonAction.key as string] ?? "",
                parameters: {}
            });

            const { agent_data, status, error, message } = result ?? {};

            if (status === "error") {
                toast.error("Validation failed", error ?? message);
                callback?.(undefined, {message: error ?? message});
                return null;
            }

            if (agent_data && !isEmpty(agent_data)) {
                callback?.(agent_data);
                toast.success("Validation completed", "Rule row validated successfully.");
                return agent_data;
            }

            return agent_data ?? null;
        } catch (error: any) {
            toast.error(
                error?.message || "An error occurred while validating the rule row.",
                error
            );
            throw error;
        } finally {
            toast.dismiss(toastId);
        }
    }, []);

    const validateOdateByKey = useCallback(async (params: ValidateRuleRowParams): Promise<Record<string, unknown> | null> => {
        const { buttonAction, rowData, callback } = params;
        const toastId = toast.loading("Validating...", "Please wait while we validate the rule row.");

        try {
            const result = await workflowProfileManagerApi.post<AgentApiResponse>("api/v1/execute", {
                message: rowData?.[buttonAction.key as string] ?? ""
            });

            const { agent_data, status, error, message } = result ?? {};

            if (status === "error") {
                callback?.(undefined, {message: error ?? message});
                toast.error("Validation failed", error ?? message);
                return null;
            }

            if (agent_data && !isEmpty(agent_data)) {
                callback?.(agent_data);
                toast.success("Validation completed", "Rule row validated successfully.");
                return agent_data;
            }

            return agent_data ?? null;
        } catch (error: any) {
            toast.error(
                error?.message || "An error occurred while validating the rule row.",
                error
            );
            throw error;
        } finally {
            toast.dismiss(toastId);
        }
    }, []);

    const handleFormAction = useCallback(
        async (actionType: string, payload?: FormActionPayload): Promise<Record<string, unknown> | null> => {
            switch (actionType) {
                case "validate_rules_by_key":
                    return await validateRuleRowByKey(payload ?? {});
                
                case "validate_row_by_key": 
                    return await validateOdateByKey(payload ?? {});

                default:
                    console.warn(`Unknown action type: ${actionType}`);
                    return null;
            }
        },
        [validateRuleRowByKey, validateOdateByKey]
    );

    return {
        handleFormAction,
    };
};
