import api from "@/lib/api";
import { queryKeyFactory } from "@common/configs/tanstack-query/query-key-factory";
import { useQuery } from "@tanstack/react-query";

const _fileQueryKey = queryKeyFactory("file");
export const fileQueryKeys = {
    ..._fileQueryKey,
    odataById: (file_id: string) => [..._fileQueryKey.detail("odataById", file_id)]
}

export interface IOdataFileResponse<T = any> {
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

export const getOdataFileById = <T = any>(file_id: string): Promise<IOdataFileResponse<T>> => {
    return api.get(`/files/${file_id}/odata`);
}

export const useQueryFileById = (file_id: string) => {
    return useQuery({
        queryKey: fileQueryKeys.odataById(file_id),
        queryFn: () => getOdataFileById(file_id),
        enabled: !!file_id
    });
}