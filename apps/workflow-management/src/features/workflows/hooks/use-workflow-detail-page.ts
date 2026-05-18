import { useEffect } from "react";
import { usePrefetchQuery } from "@ldc/tanstack-query";
import { useEditorStore } from "../stores/editor-stores";
import { mapApiToWorkflowValue } from "../utils/node-mapper-utils";
import { queryNodePalleteOptions } from "./apis/node-pallete";
import { useWorkflowById } from "./apis/workflows";
import type { IEditorValue } from "@ldc/workflow-editor";

export function useWorkflowDetail(workflowId: string) {
    const workflowInfo = useEditorStore((s) => s.workflowInfo);
    const setWorkflowInfo = useEditorStore((s) => s.setWorkflowInfo);
    const setWorkflowData = useEditorStore((s) => s.setWorkflowData);
    const resetEditorStore = useEditorStore((s) => s.resetEditorStore);

    usePrefetchQuery(queryNodePalleteOptions())

    const { data: response, isLoading } = useWorkflowById(workflowId, {
        enabled: !!workflowId,
    });

    useEffect(() => {
        if (response?.data) {
            const workflowData = mapApiToWorkflowValue(response.data) as IEditorValue;

            setWorkflowData(workflowData);
            setWorkflowInfo(response.data);
        }
    }, [response, setWorkflowData]);

    useEffect(() => {
        return () => resetEditorStore();
    }, [resetEditorStore]);

    return {
        workflow: workflowInfo,
        isLoading: isLoading,
    };
}