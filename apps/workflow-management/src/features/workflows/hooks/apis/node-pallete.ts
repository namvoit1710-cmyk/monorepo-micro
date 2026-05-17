import api from "@/lib/api"
import { queryKeyFactory } from "@common/configs/tanstack-query/query-key-factory"
import { QueryKey, queryOptions, useQuery, UseQueryOptions } from "@tanstack/react-query"
import { AxiosError } from "axios"
import { IApiErrorBody } from "../../types/api"
import { INodePalleteResponse } from "../../types/node-pallete"

const _queryWorker = queryKeyFactory("workers")

export const nodepalleteKey = {
    ..._queryWorker,
    getAllNodePalletes: () => [..._queryWorker.lists(), "get-all-node-palletes"] as const,
    getNodeComprehensive: (nodeId: string, runId: string) => [..._queryWorker.details(), "node-comprehensive", nodeId, runId] as const,
    getOutputSchemaHierarchical: (nodeId: string, runId: string) => [..._queryWorker.details(), "output-schema-hierarchical", nodeId, runId] as const,
}

type queryNodePalleteOptionsType = Omit<UseQueryOptions<INodePalleteResponse, AxiosError<IApiErrorBody>, INodePalleteResponse, QueryKey>, "queryKey" | "queryFn">

export const queryNodePalleteOptions = (options?: queryNodePalleteOptionsType) => {
    return queryOptions({
        queryKey: nodepalleteKey.getAllNodePalletes(),
        queryFn: () => api.get<INodePalleteResponse>("node-palette"),
        ...options
    })
}

export const useQueryNodePallete = (options?: queryNodePalleteOptionsType) => {
    return useQuery(queryNodePalleteOptions(options))
}