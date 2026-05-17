import api from "@/lib/api";
import { queryKeyFactory } from "@common/configs/tanstack-query/query-key-factory";
import { UseMutateFunction, useMutation, useQuery, UseQueryOptions } from "@tanstack/react-query";
import { IConfigParameter, IConfigParametersResponse } from "../../types/configs";

const _configKeys = queryKeyFactory("workflow-config");

export const configKeys = {
    ..._configKeys,
    getAllConfigParameters: () => [..._configKeys.lists(), "get-all-config-parameters"],
};

const getAllConfigParameters = async (workflowId: string): Promise<IConfigParametersResponse> => {
    return api.get(`/workflows/${workflowId}/config/parameters`)
};

export const useQueryConfigParameters = (
    workflowId: string,
    options?: Omit<UseQueryOptions<Awaited<ReturnType<typeof getAllConfigParameters>>>, "queryKey" | "queryFun">
) => {
    return useQuery({
        queryKey: configKeys.getAllConfigParameters(),
        queryFn: () => getAllConfigParameters(workflowId),
        ...options,
    })
}

const updateConfigParameters = async (workflowId: string, payload: { parameters: IConfigParameter[] }) => {
    return api.put(`/workflows/${workflowId}/config/parameters`, payload)
}
export const useMutateConfigParameters = (options?: Omit<UseMutateFunction<Awaited<ReturnType<typeof updateConfigParameters>>>, "mutationFn">) => {
    return useMutation({
        mutationFn: (payload: { workflowId: string, parameters: IConfigParameter[] }) => updateConfigParameters(payload.workflowId, { parameters: payload.parameters }),
        ...options,
    })
}