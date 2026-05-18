import { useLanguage } from "@/hooks/use-language"
import { useQueryClient } from "@ldc/tanstack-query"
import { Button } from "@ldc/ui/components/button"
import { LoadingSpin } from "@ldc/workflow-editor"
import { CircleStop, MoreHorizontalIcon, PlayIcon, SaveIcon } from "lucide-react"
import { useState } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { workflowKey } from "../../hooks/apis/workflows"
import { useEditorStore } from "../../stores/editor-stores"
import WorkflowRenameDescriptionModal from "../modals/workflow-rename-description-modal"
import WorkflowRenameModal from "../modals/workflow-rename-modal"
import WorkflowRenameRoutingPathModal from "../modals/workflow-rename-routing-modal"
import MenuConfigSetting, { MenuActionEnum } from "./more-config-menu"

interface IWorkflowHeaderProps {
    workflowTitle: string
    isPrepareWorkflowExecuting?: boolean
    isRunWorkflowExecuting?: boolean
    isSaving?: boolean

    onStop: () => void;
    onExecute: () => void;
    onSave: (name?: string) => void;
}

const WorkflowDetailHeaderAction = ({
    workflowTitle,
    isPrepareWorkflowExecuting,
    isRunWorkflowExecuting,
    isSaving,
    onSave,
    onExecute,
    onStop
}: IWorkflowHeaderProps) => {
    const { t } = useLanguage()
    const navigate = useNavigate()
    const location = useLocation();
    const routerState = location.state as { listSearch?: string } | undefined;

    const workflowInfo = useEditorStore((state) => state.workflowInfo);

    const [isReplaceWorkflowNameOpen, setIsReplaceWorkflowNameOpen] = useState(false);
    const [isReplaceWorkflowDescriptionOpen, setIsReplaceWorkflowDescriptionOpen] = useState(false);
    const [isSettingRoutingPathOpen, setIsSettingRoutingPathOpen] = useState(false);

    const handleMenuAction = (action: MenuActionEnum) => {
        switch (action) {
            case MenuActionEnum.ReplaceName:
                setIsReplaceWorkflowNameOpen(true);
                break;
            case MenuActionEnum.ReplaceDescription:
                setIsReplaceWorkflowDescriptionOpen(true);
                break;
            case MenuActionEnum.SettingRoutingPath:
                setIsSettingRoutingPathOpen(true);
                break;
        }
    }

    const queryClient = useQueryClient();

    return (
        <>

            <div className="flex items-center justify-end gap-2">
                <Button
                    variant="link"
                    disabled={isSaving}
                    onClick={() => {
                        navigate(`/`, { state: routerState });
                    }}
                >
                    {t("back_to_workflow")}
                </Button>

                <Button
                    variant="outline"
                    className="border-gray-200"
                    disabled={isRunWorkflowExecuting || isPrepareWorkflowExecuting || isSaving}
                    onClick={() => onSave()}
                >
                    {isSaving ? <LoadingSpin /> : <SaveIcon strokeWidth={1.5} />}
                    {t("save")}
                </Button>

                <Button
                    disabled={isPrepareWorkflowExecuting || isSaving}
                    variant={(isRunWorkflowExecuting && !isPrepareWorkflowExecuting) ? "destructive" : "default"}
                    onClick={isRunWorkflowExecuting ? onStop : onExecute}
                >
                    {isRunWorkflowExecuting ? isPrepareWorkflowExecuting ? <LoadingSpin /> : <CircleStop /> : <PlayIcon />}
                    {(isRunWorkflowExecuting || isPrepareWorkflowExecuting) ? t("executing") : t("execute")}
                </Button>

                <MenuConfigSetting
                    onAction={handleMenuAction}
                >
                    <Button
                        id="more-config-btn"
                        variant="ghost"
                        disabled={isRunWorkflowExecuting || isPrepareWorkflowExecuting || isSaving}
                    >
                        <MoreHorizontalIcon />
                    </Button>
                </MenuConfigSetting>
            </div>

            <WorkflowRenameModal
                open={isReplaceWorkflowNameOpen}
                defaultValues={{ name: workflowTitle, id: workflowInfo?.id }}
                onOpenChange={(open) => setIsReplaceWorkflowNameOpen(open)}
                onSaved={() => {
                    queryClient.invalidateQueries({ queryKey: workflowKey.detail(workflowInfo?.id) });
                    setIsReplaceWorkflowNameOpen(false);
                }}
            />

            <WorkflowRenameDescriptionModal
                open={isReplaceWorkflowDescriptionOpen}
                defaultValues={{ id: workflowInfo?.id, description: workflowInfo?.description ?? "" }}
                onOpenChange={(open) => setIsReplaceWorkflowDescriptionOpen(open)}
                onSaved={() => {
                    queryClient.invalidateQueries({ queryKey: workflowKey.detail(workflowInfo?.id) });
                    setIsReplaceWorkflowDescriptionOpen(false);
                }}
            />

            <WorkflowRenameRoutingPathModal
                open={isSettingRoutingPathOpen}
                defaultValues={{ id: workflowInfo?.id, routing_path: workflowInfo?.routing_path ?? "" }}
                onOpenChange={(open) => setIsSettingRoutingPathOpen(open)}
                onSaved={() => {
                    queryClient.invalidateQueries({ queryKey: workflowKey.detail(workflowInfo?.id) });
                    setIsSettingRoutingPathOpen(false);
                }}
            />
        </>
    )
}

export default WorkflowDetailHeaderAction

function useWorkflowStore(arg0: (state: any) => any) {
    throw new Error("Function not implemented.")
}
