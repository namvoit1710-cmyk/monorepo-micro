import { useLanguage } from "@/components/containers/language-provider";
import Builder, { BuilderRef } from "@common/components/ldc-auto-form/components/builder/builder";
import { toast } from "@common/components/ldc-toast";
import LoadingSpin from "@common/components/ldc-workflow-editor/components/rete-editor/nodes/components/loading-spin/loading-spin";
import { Button } from "@common/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@common/components/ui/dialog";
import { ComponentProps, useRef } from "react";
import { useUpdateWorkflowPatch } from "../../hooks/apis/workflows";

interface IWorkflowRenameModalProps extends ComponentProps<typeof Dialog> {
    defaultValues?: { name: string, id: string }
    onSaved: () => void;
}

const WorkflowRenameModal = ({ defaultValues, onSaved, ...props }: IWorkflowRenameModalProps) => {
    const { t } = useLanguage();

    const builderRef = useRef<BuilderRef>(null);

    const { mutate, isPending } = useUpdateWorkflowPatch({
        onSuccess: () => {
            onSaved();
            toast.success(t("notification.workflow_updated_successfully"));
        },
        onError: (error) => {
            toast.error(error.message || t("notification.workflow_update_failed"));
        }
    })

    const handleSubmitReplaceName = (data: { name: string }) => {
        mutate({
            workflowId: defaultValues?.id,
            payload: {
                name: data.name
            }
        })
    }

    return (
        <Dialog
            {...props}
        >
            <DialogContent className="w-1/3">
                <DialogHeader>
                    <DialogTitle>{t("replace_workflow_name")}</DialogTitle>
                </DialogHeader>

                {props.open &&
                    <Builder
                        defaultValues={defaultValues}
                        schema={{
                            fields: [
                                {
                                    outputType: "string",
                                    key: "name",
                                    fieldConfig: {
                                        fieldControl: "InputControl",
                                        controlProps: {
                                            placeholder: t("enter_workflow_name"),
                                            className: "w-full"
                                        },
                                        rules: [
                                            {
                                                method: "required",
                                                message: t("enter_workflow_name")
                                            }
                                        ]
                                    },
                                }
                            ]
                        }}
                        onSubmit={handleSubmitReplaceName}
                        ref={builderRef}
                    />
                }

                <DialogFooter className="p-2">
                    <DialogClose asChild disabled={isPending}>
                        <Button variant="outline">{t("cancel")}</Button>
                    </DialogClose>
                    <Button
                        disabled={isPending}
                        onClick={() => {
                            builderRef.current?.onSubmit();
                        }}
                    >
                        {isPending ? <LoadingSpin /> : t("nodes.replace")}
                    </Button>
                </DialogFooter>
            </DialogContent>

        </Dialog>
    )
}

export default WorkflowRenameModal