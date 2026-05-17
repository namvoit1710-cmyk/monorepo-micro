import { useLanguage } from "@/components/containers/language-provider";
import Builder, { BuilderRef } from "@common/components/ldc-auto-form/components/builder/builder";
import { toast } from "@common/components/ldc-toast";
import LoadingSpin from "@common/components/ldc-workflow-editor/components/rete-editor/nodes/components/loading-spin/loading-spin";
import { Button } from "@common/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@common/components/ui/dialog";
import { useQueryClient } from "@tanstack/react-query";
import { useRef } from "react";
import { nodeDefinitionKey, useCreateNodeDefinition, useUpdateNodeDefinition } from "../../hooks/apis/node-definitions";
import { nodepalleteKey } from "../../../workflows/hooks/apis/node-pallete";
import useGenerateWorkerMenu from "../../../workflows/hooks/use-merge-nodes";
import { useNodeDefinitionStore } from "../../../workflows/stores/node-definition-stores";
import { ICreateNodeDefinitionPayload, IUpdateNodeDefinitionPayload } from "../../types/node-definition";

const NodeDefinitionFormModal = () => {
    const { t } = useLanguage();

    const builderRef = useRef<BuilderRef>(null);

    const isCreateModalOpen = useNodeDefinitionStore(s => s.isCreateModalOpen);
    const isEditModalOpen = useNodeDefinitionStore(s => s.isEditModalOpen);
    const selectedDefinition = useNodeDefinitionStore(s => s.selectedDefinition);
    const closeCreateModal = useNodeDefinitionStore(s => s.closeCreateModal);
    const closeEditModal = useNodeDefinitionStore(s => s.closeEditModal);

    const isOpen = isCreateModalOpen || isEditModalOpen;
    const isEditMode = isEditModalOpen && !!selectedDefinition;

    const { nodeMenuItems } = useGenerateWorkerMenu();
    const workerOptions = nodeMenuItems
        .filter((item) => item.original.category === "worker")
        .map((item) => ({
            id: item.original.worker_id || item.original.id,
            value: item.original.name,
        }));

    const queryClient = useQueryClient();

    const invalidateQueries = () => {
        queryClient.invalidateQueries({ queryKey: nodeDefinitionKey.all });
        queryClient.invalidateQueries({ queryKey: nodepalleteKey.getAllNodePalletes() });
    };

    const { mutate: createDefinition, isPending: isCreating } = useCreateNodeDefinition({
        onSuccess: () => {
            toast.success(t("notification.success"), t("node_definitions.created_successfully"));
            invalidateQueries();
            closeCreateModal();
        },
        onError: () => {
            toast.error(t("notification.error"), t("node_definitions.create_failed"));
        },
    });

    const { mutate: updateDefinition, isPending: isUpdating } = useUpdateNodeDefinition({
        onSuccess: () => {
            toast.success(t("notification.success"), t("node_definitions.updated_successfully"));
            invalidateQueries();
            closeEditModal();
        },
        onError: () => {
            toast.error(t("notification.error"), t("node_definitions.update_failed"));
        },
    });

    const isPending = isCreating || isUpdating;

    const handleClose = () => {
        if (isEditMode) {
            closeEditModal();
        } else {
            closeCreateModal();
        }
    };

    const handleSubmit = (formData: Record<string, any>) => {
        if (!formData.name) return;

        let inputSchema = [];
        let outputSchema = [];
        let inputMapping = {};
        let outputMapping = {};
        let lockedDefaults = {};

        try {
            if (formData.input_schema) inputSchema = JSON.parse(formData.input_schema);
        } catch { /* keep empty */ }
        try {
            if (formData.output_schema) outputSchema = JSON.parse(formData.output_schema);
        } catch { /* keep empty */ }
        try {
            if (formData.input_mapping) inputMapping = JSON.parse(formData.input_mapping);
        } catch { /* keep empty */ }
        try {
            if (formData.output_mapping) outputMapping = JSON.parse(formData.output_mapping);
        } catch { /* keep empty */ }
        try {
            if (formData.locked_defaults) lockedDefaults = JSON.parse(formData.locked_defaults);
        } catch { /* keep empty */ }

        const tags = formData.tags
            ? formData.tags.split(",").map((tag: string) => tag.trim()).filter(Boolean)
            : [];

        if (isEditMode) {
            const payload: IUpdateNodeDefinitionPayload = {
                name: formData.name,
                description: formData.description,
                locked_defaults: lockedDefaults,
                input_schema: inputSchema,
                output_schema: outputSchema,
                input_mapping: inputMapping,
                output_mapping: outputMapping,
                icon: formData.icon,
                color: formData.color,
                tags,
            };
            updateDefinition({ id: selectedDefinition.id, payload });
        } else {
            const payload: ICreateNodeDefinitionPayload = {
                tenant_id: "system",
                name: formData.name,
                description: formData.description,
                base_type: formData.base_type || "TASK",
                base_worker_id: formData.base_worker_id,
                locked_defaults: lockedDefaults,
                input_schema: inputSchema,
                output_schema: outputSchema,
                input_mapping: inputMapping,
                output_mapping: outputMapping,
                icon: formData.icon,
                color: formData.color,
                tags,
            };
            createDefinition(payload);
        }
    };

    const handleSaveClick = () => {
        builderRef.current?.onSubmit();
    };

    const defaultValues = isEditMode
        ? {
            name: selectedDefinition.name,
            description: selectedDefinition.description ?? "",
            base_type: selectedDefinition.base_type,
            base_worker_id: selectedDefinition.base_worker_id,
            icon: selectedDefinition.icon ?? "",
            color: selectedDefinition.color ?? "",
            tags: selectedDefinition.tags?.join(", ") ?? "",
            locked_defaults: selectedDefinition.locked_defaults
                ? JSON.stringify(selectedDefinition.locked_defaults, null, 2)
                : "",
            input_schema: selectedDefinition.input_schema?.length
                ? JSON.stringify(selectedDefinition.input_schema, null, 2)
                : "",
            output_schema: selectedDefinition.output_schema?.length
                ? JSON.stringify(selectedDefinition.output_schema, null, 2)
                : "",
            input_mapping: selectedDefinition.input_mapping
                ? JSON.stringify(selectedDefinition.input_mapping, null, 2)
                : "",
            output_mapping: selectedDefinition.output_mapping
                ? JSON.stringify(selectedDefinition.output_mapping, null, 2)
                : "",
        }
        : {};

    const baseFields: any[] = [
        {
            outputType: "string",
            key: "name",
            fieldConfig: {
                fieldWrapper: "FormItemWrapper",
                wrapperProps: {
                    label: t("node_definitions.field_name"),
                    required: true,
                    labelSpan: "xl-12 lg-12 md-12 sm-12",
                    fieldSpan: "xl-12 lg-12 md-12 sm-12",
                },
                fieldControl: "InputControl",
                controlProps: {
                    className: "w-full",
                    placeholder: t("node_definitions.field_name_placeholder"),
                    disabled: isPending,
                },
                rules: [{ method: "required" }],
            },
        },
        {
            outputType: "string",
            key: "description",
            fieldConfig: {
                fieldWrapper: "FormItemWrapper",
                wrapperProps: {
                    label: t("node_definitions.field_description"),
                    labelSpan: "xl-12 lg-12 md-12 sm-12",
                    fieldSpan: "xl-12 lg-12 md-12 sm-12",
                },
                fieldControl: "TextareaControl",
                controlProps: {
                    placeholder: t("node_definitions.field_description_placeholder"),
                    disabled: isPending,
                },
            },
        },
        ...(!isEditMode
            ? [
                {
                    outputType: "string",
                    key: "base_type",
                    fieldConfig: {
                        fieldWrapper: "FormItemWrapper",
                        wrapperProps: {
                            label: t("node_definitions.field_base_type"),
                            required: true,
                            labelSpan: "xl-12 lg-12 md-12 sm-12",
                            fieldSpan: "xl-12 lg-12 md-12 sm-12",
                        },
                        fieldControl: "SelectControl",
                        controlProps: {
                            className: "w-full",
                            disabled: isPending,
                            options: [
                                { id: "TASK", value: "TASK" },
                            ],
                        },
                    },
                },
                {
                    outputType: "string",
                    key: "base_worker_id",
                    fieldConfig: {
                        fieldWrapper: "FormItemWrapper",
                        wrapperProps: {
                            label: t("node_definitions.field_base_worker"),
                            required: true,
                            labelSpan: "xl-12 lg-12 md-12 sm-12",
                            fieldSpan: "xl-12 lg-12 md-12 sm-12",
                        },
                        fieldControl: "ComboBoxControl",
                        controlProps: {
                            className: "w-full",
                            disabled: isPending,
                            options: workerOptions,
                            placeholder: t("node_definitions.field_base_worker_placeholder"),
                        },
                        rules: [{ method: "required" }],
                    },
                },
            ]
            : []),
        {
            outputType: "string",
            key: "icon",
            fieldConfig: {
                fieldWrapper: "FormItemWrapper",
                wrapperProps: {
                    label: t("node_definitions.field_icon"),
                    labelSpan: "xl-12 lg-12 md-12 sm-12",
                    fieldSpan: "xl-12 lg-12 md-12 sm-12",
                },
                fieldControl: "InputControl",
                controlProps: {
                    className: "w-full",
                    placeholder: "e.g. Search, CreditCard, Globe",
                    disabled: isPending,
                },
            },
        },
        {
            outputType: "string",
            key: "color",
            fieldConfig: {
                fieldWrapper: "FormItemWrapper",
                wrapperProps: {
                    label: t("node_definitions.field_color"),
                    labelSpan: "xl-12 lg-12 md-12 sm-12",
                    fieldSpan: "xl-12 lg-12 md-12 sm-12",
                },
                fieldControl: "InputControl",
                controlProps: {
                    className: "w-full",
                    placeholder: "e.g. #4285F4",
                    disabled: isPending,
                },
            },
        },
        {
            outputType: "string",
            key: "tags",
            fieldConfig: {
                fieldWrapper: "FormItemWrapper",
                wrapperProps: {
                    label: t("node_definitions.field_tags"),
                    labelSpan: "xl-12 lg-12 md-12 sm-12",
                    fieldSpan: "xl-12 lg-12 md-12 sm-12",
                },
                fieldControl: "InputControl",
                controlProps: {
                    className: "w-full",
                    placeholder: t("node_definitions.field_tags_placeholder"),
                    disabled: isPending,
                },
            },
        },
        {
            outputType: "string",
            key: "locked_defaults",
            fieldConfig: {
                fieldWrapper: "FormItemWrapper",
                wrapperProps: {
                    label: t("node_definitions.field_locked_defaults"),
                    labelSpan: "xl-12 lg-12 md-12 sm-12",
                    fieldSpan: "xl-12 lg-12 md-12 sm-12",
                },
                fieldControl: "TextareaControl",
                controlProps: {
                    className: "w-full font-mono text-xs",
                    placeholder: "{ \"method\": \"GET\", \"url\": \"https://...\" }",
                    disabled: isPending,
                    rows: 4,
                },
            },
        },
        {
            outputType: "string",
            key: "input_schema",
            fieldConfig: {
                fieldWrapper: "FormItemWrapper",
                wrapperProps: {
                    label: t("node_definitions.field_input_schema"),
                    labelSpan: "xl-12 lg-12 md-12 sm-12",
                    fieldSpan: "xl-12 lg-12 md-12 sm-12",
                },
                fieldControl: "TextareaControl",
                controlProps: {
                    className: "w-full font-mono text-xs",
                    placeholder: t("node_definitions.field_input_schema_placeholder"),
                    disabled: isPending,
                    rows: 6,
                },
            },
        },
        {
            outputType: "string",
            key: "output_schema",
            fieldConfig: {
                fieldWrapper: "FormItemWrapper",
                wrapperProps: {
                    label: t("node_definitions.field_output_schema"),
                    labelSpan: "xl-12 lg-12 md-12 sm-12",
                    fieldSpan: "xl-12 lg-12 md-12 sm-12",
                },
                fieldControl: "TextareaControl",
                controlProps: {
                    className: "w-full font-mono text-xs",
                    placeholder: t("node_definitions.field_output_schema_placeholder"),
                    disabled: isPending,
                    rows: 6,
                },
            },
        },
        {
            outputType: "string",
            key: "input_mapping",
            fieldConfig: {
                fieldWrapper: "FormItemWrapper",
                wrapperProps: {
                    label: t("node_definitions.field_input_mapping"),
                    labelSpan: "xl-12 lg-12 md-12 sm-12",
                    fieldSpan: "xl-12 lg-12 md-12 sm-12",
                },
                fieldControl: "TextareaControl",
                controlProps: {
                    className: "w-full font-mono text-xs",
                    placeholder: "{ \"query_params\": [{ \"param_name\": \"q\", \"param_value\": \"{{$custom.query}}\" }] }",
                    disabled: isPending,
                    rows: 4,
                },
            },
        },
        {
            outputType: "string",
            key: "output_mapping",
            fieldConfig: {
                fieldWrapper: "FormItemWrapper",
                wrapperProps: {
                    label: t("node_definitions.field_output_mapping"),
                    labelSpan: "xl-12 lg-12 md-12 sm-12",
                    fieldSpan: "xl-12 lg-12 md-12 sm-12",
                },
                fieldControl: "TextareaControl",
                controlProps: {
                    className: "w-full font-mono text-xs",
                    placeholder: "{ \"result\": \"{{$_output.response_body}}\" }",
                    disabled: isPending,
                    rows: 4,
                },
            },
        },
    ];

    return (
        <Dialog open={isOpen} onOpenChange={(open) => { if (!open) handleClose(); }}>
            <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col p-0 gap-0">
                <DialogHeader className="px-6 py-4 border-b border-gray-200">
                    <DialogTitle>
                        {isEditMode
                            ? t("node_definitions.edit_title")
                            : t("node_definitions.create_title")}
                    </DialogTitle>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto px-6 py-4">
                    {isOpen && (
                        <Builder
                            ref={builderRef}
                            defaultValues={defaultValues}
                            schema={{ fields: baseFields }}
                            onSubmit={handleSubmit}
                        />
                    )}
                </div>

                <DialogFooter className="px-6 py-4 border-t border-gray-200">
                    <Button variant="outline" disabled={isPending} onClick={handleClose}>
                        {t("cancel")}
                    </Button>
                    <Button disabled={isPending} onClick={handleSaveClick}>
                        <div className="flex items-center gap-2">
                            {isPending && <LoadingSpin />}
                            <span>{t("save")}</span>
                        </div>
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default NodeDefinitionFormModal;
