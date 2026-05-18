import { useLanguage } from "@/hooks/use-language";
import { Badge } from "@ldc/ui/components/badge";
import { Button } from "@ldc/ui/components/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@ldc/ui/components/dialog";
import { WorkflowEditor, WorkflowEditorHandle } from "@ldc/workflow-editor";
import { ComponentProps, useCallback, useMemo, useRef } from "react";
import { InteractionModalEnum, InteractionModalState } from "../../../hooks/use-interaction-modal";
import { mapApprovalFlowToEditorValue } from "../../../utils/approval-flow-mapper";
import ApprovalFlowErrorBoundary from "./approval-flow-error-boundary";

interface IProps extends ComponentProps<typeof Dialog> {
    modalState: InteractionModalState;
}

/**
 * Approval Flow Viewer Modal
 * Displays real-time approval workflow status in a read-only horizontal workflow editor
 */
const ApprovalFlowModal = ({ modalState, ...props }: IProps) => {
    const { t } = useLanguage();
    const editorRef = useRef<WorkflowEditorHandle | null>(null);

    const { title, payload, resolve } = modalState ?? {};

    // Hooks must be called before any conditional returns
    const editorValue = useMemo(() => {
        if (payload?.type !== InteractionModalEnum.APPROVAL_FLOW_VIEWER) {
            return null;
        }
        try {
            return mapApprovalFlowToEditorValue(payload);
        } catch (error) {
            console.error("[ApprovalFlowModal] Failed to map approval flow data:", error);
            return null;
        }
    }, [payload]);

    const handleClose = useCallback(() => {
        resolve?.(null);
    }, [resolve]);

    // Only render if it's an approval flow type
    if (payload?.type !== InteractionModalEnum.APPROVAL_FLOW_VIEWER) {
        return null;
    }

    // Get connection status from payload
    const changeRequestId = payload?.change_request_id;
    const statusMessage = payload?.error
        ? `Error: ${payload.error}`
        : `Change Request: ${changeRequestId}`;

    return (
        <Dialog {...props}>
            <DialogContent
                showCloseButton={false}
                className="min-w-[90vw] max-w-[95vw] h-[90vh] flex flex-col overflow-hidden"
            >
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        {title || t("approval_flow.viewer")}
                        <Badge variant={payload?.error ? "destructive" : "default"}>
                            {payload?.output_port || "In Progress"}
                        </Badge>
                    </DialogTitle>
                    <DialogDescription>
                        {statusMessage}
                    </DialogDescription>
                </DialogHeader>

                <div className="flex-1 overflow-hidden">
                    <ApprovalFlowErrorBoundary>
                        {editorValue ? (
                            <WorkflowEditor
                                ref={editorRef}
                                value={editorValue}
                                readOnly={true}
                                direction="horizontal"
                                onLoadedData={() => {
                                    editorRef.current?.layout?.()
                                }}
                            />
                        ) : (
                            <div className="flex items-center justify-center h-full text-muted-foreground">
                                Failed to load approval flow data
                            </div>
                        )}
                    </ApprovalFlowErrorBoundary>
                </div>

                <DialogFooter className="py-1">
                    <div className="flex items-center justify-between w-full">
                        <div className="text-sm text-muted-foreground">
                            {payload?.nodes?.length || 0} nodes, {payload?.edges?.length || 0} connections
                        </div>
                        <Button variant="outline" onClick={handleClose}>
                            {t("close")}
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default ApprovalFlowModal;
