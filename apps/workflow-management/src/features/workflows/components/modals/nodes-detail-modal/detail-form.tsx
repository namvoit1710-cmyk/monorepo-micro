import { WORKER_TYPE_UPDATE_PORT } from "@/constants/config";
import useFormDropZone from "@/features/workflows/hooks/use-form-dropzone";
import useGenerateWorkerMenu from "@/features/workflows/hooks/use-merge-nodes";
import { useEditorStore } from "@/features/workflows/stores/editor-stores";
import { useLanguage } from "@/hooks/use-language";
import { IField } from "@common/components/ldc-auto-form/interfaces/component.interface";
import { useDebounceCallback } from "@common/hooks/use-debounce-callback";
import Builder from "@ldc/autoform";
import { useMemo } from "react";
import { FieldValues } from "react-hook-form";
import { useNodeDetailContext } from "./node-detail-provider";

const NodeDetailForm = () => {
    const { t } = useLanguage();
    const { builderRef, removeConnection, updateNodeView } = useNodeDetailContext()

    const formRef = useFormDropZone()

    const selectedNode = useEditorStore(s => s.selectedNode);
    const workflowData = useEditorStore(s => s.workflowData);
    const { nodeMenuItems } = useGenerateWorkerMenu()

    const selectedNodeData = useMemo(() => {
        const nodeDefId = selectedNode?.original.node_definition_id;
        const workerType = selectedNode?.original.worker_type || selectedNode?.original.worker_id;

        const node = nodeMenuItems.find((item) => {
            if (nodeDefId && item.original.node_definition_id) {
                return item.original.node_definition_id === nodeDefId;
            }
            return (item.original.id === workerType) || (item.original.worker_id === workerType);
        });

        return node?.original;
    }, [nodeMenuItems, selectedNode])

    const inputFormSchema: IField[] = useMemo(() => {
        if (!selectedNodeData) return []

        return ((selectedNodeData.input_schema as IField[]) ?? []).map(field => {
            const outputType = !field.fields?.length && field.outputType === "object" ? "string" : field.outputType

            return {
                ...field,
                outputType: outputType,
                fields: field.fields,
                fieldConfig: {
                    ...field.fieldConfig,
                    fieldWrapper: field.fieldConfig.fieldWrapper,
                    wrapperProps: {
                        ...field.fieldConfig.wrapperProps,
                        ...((field.fieldConfig.fieldWrapper === "FormItemWrapper") ? { labelSpan: "xl-12 lg-12 md-12 xs-12", fieldSpan: "xl-12 lg-12 md-12 xs-12" } : {})
                    },

                    fieldControl: field.fieldConfig.fieldControl,
                    controlProps: {
                        ...field.fieldConfig.controlProps,
                        className: "w-full",
                    }
                }
            }
        })
    }, [selectedNodeData])


    const defaultValues = useMemo(() => {
        return { parameters: selectedNode?.original.parameters ?? {} }
    }, [selectedNode])

    const handleUpdateParameters = (data: FieldValues) => {
        let parameters = data.parameters ?? {}
        if (selectedNode.original.worker_type === WORKER_TYPE_UPDATE_PORT.SWITCH) {
            const { data: cases } = data.parameters;

            const newPorts = cases?.map((caseItem, index) => ({
                id: caseItem.port_id || caseItem.field_id,
                label: caseItem.branch ?? `${index}`,
            })) ?? [];

            const parameterData = parameters.data.map(({ field_id, port_id, ...rest }) => ({ ...rest, port_id: port_id || field_id }))
            parameters.data = parameterData

            selectedNode.syncOutputSockets(newPorts, (portId) => {
                removeConnection({ sourceId: portId });
            });
        }

        selectedNode?.updateParameters(parameters)
        updateNodeView(selectedNode.id)
    }

    const debouncedValueChange = useDebounceCallback(handleUpdateParameters, 200)

    return (
        <div className="h-full w-full overflow-hidden flex flex-col gap-4">
            <div className="flex items-center justify-between px-4">
                <h5 className="uppercase font-semibold">{t("nodes.nodes_popup_parameters")}</h5>
            </div>

            <div ref={formRef} className="relative h-full flex-2 overflow-y-auto px-4">
                {!!selectedNodeData && (
                    <Builder
                        key={selectedNode?.id}
                        ref={builderRef}
                        defaultValues={defaultValues}
                        schema={{
                            fields: [
                                {
                                    outputType: "object",
                                    key: "parameters",
                                    fieldConfig: {
                                        wrapperProps: {
                                            className: "h-full",
                                        },
                                    },
                                    fields: inputFormSchema
                                }
                            ]
                        }}
                        onSubmit={handleUpdateParameters}
                        onValuesChange={debouncedValueChange}
                    />
                )}

                {!selectedNodeData && (
                    <div className="flex-2 flex flex-col items-center justify-center h-full">
                        <p className="text-sm text-gray-500 text-center">{t("nodes.node_not_found")}</p>
                    </div>
                )}
            </div>
        </div>
    )
}

export default NodeDetailForm