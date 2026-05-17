import { useLanguage } from "@/components/containers/language-provider";
import Builder, { BuilderRef } from "@common/components/ldc-auto-form/components/builder/builder";
import { toast } from "@common/components/ldc-toast";
import LoadingSpin from "@common/components/ldc-workflow-editor/components/rete-editor/nodes/components/loading-spin/loading-spin";
import { Button } from "@common/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@common/components/ui/dialog";
import { ComponentProps, useRef } from "react";
import { useUpdateWorkflowPatch } from "../../hooks/apis/workflows";

interface IWorkflowRenameDescriptionModalProps extends ComponentProps<typeof Dialog> {
    defaultValues?: { description: string, id: string }
    onSaved: () => void;
}

const WorkflowRenameDescriptionModal = ({ defaultValues, onSaved, ...props }: IWorkflowRenameDescriptionModalProps) => {
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

    const handleSubmitReplaceName = (data: { description: string }) => {
        mutate({
            workflowId: defaultValues?.id,
            payload: {
                description: data.description
            }
        })
    }

    return (
        <Dialog
            {...props}
        >
            <DialogContent className="w-1/3">
                <DialogHeader>
                    <DialogTitle>{t("replace_workflow_description")}</DialogTitle>
                </DialogHeader>

                {props.open &&
                    <Builder
                        defaultValues={defaultValues}
                        schema={{
                            fields: [
                                {
                                    outputType: "string",
                                    key: "description",
                                    fieldConfig: {
                                        fieldControl: "TextareaControl",
                                        controlProps: {
                                            placeholder: t("enter_workflow_description"),
                                            className: "w-full"
                                        },
                                        rules: [
                                            {
                                                method: "required",
                                                message: t("enter_workflow_description")
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
                    <DialogClose asChild>
                        <Button variant="outline" disabled={isPending}>{t("cancel")}</Button>
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

export default WorkflowRenameDescriptionModal