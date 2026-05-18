import api from "@/lib/api";
import type { AxiosError } from "@ldc/api-sdk";
import type { UseQueryOptions } from "@ldc/tanstack-query";
import { queryKeyFactory, useQuery } from "@ldc/tanstack-query";

const _fileQueryKey = queryKeyFactory("file");
export const fileQueryKeys = {
    ..._fileQueryKey,
    odataById: (file_id: string) => [..._fileQueryKey.detail("odataById", file_id)]
}

export interface IOdataFileResponse<T = unknown> {
    status: string;
    data: {
        file_id: string;
        total_matches: number;
        data: T[];
    };
}

export const getFileById = (file_id: string): Promise<Blob> => {
    return api.get(`/files/${file_id}`, {
        responseType: "blob",
    });
}

export const getOdataFileById = <T = unknown>(file_id: string): Promise<IOdataFileResponse<T>> => {
    return api.get(`/files/${file_id}/odata`);
}

export const useQueryFileById = (
    file_id: string,
    options?: Omit<
        UseQueryOptions<
            IOdataFileResponse,
            AxiosError<{ code?: string, errors?: string }>,
            IOdataFileResponse
        >,
        "queryKey" | "queryFn"
    >
) => {
    return useQuery({
        queryKey: fileQueryKeys.odataById(file_id),
        queryFn: (): Promise<IOdataFileResponse<unknown>> => getOdataFileById(file_id),
        enabled: !!file_id,
        ...options
    });
}