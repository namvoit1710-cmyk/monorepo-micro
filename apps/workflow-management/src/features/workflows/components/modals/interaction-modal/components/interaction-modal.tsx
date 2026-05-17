import { useLanguage } from "@/components/containers/language-provider";
import { SERVICE_CONFIGS } from "@/constants/config";
import { socketInstance } from "@/lib/socket";
import Builder, { BuilderRef } from "@common/components/ldc-auto-form/components/builder/builder";
import { ISchema } from "@common/components/ldc-auto-form/interfaces/component.interface";
import { toast } from "@common/components/ldc-toast";
import { Button } from "@common/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@common/components/ui/dialog";
import { Spinner } from "@common/components/ui/spinner";
import { useBuilderServices } from "@common/hooks/use-builder-services";
import { useActionEngine } from "@common/lib/action-engine/hooks/use-action-engine";
import { collectActions } from "@common/lib/action-engine/utils/collect-action";
import { cn } from "@common/lib/utils";
import { ComponentProps, useCallback, useMemo, useRef } from "react";
import { FieldValues } from "react-hook-form";
import { useQueryFileById } from "../../../../hooks/apis/file";
import { InteractionModalState } from "../../../../hooks/use-interaction-modal";
import { isLargeWrapperSchema } from "../utils/is-large-wrapper-schema";

interface IProps extends ComponentProps<typeof Dialog> {
    modalState: InteractionModalState;
}

const WorkflowInteractionModal = ({ modalState, ...props }: IProps) => {

    const { t } = useLanguage();

    const builderRef = useRef<BuilderRef>(null);

    const { title, payload, resolve } = modalState ?? {};

    const schema = useMemo<ISchema>(() => {
        let inputSchema = payload?.input_schema;
        if (typeof inputSchema === "string") {
            try {
                inputSchema = JSON.parse(inputSchema)
            } catch (error) {
                inputSchema = []
            }

            if (Array.isArray(inputSchema)) {
                return {
                    fields: inputSchema
                }
            }

            if (typeof inputSchema === "object" && !!(inputSchema as ISchema).fields.length) {
                return inputSchema;
            }
        }

        return { fields: inputSchema };
    }, [payload?.input_schema]);

    const sourceFileId = useMemo(() => {
        return (payload && "source_file_id" in payload) ? (payload as any).source_file_id : null;
    }, [payload]);
    const { data: sourceFileUrl, isLoading: isLoadingSourceFileUrl } = useQueryFileById(sourceFileId);

    const defaultData = useMemo(() => {
        if (!sourceFileId) return null;

        const dataKey = schema.fields.length > 1 ? "" : schema?.fields[0]?.key ?? "";
        const dataValue = sourceFileUrl?.data?.data ?? null;

        return dataKey ? { [dataKey]: dataValue } : dataValue;
    }, [sourceFileUrl, sourceFileId, schema]);

    const isLargeWrapperInput = useMemo(() => isLargeWrapperSchema(schema.fields), [schema.fields]);

    const handleBuilderSubmit = useCallback((values: FieldValues) => {
        resolve?.(values);
    }, [resolve]);

    const services = useBuilderServices(SERVICE_CONFIGS);
    const actionConfigs = useMemo(() => collectActions(schema), [schema]);

    const { handleFormActions, hasAction } = useActionEngine({
        actions: actionConfigs ?? [],
        services,
        builderRef,
        toast: (message, variant) => {
            switch (variant) {
                case "success":
                    toast.success(message);
                    break;
                case "error":
                    toast.error(message);
                    break;
                default:
                    toast.info(message);
            }
        },
        actionSocket: socketInstance
    });

    const onFormActions = useCallback(
        async (action: string, payload?: Record<string, unknown>) => {
            if (hasAction(action)) {
                return handleFormActions(action, payload);
            }
        },
        [handleFormActions, hasAction]
    );

    return (
        <Dialog
            {...props}
        >
            <DialogContent
                showCloseButton={false}
                className={cn(
                    "min-w-[600px] flex flex-col max-h-[90vh] overflow-hidden",
                    isLargeWrapperInput ? "sm:max-w-[95vw]!" : ""
                )}
            >
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                    <DialogDescription>
                        {payload?.instruction ?? ""}
                    </DialogDescription>
                </DialogHeader>

                <div className={cn(
                    "flex-2 overflow-auto",
                    isLargeWrapperInput && "overflow-hidden flex flex-col [&>div]:flex-2 [&>div]:overflow-hidden"
                )}>
                    {
                        !!isLoadingSourceFileUrl && <div className="w-full h-[150px] flex items-center justify-center">
                            <Spinner />
                        </div>
                    }
                    {!isLoadingSourceFileUrl &&
                        <Builder
                            ref={builderRef}
                            schema={schema}
                            defaultValues={defaultData}
                            onSubmit={handleBuilderSubmit}
                            onFormActions={onFormActions}
                        />}
                </div>

                <DialogFooter className="py-1">
                    <Button
                        variant="outline"
                        onClick={() => {
                            resolve?.(null);
                        }}
                    >
                        {t("cancel")}
                    </Button>
                    <Button
                        type="submit"
                        onClick={() => {
                            builderRef.current?.onSubmit();
                        }}
                    >
                        {t("continue")}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

export default WorkflowInteractionModal;