import { IGroupNodePallete } from "@/features/workflows/types/node-pallete"
import api from "@/lib/api"
import { queryKeyFactory } from "@common/configs/tanstack-query/query-key-factory"
import { useQuery } from "@tanstack/react-query"

const _queryGroupNode = queryKeyFactory("group-nodes")

export const groupNodeKey = {
    ..._queryGroupNode,
    getAllGroupNodes: () => [..._queryGroupNode.lists(), "get-all-group-nodes"] as const,
}

export const useQueryGroupNode = () => {
    return useQuery({
        queryKey: groupNodeKey.getAllGroupNodes(),
        queryFn: () => api.get<{ data: IGroupNodePallete[] }>("/groups")
    })
}