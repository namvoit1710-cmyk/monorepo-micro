import { useLanguage } from "@/components/containers/language-provider";
import { useLatestRef } from "@/hooks/use-last-ref";
import { toast } from "@common/components/ldc-toast";
import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useRef } from "react";
import { useEditorStore } from "../stores/editor-stores";
import { IWorkflowSavePayload } from "../types/workflows";
import { mapWorkflowToSavePayload } from "../utils/workflow-save-mapper";
import { useUpdateWorkflow, workflowKey } from "./apis/workflows";

interface IUseSaveWorkflowOptions {
    onSaved?: (data: { timestamp: number }) => void;
}

const useSaveWorkflow = ({ onSaved }: IUseSaveWorkflowOptions = {}) => {
    const workflowData = useEditorStore(s => s.workflowData);
    const workflowInfo = useEditorStore(s => s.workflowInfo);
    
    const { t } = useLanguage();
    const saveStartTimeRef = useRef<number | null>(null);

    const latestRef = useLatestRef({
            workflowInfo,
            workflowData,
        });

    const queryClient = useQueryClient();
    const { mutateAsync, isPending } = useUpdateWorkflow({
        onSuccess: () => {
            const timestamp = saveStartTimeRef.current ?? Date.now();
            saveStartTimeRef.current = null;

            queryClient.invalidateQueries({ queryKey: workflowKey.all })
            toast.success(t("notification.success"), t("notification.workflow_saved_successfully"))
            onSaved?.({ timestamp });
        }
    })

    const onSave = useCallback(async (workflowId: string, workflowName?: string) => {
        const { workflowInfo, workflowData } = latestRef.current;
        const payload: IWorkflowSavePayload = mapWorkflowToSavePayload({...workflowInfo, name: workflowName ?? workflowInfo.name}, workflowData)

        saveStartTimeRef.current = Date.now();

        await mutateAsync({ workflowId, payload })
    }, [])

    return { onSave, isSaving: isPending }
}

export default useSaveWorkflow;