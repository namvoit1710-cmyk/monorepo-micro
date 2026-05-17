import { usePrefetchQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { useEditorStore } from "../stores/editor-stores";
import { mapApiToWorkflowValue } from "../utils/node-mapper-utils";
import { queryNodePalleteOptions } from "./apis/node-pallete";
import { useWorkflowById } from "./apis/workflows";

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
            setWorkflowData(mapApiToWorkflowValue(response.data));
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