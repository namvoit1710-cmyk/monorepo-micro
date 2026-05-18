import api, { workflowAgentApi } from "@/lib/api";
import { AxiosError } from "@ldc/api-sdk";
import { QueryKey, queryKeyFactory, useInfiniteQuery, useMutation, UseMutationOptions, useQuery, UseQueryOptions } from "@ldc/tanstack-query";
import { IApiErrorBody } from "../../types/api";
import { IGetNodeOutputResponse, IResumeTaskPayload, IWorkflowExecutionHistoryResponse, IWorkflowExecutionParams } from "../../types/execution";
import { IWorkflowSessionResponse } from "../../types/workflow-session";
import { ICreateWorkflowPayload, ICreateWorkflowResponse, ICreateWorkflowWithAIResponse, IExecuteAIPayload, IExecuteAIResponse, IVariableSuggestionResponse, IWorkflowDetailResponse, IWorkflowListResponse, IWorkflowParams, IWorkflowSavePayload } from "../../types/workflows";

const _workflowKey = queryKeyFactory("workflows");

export const workflowKey = {
    ..._workflowKey,
    getAllWorkflows: (queryParams: IWorkflowParams) => [..._workflowKey.lists(), queryParams],
    getAllWorkflowsInfinite: (queryParams: Omit<IWorkflowParams, "$skip">) => [..._workflowKey.lists(), "infinite", queryParams],
    getWorkflowSession: (workflowId: string) => [..._workflowKey.details(), ...["workflow", workflowId, "session"]],
    getAllWorkflowExecutions: (queryParams: IWorkflowExecutionParams) => [..._workflowKey.lists(), "executions", queryParams],
    getWorkflowById: (workflowId: string) => [..._workflowKey.details(), workflowId],
    getNodeDataInfo: (runId: string, nodeId: string) => [..._workflowKey.details(), ...["workflow", runId, "nodes", nodeId, "data-info"]],
    getVariableSuggestions: (workflowId: string, nodeId: string) => [..._workflowKey.details(), ...["workflow", workflowId, "nodes", nodeId, "variable-suggestions"]],
    getNodeOutput: (runId: string, nodeId: string) => [..._workflowKey.details(), ...["workflow", runId, "nodes", nodeId, "output"]],
}


// Query workflows ---------------------

export const useWorkflowList = (queryParams: IWorkflowParams, options?: Omit<UseQueryOptions<IWorkflowListResponse, AxiosError<IApiErrorBody>, IWorkflowListResponse, QueryKey>, "queryKey" | "queryFn">) => {
    return useQuery({
        queryKey: workflowKey.getAllWorkflows(queryParams),
        queryFn: (): Promise<IWorkflowListResponse> => api.get("/workflows", { params: queryParams }),
        ...options
    })
}

const WORKFLOW_INFINITE_PAGE_SIZE = 20;

export const useWorkflowListInfinite = (
    queryParams: Omit<IWorkflowParams, "$skip">,
    options?: { enabled?: boolean }
) => {
    return useInfiniteQuery({
        queryKey: workflowKey.getAllWorkflowsInfinite(queryParams),
        queryFn: ({ pageParam }): Promise<IWorkflowListResponse> =>
            api.get("/workflows", {
                params: {
                    ...queryParams,
                    $skip: pageParam,
                    $top: WORKFLOW_INFINITE_PAGE_SIZE,
                },
            }),
        initialPageParam: 0,
        getNextPageParam: (lastPage, allPages) => {
            const fetched = allPages.length * WORKFLOW_INFINITE_PAGE_SIZE;
            return fetched < (lastPage.data.total ?? 0) ? fetched : undefined;
        },
        ...options,
    })
}

export const useWorkflowExecutionList = (queryParams: IWorkflowExecutionParams, options?: Omit<UseQueryOptions<IWorkflowExecutionHistoryResponse, AxiosError<IApiErrorBody>, IWorkflowExecutionHistoryResponse, QueryKey>, "queryKey" | "queryFn">) => {
    return useQuery({
        queryKey: workflowKey.getAllWorkflowExecutions(queryParams),
        queryFn: (): Promise<IWorkflowExecutionHistoryResponse> => api.get("/runs", { params: queryParams }),
        ...options
    })
}

export const useWorkflowById = (workflowId: string, options?: Omit<UseQueryOptions<IWorkflowDetailResponse, AxiosError<IApiErrorBody>, IWorkflowDetailResponse, QueryKey>, "queryKey" | "queryFn">) => {
    return useQuery({
        queryKey: workflowKey.getWorkflowById(workflowId),
        queryFn: (): Promise<IWorkflowDetailResponse> => api.get(`/workflows/${workflowId}`),
        enabled: !!workflowId,
        ...options
    })
}

// Query workflow session ---------------------

export const useQueryWorkflowSession = (workflowId: string, options?: Omit<UseQueryOptions<IWorkflowSessionResponse, AxiosError<IApiErrorBody>, IWorkflowSessionResponse, QueryKey>, "queryKey" | "queryFn">) => {
    return useQuery({
        queryKey: workflowKey.getWorkflowSession(workflowId),
        queryFn: (): Promise<IWorkflowSessionResponse> => api.get(`/dev-sessions/workflow/${workflowId}`),
        ...options
    })
}

