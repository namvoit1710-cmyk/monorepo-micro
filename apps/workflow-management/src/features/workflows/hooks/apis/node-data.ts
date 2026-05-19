import api from "@/lib/api";
import type { AxiosError } from "@ldc/api-sdk";
import type { IField } from "@ldc/autoform";
import type { UseQueryOptions } from "@ldc/tanstack-query";
import { queryKeyFactory, useQuery } from "@ldc/tanstack-query";
import type { IGetNodeDataInfoResponse } from "../../types/node-data";

const _nodeDataKey = queryKeyFactory("node-data");

const nodeDataKeys = {
    ..._nodeDataKey,
    getNodeSchema: (runId: string, nodeId: string) => [..._nodeDataKey.details(), "node-schema", runId, nodeId],
    getNodeDataInfo: (runId: string, nodeId: string, side: "input" | "output") => [..._nodeDataKey.details(), ...["workflow", runId, "nodes", nodeId, "data-info", side]],
}

export const useGetNodeSchema = (
    { runId, nodeId }: { runId: string, nodeId: string },
    options?: Omit<
        UseQueryOptions<
            { data: { schema: IField[] } },
            AxiosError<{ code?: string, errors?: string }>,
            { data: { schema: IField[] } }
        >, "queryKey" | "queryFn"
    >
) => {
    return useQuery({
        queryKey: nodeDataKeys.getNodeSchema(runId, nodeId),
        queryFn: (): Promise<{ data: { schema: IField[] } }> => api.get(`/runs/${runId}/nodes/${nodeId}/schema`),
        enabled: !!runId && !!nodeId,
        ...options
    })
}


export const useGetNodeDataInfo = (
    { runId, nodeId, side }: { runId: string, nodeId: string, side?: "input" | "output" },
    options?: Omit<
        UseQueryOptions<
            IGetNodeDataInfoResponse,
            AxiosError<{ code?: string, errors?: string }>,
            IGetNodeDataInfoResponse
        >, "queryKey" | "queryFn"
    >
) => {
    return useQuery({
        queryKey: nodeDataKeys.getNodeDataInfo(runId, nodeId, side ?? "output"),
        queryFn: async (): Promise<IGetNodeDataInfoResponse> => await api.get<IGetNodeDataInfoResponse>(`/runs/${runId}/nodes/${nodeId}/data`, {
            params: {
                side,
            },
        }),
        ...options
    })
}

export { nodeDataKeys };

