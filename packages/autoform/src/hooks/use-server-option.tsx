import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useFormContext, useWatch } from "react-hook-form";
import { useBuilderContext } from "../contexts/builder.context";
import { IServerOptionsConfig } from "../types/server-option-config";
import { PaginationState } from "@ldc/data-table";

// ============================================================================
// Interfaces
// ============================================================================

export interface IPaginationConfig {
    pageSize?: number;
}

// ============================================================================
// Utility
// ============================================================================

/**
 * Resolve nested value by dot-notation path.
 * getByPath({ data: { items: [1,2] } }, "data.items") => [1,2]
 */
const getByPath = (obj: any, path?: string): any => {
    if (!path) return obj;
    return path.split(".").reduce((acc, key) => acc?.[key], obj);
};

// ============================================================================
// Hook
// ============================================================================

export const useServerOptions = (
    serverOptions?: IServerOptionsConfig,
    paginationConfig?: IPaginationConfig
) => {
    const { services } = useBuilderContext();
    const { control } = useFormContext();
    const [data, setData] = useState<Record<string, unknown>[]>([]);
    const [loading, setLoading] = useState(false);
    const [totalCount, setTotalCount] = useState(0);
    const abortRef = useRef<AbortController | null>(null);

    const { endpoint, service, dependencies = [], responseMapping } = serverOptions ?? {};

    const enablePagination = !!paginationConfig;

    // --- Dynamic paths with sensible defaults ---
    const dataPath = responseMapping?.dataPath ?? "data.items";
    const totalPath = responseMapping?.totalPath ?? "data.count";

    const [pagination, setPagination] = useState<PaginationState>({
        pageIndex: 0,
        pageSize: paginationConfig?.pageSize ?? 10,
    });

    const [refetchVersion, setRefetchVersion] = useState(0);

    const refetch = useCallback(async () => {
        setRefetchVersion((v) => v + 1);
    }, []);

    const depValues = useWatch({
        control,
        name: dependencies.length > 0 ? dependencies : undefined,
        disabled: !dependencies.length,
    });

    const params = useMemo(() => {
        if (!dependencies.length) return {};
        return dependencies.reduce((acc, dep, index) => {
            const value = Array.isArray(depValues) ? depValues[index] : depValues;
            if (value != null && value !== "") {
                acc[dep] = value;
            }
            return acc;
        }, {} as Record<string, any>);
    }, [dependencies, depValues]);

    const serviceHandler = useMemo(() => {
        if (!service || !services) return undefined;
        const resolved = service.split(".").reduce<any>(
            (current, segment) => current?.[segment],
            services
        );
        return typeof resolved?.fetch === "function" ? resolved.fetch : undefined;
    }, [services, service]);

    useEffect(() => {
        if (enablePagination) {
            setPagination((prev) => ({ ...prev, pageIndex: 0 }));
        }
    }, [JSON.stringify(params), enablePagination]);

    useEffect(() => {
        if (!endpoint || !serviceHandler) return;

        if (dependencies.length > 0) {
            const hasAllDeps = dependencies.every(
                (dep) => params[dep] != null && params[dep] !== ""
            );
            if (!hasAllDeps) {
                setData([]);
                setTotalCount(0);
                return;
            }
        }

        abortRef.current?.abort();
        const controller = new AbortController();
        abortRef.current = controller;

        let cancelled = false;
        setLoading(true);

        const requestParams = enablePagination
            ? {
                  ...params,
                  $top: pagination.pageSize,
                  $skip: pagination.pageIndex * pagination.pageSize,
                  $count: true,
              }
            : params;

        serviceHandler(endpoint, requestParams)
            .then((response: any) => {
                if (!cancelled) {
                    const items = getByPath(response, dataPath);
                    setData(Array.isArray(items) ? items : []);

                    const total = getByPath(response, totalPath);
                    setTotalCount(typeof total === "number" ? total : 0);
                }
            })
            .catch((error: any) => {
                if (!cancelled) {
                    console.error("Error fetching server options:", error);
                    setData([]);
                    setTotalCount(0);
                }
            })
            .finally(() => {
                if (!cancelled) setLoading(false);
            });

        return () => {
            cancelled = true;
            controller.abort();
        };
    }, [
        endpoint,
        serviceHandler,
        JSON.stringify(params),
        pagination.pageIndex,
        pagination.pageSize,
        refetchVersion,
        dataPath,
        totalPath,
    ]);

    return {
        data,
        loading,
        pagination,
        setPagination,
        totalCount,
        refetch,
    };
};