// Mutation workflow session ------------------------

export const useCreateWorkflowSession = (options?: Omit<UseMutationOptions<{ ok: boolean }, AxiosError<IApiErrorBody>, { workflowId: string, draftGraphVersion: string }>, "mutationFn">) => {
    return useMutation({
        mutationFn: (
            { workflowId, draftGraphVersion }: { workflowId: string, draftGraphVersion: string }): Promise<{ ok: boolean }> => {
            return api.post("/dev-sessions", { workflow_id: workflowId, draft_graph_version: draftGraphVersion })
        },
        ...options
    })
}


// Mutation ---------------------------

export const useCreateWorkflow = (
    options?: Omit<
        UseMutationOptions<
            ICreateWorkflowResponse,
            AxiosError<IApiErrorBody>, ICreateWorkflowPayload
        >,
        "mutationFn"
    >
) => {
    return useMutation({
        mutationFn: (payload: ICreateWorkflowPayload): Promise<ICreateWorkflowResponse> =>
            api.post("/workflows", payload),
        ...options
    });
};

// export const useCreateWorkflowWithAI = (
//     options?: Omit<
//         UseMutationOptions<
//             ICreateWorkflowWithAIResponse,
//             AxiosError<IApiErrorBody>, ICreateWorkflowWithAIPayload
//         >,
//         "mutationFn"
//     >
// ) => {
//     return useMutation({
//         mutationFn: async (payload: ICreateWorkflowWithAIPayload): Promise<ICreateWorkflowWithAIResponse> => {
//             const agentUrl = import.meta.env.VITE_WORKFLOW_AGENT_URL || 
//                 "https://smdg-ai-dev-ai-workflow-workflow-supervisor-agent-qas.cfapps.br10.hana.ondemand.com";

//             const response = await fetch(`${agentUrl}/api/v1/execute`, {
//                 method: "POST",
//                 headers: {
//                     "accept": "application/json",
//                     "Content-Type": "application/json",
//                 },
//                 body: JSON.stringify({
//                     message: payload.message,
//                     conv_id: payload.conv_id || `conv_${Date.now()}`,
//                     user_id: payload.user_id || "anonymous",
//                     tenant_id: payload.tenant_id || "default",
//                     source: payload.source || "api",
//                 }),
//             });

//             if (!response.ok) {
//                 throw new Error(`AI workflow creation failed: ${response.statusText}`);
//             }

//             return response.json();
//         },
//         ...options
//     });
// };

export const useCreateWorkflowWithAI = (
    options?: Omit<
        UseMutationOptions<
            ICreateWorkflowWithAIResponse,
            AxiosError<IApiErrorBody>,
            string
        >,
        "mutationFn"
    >
) => {
    return useMutation({
        mutationFn: (message: string) =>
            workflowAgentApi.post<ICreateWorkflowWithAIResponse>(
                "/api/v1/execute",
                { message }
            ),
        ...options,
    });
};

// export const useCreateWorkflowWithAI = (
//     options?: Omit<UseMutationOptions<ICreateWorkflowWithAIResponse, AxiosError<IApiErrorBody>, ICreateWorkflowWithAIPayload>, "mutationFn">
// ) => {
//     return useMutation({
//         mutationFn: async (payload: ICreateWorkflowWithAIPayload): Promise<ICreateWorkflowWithAIResponse> => api.post("/execute", payload),
//         ...options
//     })
// }

export const useUpdateWorkflow = (
    options?: Omit<
        UseMutationOptions<
            IWorkflowDetailResponse,
            AxiosError<IApiErrorBody>, { workflowId: string, payload: IWorkflowSavePayload }
        >,
        "mutationFn"
    >
) => {
    return useMutation({
        mutationFn: (
            { workflowId, payload }: {
                workflowId: string,
                payload: IWorkflowSavePayload
            }): Promise<IWorkflowDetailResponse> => api.put(`/workflows/${workflowId}`, payload),
        ...options
    })
}

export const useUpdateWorkflowPatch = (
    options?: Omit<
        UseMutationOptions<
            { ok: boolean },
            AxiosError<IApiErrorBody>, { workflowId: string, payload: Partial<IWorkflowSavePayload> }
        >, "mutationFn"
    >
) => {
    return useMutation({
        mutationFn: ({ workflowId, payload }: { workflowId: string, payload: Partial<IWorkflowSavePayload> }): Promise<{ ok: boolean }> => {
            return api.patch(`/workflows/${workflowId}`, payload)
        },
        ...options
    })
}

export const useModifyMainFlowWorkflow = (
    options?: Omit<
        UseMutationOptions<
            { ok: boolean },
            AxiosError<IApiErrorBody>, { workflowId: string, main_flow: boolean }
        >, "mutationFn"
    >
) => {
    return useMutation({
        mutationFn: ({ workflowId, main_flow }: { workflowId: string, main_flow: boolean }): Promise<{ ok: boolean }> => {
            return api.patch(`/workflows/${workflowId}/main-flow`, { main_flow })
        },
        ...options
    })
}

