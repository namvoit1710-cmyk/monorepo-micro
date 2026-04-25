import { BuilderServices } from "@common/components/ldc-auto-form/hooks/use-builder-services";
import { useCallback, useEffect, useState } from "react";

export interface IODataParams {
    $top?: number;
    $skip?: number;
    $count?: boolean;
    $filter?: string;
    $orderby?: string;
    $search?: string;
}

export interface IUseODataFetchProps {
    odataService?: BuilderServices["odata"];
    endpoint?: string;
    pagination: {
        pageIndex: number;
        pageSize: number;
    };
    searchValue?: string;
    defaultFilter?: string;
    defaultOrderBy?: string;
}

export interface IUseODataFetchReturn<T = any> {
    data: T[];
    totalCount: number;
    loading: boolean;
    refetch: () => Promise<void>;
}

export const useODataFetch = <T = any>(
    props: IUseODataFetchProps
): IUseODataFetchReturn<T> => {
    const {
        odataService,
        endpoint,
        pagination,
        searchValue,
        defaultFilter,
        defaultOrderBy,
    } = props;

    const [data, setData] = useState<T[]>([]);
    const [totalCount, setTotalCount] = useState(0);
    const [loading, setLoading] = useState(false);

    const fetchData = useCallback(async () => {
        if (!odataService || !endpoint) return;

        setLoading(true);
        try {
            const params: IODataParams = {
                $top: pagination.pageSize,
                $skip: pagination.pageIndex * pagination.pageSize,
                $count: true,
            };

            if (defaultFilter) params.$filter = defaultFilter;
            if (defaultOrderBy) params.$orderby = defaultOrderBy;
            if (searchValue) params.$search = searchValue;

            const res = await odataService.fetch?.(endpoint, params);
            setData(res?.data || []);
            setTotalCount(res?.total_matches || 0);
        } catch (err) {
            console.error("OData fetch error:", err);
        } finally {
            setLoading(false);
        }
    }, [
        endpoint,
        pagination,
        searchValue,
        defaultFilter,
        defaultOrderBy
    ]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    return {
        data,
        totalCount,
        loading,
        refetch: fetchData,
    };
};