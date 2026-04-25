import { useEffect, useMemo, useRef, useState } from "react";
import { useFormContext, useWatch } from "react-hook-form";
import { useBuilderContext } from "../contexts/builder.context";

export interface IServerOptionsConfig {
    endpoint: string;
    service: string;
    dependencies?: string[];
    method?: "GET" | "POST";
    params?: Record<string, string | number | boolean>;
}

export const useServerOptions = (serverOptions?: IServerOptionsConfig) => {
    const { services } = useBuilderContext();
    const { control } = useFormContext();
    const [data, setData] = useState<Record<string, unknown>[]>([]);

    const [loading, setLoading] = useState(false);
    const abortRef = useRef<AbortController | null>(null);

    const { endpoint, service, dependencies = [] } = serverOptions ?? {};

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
        if (!endpoint || !serviceHandler) return;

        if (dependencies.length > 0) {
            const hasAllDeps = dependencies.every((dep) => params[dep] != null && params[dep] !== "");
            if (!hasAllDeps) {
                setData([]);
                return;
            }
        }

        abortRef.current?.abort();
        const controller = new AbortController();
        abortRef.current = controller;

        let cancelled = false;
        setLoading(true);

        serviceHandler(endpoint, params)
            .then((response: any) => {
                if (!cancelled) {
                    setData(response?.data ?? []);
                }
            })
            .catch((error: any) => {
                if (!cancelled) {
                    console.error("Error fetching server options:", error);
                    setData([]);
                }
            })
            .finally(() => {
                if (!cancelled) setLoading(false);
            });

        return () => {
            cancelled = true;
            controller.abort();
        };
    }, [endpoint, serviceHandler, JSON.stringify(params)]);

    return { data, loading };
};