export const useDeleteWorkflow = (
    options?: Omit<
        UseMutationOptions<
            { ok: boolean },
            AxiosError<IApiErrorBody>, string
        >, "mutationFn"
    >
) => {
    return useMutation({
        mutationFn: (workflowId: string): Promise<{ ok: boolean }> => api.delete(`/workflows/${workflowId}`),
        ...options
    })
}

// Execute workflow ---------------------------

export const useRunNode = (
    options?: Omit<
        UseMutationOptions<
            { ok: boolean },
            AxiosError<IApiErrorBody>, { workflowId: string, nodeId: string }
        >, "mutationFn"
    >
) => {
    return useMutation({
        mutationFn: ({ workflowId, nodeId }: { workflowId: string, nodeId: string }): Promise<{ ok: boolean }> => {
            return api.post(`/workflows/${workflowId}/nodes/${nodeId}/test`, {
                input_data: {},
                mock_variables: {}
            })
        },
        ...options
    })
}

export const useRunWorkflow = (
    options?: Omit<
        UseMutationOptions<
            { ok: boolean },
            AxiosError<IApiErrorBody>,
            {
                workflowId: string,
                config: Record<"input_data", Record<string, any>>
            }
        >, "mutationFn"
    >
) => {
    return useMutation({
        mutationFn: (
            { workflowId, config }: {
                workflowId: string,
                config?: Record<"input_data", Record<string, any>>
            }
        ): Promise<{ ok: boolean }> => {
            return api.post(`/workflows/${workflowId}/test/full`, { ...config })
        },
        ...options
    })
}

export const useStopWorkflow = (
    options?: Omit<
        UseMutationOptions<
            { ok: boolean },
            AxiosError<IApiErrorBody>,
            string
        >, "mutationFn"
    >
) => {
    return useMutation({
        mutationFn: (runId: string): Promise<{ ok: boolean }> => {
            return api.post(`/runs/${runId}/cancel`)
        },
        ...options
    })
}

export const useResumeTask = (
    options?: Omit<
        UseMutationOptions<
            { ok: boolean },
            AxiosError<IApiErrorBody>,
            { runId: string, taskId: string, payload?: IResumeTaskPayload }
        >, "mutationFn"
    >
) => {
    return useMutation({
        mutationFn: ({ runId, taskId, payload }: { runId: string, taskId: string, payload?: IResumeTaskPayload }): Promise<{ ok: boolean }> => {
            return api.post(`/runs/${runId}/tasks/${taskId}/resume`, payload || { new_input: {} })
        },
        ...options
    })
}

// Get node detail ---------------------------

export const useGetNodeVariableSuggestions = (
    { runId, nodeId }: { runId: string, nodeId: string },
    options?: Omit<
        UseQueryOptions<
            IVariableSuggestionResponse,
            AxiosError<IApiErrorBody>, IVariableSuggestionResponse
        >, "queryKey" | "queryFn"
    >
) => {
    return useQuery({
        queryKey: workflowKey.getVariableSuggestions(runId, nodeId),
        queryFn: (): Promise<IVariableSuggestionResponse> => api.get(`/runs/${runId}/nodes/${nodeId}/variable-suggestions`),
        enabled: !!runId && !!nodeId,
        ...options
    })
}

export const useGetNodeDataInfo = (
    { runId, nodeId }: { runId: string, nodeId: string },
    options?: Omit<
        UseQueryOptions<
            { ok: boolean },
            AxiosError<IApiErrorBody>, string
        >, "queryKey" | "queryFn"
    >
) => {
    return useQuery({
        queryKey: workflowKey.getNodeDataInfo(runId, nodeId),
        queryFn: (): Promise<IWorkflowDetailResponse> => api.get(`/runs/${runId}/nodes/${nodeId}/data-info`),
        enabled: !!runId && !!nodeId,
        ...options
    })
}

export const useGetNodeOutput = (
    { runId, nodeId }: { runId: string, nodeId: string },
    options?: Omit<
        UseQueryOptions<
            IGetNodeOutputResponse,
            AxiosError<IApiErrorBody>, IGetNodeOutputResponse
        >, "queryKey" | "queryFn"
    >
) => {
    return useQuery({
        queryKey: workflowKey.getNodeOutput(runId, nodeId),
        queryFn: (): Promise<IGetNodeOutputResponse> => api.get(`/runs/${runId}/nodes/${nodeId}/output`),
        enabled: !!runId && !!nodeId,
        ...options
    })
}

export const useExecuteAI = (
    options?: Omit<
        UseMutationOptions<
            IExecuteAIResponse,
            AxiosError<IApiErrorBody>,
            IExecuteAIPayload
        >, "mutationFn"
    >
) => {
    return useMutation({
        mutationFn: (payload: IExecuteAIPayload): Promise<IExecuteAIResponse> => {
            return api.post("/api/v1/execute", {
                message: payload.message,
                conv_id: payload.conv_id || "2",
                user_id: payload.user_id || "anonymous",
                tenant_id: payload.tenant_id || "default",
                source: payload.source || "api",
            })
        },
        ...options
    })
}
