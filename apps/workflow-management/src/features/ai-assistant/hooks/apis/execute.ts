import { IApiErrorBody } from "@/features/workflows/types/api";
import { ICreateWorkflowWithAIPayload, ICreateWorkflowWithAIResponse } from "@/features/workflows/types/workflows";
import { workflowAgentApi } from "@/lib/api";
import { AxiosError } from "@ldc/api-sdk";
import { useMutation, UseMutationOptions } from "@ldc/tanstack-query";

export const useCreateWorkflowWithAI = (
    options?: Omit<
        UseMutationOptions<
            ICreateWorkflowWithAIResponse,
            AxiosError<IApiErrorBody>,
            ICreateWorkflowWithAIPayload
        >,
        "mutationFn"
    >,
) => {
    return useMutation({
        mutationFn: (payload: ICreateWorkflowWithAIPayload) =>
            workflowAgentApi.post<ICreateWorkflowWithAIResponse>(
                "/api/v1/execute",
                {
                    message: payload.message,
                    conv_id: payload.conv_id,
                },
            ),
        ...options,
    });
};
