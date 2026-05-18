import type { IField, ISchema } from "@ldc/autoform";
import { getDefaultValues } from "@ldc/autoform";
import { useMemo } from "react";
import type { IArtifactNode } from "../types/node-data";
import { isLargeWrapperSchema } from "../utils/is-large-wrapper-schema";
import { buildArtifactDefaultValues } from "../utils/node-data-utils";
import { useQueryFileById } from "./apis/file";
import { useGetNodeDataInfo, useGetNodeSchema } from "./apis/node-data";
import type { IRequestedPayload } from "./use-interaction-modal";

export type InteractionPayload = IRequestedPayload;

export function useInteractionNodeData(payload: InteractionPayload) {
    const { data: nodeSchema, isLoading: isNodeSchemaLoading } = useGetNodeSchema(
        { runId: payload?.run_id ?? "", nodeId: payload?.node_id ?? "" },
        {
            enabled: !!payload?.node_id && !!payload?.run_id,
            staleTime: 0,
        }
    );

    const { data: nodeDataResponse, isLoading: isLoadingNodeData } = useGetNodeDataInfo(
        { runId: payload?.run_id ?? "", nodeId: payload?.node_id ?? "", side: "input" },
        {
            enabled: !!payload?.node_id && !!payload?.run_id,
            staleTime: 0,
        }
    );

    const { refetch: refetchOutputData } = useGetNodeDataInfo(
        { runId: payload?.run_id ?? "", nodeId: payload?.node_id ?? "", side: "output" },
        {
            enabled: false,
            staleTime: 0,
        }
    );

    const root = useMemo<IArtifactNode | null>(() => {
        if (!nodeDataResponse) {
            return null;
        }

        return nodeDataResponse.data.data.root;
    }, [nodeDataResponse]);

    const rootFileId = root?.file_id ?? "";

    const { data: rootFileData, isLoading: isLoadingRootFile } = useQueryFileById(rootFileId, {
        enabled: !!rootFileId,
        staleTime: 0,
    });

    const rootDefaultRow = useMemo<Record<string, unknown> | null>(() => {
        if (!rootFileData) {
            return null;
        }

        const rows = rootFileData.data.data;

        return (rows[0] as Record<string, unknown> | undefined) ?? null;
    }, [rootFileData]);

    const schema = useMemo<ISchema>(() => {
        if (!nodeSchema?.data?.schema) {
            if (isNodeSchemaLoading) return { fields: [] };
            if (payload.input_schema) return { fields: payload.input_schema };
            return { fields: [] };
        }
        return { fields: nodeSchema.data.schema };
    }, [nodeSchema, isNodeSchemaLoading, payload]);
    console.log("Node Schema:", nodeSchema, schema);

    const defaultValueFromPayload = useMemo(() => {
        const inputSchema = Array.isArray(payload.input_schema) ? payload.input_schema : [];

        return getDefaultValues(inputSchema as IField[]);
    }, [payload]);

    const defaultValues = useMemo(() => {
        const scalarDefaults: Record<string, unknown> = {};
        if (rootDefaultRow) {
            for (const [key, value] of Object.entries(rootDefaultRow)) {
                if (!key.startsWith("__")) {
                    scalarDefaults[key] = value;
                }
            }
        }

        const artifactDefaults: Record<string, string> = root
            ? buildArtifactDefaultValues(root)
            : {};

        return root ? { ...scalarDefaults, ...artifactDefaults } : defaultValueFromPayload;
    }, [rootDefaultRow, root, defaultValueFromPayload]);

    console.log("Default Values:", defaultValues, schema);

    const isLargeWrapperInput = useMemo(
        () => isLargeWrapperSchema(schema.fields),
        [schema]
    );

    const isLoading = isNodeSchemaLoading || isLoadingNodeData || isLoadingRootFile;

    return {
        schema,
        defaultValues,
        root,
        rootDefaultRow,
        isLargeWrapperInput,
        isLoading,
        refetchOutputData,
    };
}
