import type { FieldValues } from "@ldc/autoform";
import { useCallback } from "react";
import { buildSubmitOperations } from "../utils/buil-submit-operation";
import type { IFileRefNode } from "../utils/node-data-utils";
import type { InteractionResultType } from "./use-interaction-modal";

interface UseInteractionSubmitOptions {
    root: IFileRefNode | null;
    rootDefaultRow: Record<string, unknown> | null;
    refetchOutputData: () => Promise<{ data?: { data?: { etag?: unknown } } }>;
    resolve: ((value: InteractionResultType) => void) | undefined;
}

export function useInteractionSubmit({
    root,
    rootDefaultRow,
    refetchOutputData,
    resolve,
}: UseInteractionSubmitOptions) {
    const handleBuilderSubmit = useCallback(async (values: FieldValues) => {
        if (!root) {
            resolve?.(values);
            return;
        }

        const submitData = buildSubmitOperations(
            values,
            root,
            rootDefaultRow
        );

        const res = await refetchOutputData();
        const latestETag = res.data?.data?.etag as string | undefined;

        resolve?.({ artifacts: submitData, eTag: latestETag });
    }, [resolve, root, rootDefaultRow, refetchOutputData]);

    return { handleBuilderSubmit };
}
