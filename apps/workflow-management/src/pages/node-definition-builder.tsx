import Page from "@/components/containers/page";
import BuilderHeader from "@/features/node-definitions/components/node-definition-builder/builder-header";
import InputMappingEditor, {
    IMappingEntry,
    mappingEntriesToObject,
    objectToMappingEntries,
} from "@/features/node-definitions/components/node-definition-builder/input-mapping-editor";
import KeyValueEditor, {
    IKeyValuePair,
    ISuggestion,
    keyValuePairsToObject,
    objectToKeyValuePairs,
} from "@/features/node-definitions/components/node-definition-builder/key-value-editor";
import LockedDefaultsEditor, {
    ILockedDefaultEntry,
    entriesToLockedDefaults,
    lockedDefaultsToEntries,
} from "@/features/node-definitions/components/node-definition-builder/locked-defaults-editor";
import NodeDefinitionTestTab from "@/features/node-definitions/components/node-definition-builder/node-definition-test-tab";
import SchemaFieldList, {
    ISchemaFieldItem,
    autoFormToSchemaFields,
    schemaFieldsToAutoForm,
} from "@/features/node-definitions/components/node-definition-builder/schema-field-list";
import SchemaPreview from "@/features/node-definitions/components/node-definition-builder/schema-preview";
import {
    nodeDefinitionKey,
    useCreateNodeDefinition,
    useNodeDefinitionById,
    useUpdateNodeDefinition,
} from "@/features/node-definitions/hooks/apis/node-definitions";
import LoadingOverlay from "@/features/workflows/components/loading-overlay/loading-overlay";
import { nodepalleteKey } from "@/features/workflows/hooks/apis/node-pallete";
import useGenerateWorkerMenu from "@/features/workflows/hooks/use-merge-nodes";
import { useLanguage } from "@/hooks/use-language";
import { Builder, BuilderRef } from "@ldc/autoform";
import { useQueryClient } from "@ldc/tanstack-query";
import { toast } from "@ldc/ui/blocks/toast/toast";
import { ResizablePanel, ResizablePanelGroup } from "@ldc/ui/components/resizable";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@ldc/ui/components/tabs";
import { DynamicNodeIcon } from "@ldc/workflow-editor";
import { useCallback, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

const NodeDefinitionBuilderPage = () => {
    const { t } = useLanguage();
    const { definitionId } = useParams();
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const isNew = definitionId === "new";
    const builderRef = useRef<BuilderRef>(null);

    // Fetch existing definition
    const { data: definitionResponse, isLoading } = useNodeDefinitionById(
        isNew ? "" : definitionId!,
        { enabled: !isNew && !!definitionId }
    );
    const definition = definitionResponse?.data;

    // Visual state for schema builders
    const [inputSchemaFields, setInputSchemaFields] = useState<ISchemaFieldItem[]>([]);
    const [outputSchemaFields, setOutputSchemaFields] = useState<ISchemaFieldItem[]>([]);
    const [lockedDefaults, setLockedDefaults] = useState<ILockedDefaultEntry[]>([]);
    const [inputMapping, setInputMapping] = useState<IMappingEntry[]>([]);
    const [outputMapping, setOutputMapping] = useState<IKeyValuePair[]>([]);

    // Track selected base worker id
    const [selectedWorkerId, setSelectedWorkerId] = useState<string>("");

    // Basic info state for header display
    const [basicInfo, setBasicInfo] = useState<{
        name?: string; description?: string; icon?: string; color?: string;
    }>({});

    // Populate state from loaded definition (render-time adjustment)
    const [prevDefinition, setPrevDefinition] = useState(definition);
    if (definition && definition !== prevDefinition) {
        setPrevDefinition(definition);
        setSelectedWorkerId(definition.base_worker_id ?? "");
        setInputSchemaFields(autoFormToSchemaFields(definition.input_schema ?? []));
        setOutputSchemaFields(autoFormToSchemaFields(definition.output_schema ?? []));
        setInputMapping(objectToMappingEntries(definition.input_mapping));
        setOutputMapping(objectToKeyValuePairs(definition.output_mapping));
        setBasicInfo({
            name: definition.name,
            description: definition.description,
            icon: definition.icon,
            color: definition.color,
        });
    }

    // Available workers for base_worker_id dropdown
    const { nodeMenuItems } = useGenerateWorkerMenu();
    const workerNodes = useMemo(
        () => nodeMenuItems.filter((item) => item.original?.category === "worker"),
        [nodeMenuItems]
    );
    const workerOptions = useMemo(
        () => workerNodes.map((item) => ({
            id: item.original?.worker_id || item.original?.id,
            value: item.original?.name,
        })),
        [workerNodes]
    );

    // Get the selected worker's input_schema for locked defaults
    const selectedWorkerData = useMemo(() => {
        if (!selectedWorkerId || !workerNodes.length) return undefined;
        return workerNodes.find(
            (w) => w.original?.id === selectedWorkerId || w.original?.worker_id === selectedWorkerId
        )?.original;
    }, [selectedWorkerId, workerNodes]);

    const selectedWorkerSchema = selectedWorkerData?.input_schema;

    // Initialize locked defaults when worker schema changes (render-time adjustment)
    const [prevWorkerSchema, setPrevWorkerSchema] = useState(selectedWorkerSchema);
    if (selectedWorkerSchema !== prevWorkerSchema) {
        setPrevWorkerSchema(selectedWorkerSchema);
        if (selectedWorkerSchema?.length) {
            const existingDefaults = definition?.locked_defaults ?? undefined;
            setLockedDefaults(
                lockedDefaultsToEntries(existingDefaults, selectedWorkerSchema)
            );
        }
    }

    // Autocomplete suggestions for output mapping editor
    const outputMappingKeySuggestions = useMemo<ISuggestion[]>(() => {
        return inputSchemaFields
            .filter((f) => f.key)
            .map((f) => ({
                value: f.key,
                label: f.label || f.key,
                description: "Matches input field name",
            }));
    }, [inputSchemaFields]);

    const outputMappingValueSuggestions = useMemo<ISuggestion[]>(() => {
        const workerOutputFields = [
            { key: "status_code", type: "number", desc: "HTTP status code" },
            { key: "response_headers", type: "object", desc: "Response headers" },
            { key: "response_body", type: "string | object", desc: "Parsed response body" },
            { key: "content_type", type: "string", desc: "Content-Type header" },
            { key: "elapsed_ms", type: "number", desc: "Request duration (ms)" },
            { key: "is_success", type: "boolean", desc: "true if 2xx status" },
            { key: "final_url", type: "string", desc: "Final URL after redirects" },
        ];

        const suggestions: ISuggestion[] = workerOutputFields.map((f) => ({
            value: `{{$_output.${f.key}}}`,
            label: f.key,
            description: `${f.type} — ${f.desc}`,
        }));

        suggestions.push(
            {
                value: "{{$_output.response_body.",
                label: "response_body.<path>",
                description: "Access nested response data",
            },
        );

        return suggestions;
    }, []);

    // Mutations
    const invalidateQueries = useCallback(() => {
        queryClient.invalidateQueries({ queryKey: nodeDefinitionKey.all });
        queryClient.invalidateQueries({ queryKey: nodepalleteKey.getAllNodePalletes() });
    }, [queryClient]);

    const { mutate: createDefinition, isPending: isCreating } = useCreateNodeDefinition({
        onSuccess: (res: any) => {
            toast.success(t("notification.success"), t("node_definitions.created_successfully"));
            invalidateQueries();
            navigate(`/node-definitions/${res.data.id}`, { replace: true });
        },
        onError: () => toast.error(t("notification.error"), t("node_definitions.create_failed")),
    });

    const { mutate: updateDefinition, isPending: isUpdating } = useUpdateNodeDefinition({
        onSuccess: () => {
            toast.success(t("notification.success"), t("node_definitions.updated_successfully"));
            invalidateQueries();
        },
        onError: () => toast.error(t("notification.error"), t("node_definitions.update_failed")),
    });

    const isSaving = isCreating || isUpdating;

    // Handle basic info changes for header preview + track worker selection
    const handleBasicInfoChange = useCallback((values: Record<string, any>) => {
        setBasicInfo({
            name: values.name,
            description: values.description,
            icon: values.icon,
            color: values.color,
        });
        if (values.base_worker_id && values.base_worker_id !== selectedWorkerId) {
            setSelectedWorkerId(values.base_worker_id);
        }
    }, [selectedWorkerId]);

    // Submit handler
    const handleSave = useCallback(() => {
        builderRef.current?.onSubmit();
    }, []);

    const handleFormSubmit = useCallback(
        (formData: Record<string, any>) => {
            if (!formData.name) return;

            const tags = formData.tags
                ? formData.tags.split(",").map((t: string) => t.trim()).filter(Boolean)
                : [];

            const payload = {
                name: formData.name,
                description: formData.description || "",
                icon: formData.icon || "",
                color: formData.color || "",
                tags,
                locked_defaults: entriesToLockedDefaults(lockedDefaults),
                input_schema: schemaFieldsToAutoForm(inputSchemaFields),
                output_schema: schemaFieldsToAutoForm(outputSchemaFields),
                input_mapping: mappingEntriesToObject(inputMapping),
                output_mapping: keyValuePairsToObject(outputMapping),
            };

            if (isNew) {
                createDefinition({
                    ...payload,
                    tenant_id: "system",
                    base_type: formData.base_type || "TASK",
                    base_worker_id: formData.base_worker_id || "",
                });
            } else {
                updateDefinition({ id: definitionId!, payload });
            }
        },
        [
            isNew, definitionId, inputSchemaFields, outputSchemaFields,
            lockedDefaults, inputMapping, outputMapping,
            createDefinition, updateDefinition,
        ]
    );

    // Default form values
    const defaultValues = useMemo(() => {
        if (isNew) return {
            ...basicInfo,
            base_worker_id: selectedWorkerId ?? "",
            base_type: "TASK",
        };
        if (!definition) return {};
        return {
            name: definition.name ?? "",
            description: definition.description ?? "",
            base_type: definition.base_type ?? "TASK",
            base_worker_id: selectedWorkerId ?? "",
            icon: definition.icon ?? "",
            color: definition.color ?? "",
            tags: definition.tags?.join(", ") ?? "",
        };
    }, [isNew, definition, selectedWorkerId]);

    // General info form schema
    const generalInfoSchema = useMemo(() => {
        const fields: any[] = [
            {
                outputType: "string",
                key: "name",
                fieldConfig: {
                    fieldWrapper: "FormItemWrapper",
                    wrapperProps: {
                        label: t("node_definition_builder.info_name"),
                        required: true,
                        labelSpan: "xl-4 lg-4 md-12 sm-12",
                        fieldSpan: "xl-8 lg-8 md-12 sm-12",
                    },
                    fieldControl: "InputControl",
                    controlProps: {
                        className: "w-full",
                        placeholder: t("node_definition_builder.info_name_placeholder"),
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
                        label: t("node_definition_builder.info_description"),
                        labelSpan: "xl-4 lg-4 md-12 sm-12",
                        fieldSpan: "xl-8 lg-8 md-12 sm-12",
                    },
                    fieldControl: "TextareaControl",
                    controlProps: {
                        placeholder: t("node_definition_builder.info_description_placeholder"),
                    },
                },
            },
        ];

        if (isNew) {
            fields.push(
                {
                    outputType: "string",
                    key: "base_worker_id",
                    fieldConfig: {
                        fieldWrapper: "FormItemWrapper",
                        wrapperProps: {
                            label: t("node_definition_builder.info_base_worker"),
                            required: true,
                            labelSpan: "xl-4 lg-4 md-12 sm-12",
                            fieldSpan: "xl-8 lg-8 md-12 sm-12",
                        },
                        fieldControl: "SelectControl",
                        controlProps: {
                            className: "w-full",
                            options: workerOptions,
                            placeholder: t("node_definition_builder.info_base_worker_placeholder"),
                        },
                        rules: [{ method: "required" }],
                    },
                }
            );
        }

        fields.push(
            {
                outputType: "string",
                key: "icon",
                fieldConfig: {
                    fieldWrapper: "FormItemWrapper",
                    wrapperProps: {
                        label: t("node_definition_builder.info_icon"),
                        labelSpan: "xl-4 lg-4 md-12 sm-12",
                        fieldSpan: "xl-8 lg-8 md-12 sm-12",
                    },
                    fieldControl: "InputControl",
                    controlProps: {
                        className: "w-full",
                        placeholder: "e.g. Search, CreditCard, Globe",
                    },
                },
            },
            {
                outputType: "string",
                key: "color",
                fieldConfig: {
                    fieldWrapper: "FormItemWrapper",
                    wrapperProps: {
                        label: t("node_definition_builder.info_color"),
                        labelSpan: "xl-4 lg-4 md-12 sm-12",
                        fieldSpan: "xl-8 lg-8 md-12 sm-12",
                    },
                    fieldControl: "InputControl",
                    controlProps: { className: "w-full", placeholder: "#4285F4" },
                },
            },
            {
                outputType: "string",
                key: "tags",
                fieldConfig: {
                    fieldWrapper: "FormItemWrapper",
                    wrapperProps: {
                        label: t("node_definition_builder.info_tags"),
                        labelSpan: "xl-4 lg-4 md-12 sm-12",
                        fieldSpan: "xl-8 lg-8 md-12 sm-12",
                    },
                    fieldControl: "InputControl",
                    controlProps: {
                        className: "w-full",
                        placeholder: t("node_definition_builder.info_tags_placeholder"),
                    },
                },
            }
        );

        return fields;
    }, [t, isNew, workerOptions]);

    // Tab navigation
    const [activeSection, setActiveSection] = useState<string>("general");
    const sections = [
        { id: "general", label: t("node_definition_builder.section_general") },
        { id: "locked_defaults", label: t("node_definition_builder.section_locked_defaults") },
        { id: "input_schema", label: t("node_definition_builder.section_input_schema") },
        // { id: "output_schema", label: t("node_definition_builder.section_output_schema") },
        { id: "mappings", label: t("node_definition_builder.section_mappings") },
        ...(!isNew ? [{ id: "test", label: t("node_definition_builder.section_test") }] : []),
    ];

    return (
        <Page>
            <Page.Header
                title={
                    <div className="flex items-center gap-2">
                        <div
                            className="p-2 rounded-lg"
                            style={{
                                color: basicInfo.color || "#3b82f6",
                                backgroundColor: basicInfo.color
                                    ? `color-mix(in srgb, ${basicInfo.color} 10%, transparent)`
                                    : "color-mix(in srgb, #3b82f6 10%, transparent)",
                            }}
                        >
                            <DynamicNodeIcon name={basicInfo.icon || "box"} fallbackIconName="box" className="size-3" />
                        </div>
                        <h3 className="text-md font-medium">
                            {basicInfo.name || (isNew ? t("node_definition_builder.new_title") : t("node_definition_builder.title"))}
                        </h3>
                    </div>
                }
                description={basicInfo.description}
                actions={
                    <BuilderHeader
                        isSaving={isSaving}
                        onSave={handleSave}
                    />
                }
            />

            <div className="flex flex-col h-full w-full flex-2 overflow-hidden relative">
                <Tabs
                    value={activeSection}
                    onValueChange={setActiveSection}
                    className="flex-1 flex flex-col overflow-hidden"
                >
                    <TabsList variant="line" className="px-4 border-b border-b-border justify-start w-full">
                        {sections.map((section) => (
                            <TabsTrigger
                                key={section.id}
                                value={section.id}
                                className="flex-0 cursor-pointer data-active:after:bg-primary"
                            >
                                {section.label}
                            </TabsTrigger>
                        ))}
                    </TabsList>

                    {/* General */}
                    <TabsContent value="general" className="flex-1 overflow-y-auto m-0">
                        <div className="p-4 w-full">
                            {(isNew || definition) && (
                                <Builder
                                    ref={builderRef}
                                    key={definition?.id || "new"}
                                    defaultValues={defaultValues}
                                    schema={{ fields: generalInfoSchema }}
                                    onSubmit={handleFormSubmit}
                                    onValuesChange={handleBasicInfoChange}
                                />
                            )}
                        </div>
                    </TabsContent>

                    {/* Input Schema */}
                    <TabsContent value="input_schema" className="flex-2 w-full overflow-hidden">
                        <ResizablePanelGroup className="flex-1 p-6 overflow-y-auto">
                            <ResizablePanel>
                                <SchemaFieldList
                                    title={t("node_definition_builder.input_fields_title")}
                                    fields={inputSchemaFields}
                                    onChange={setInputSchemaFields}
                                />
                            </ResizablePanel>

                            <ResizablePanel>
                                <SchemaPreview
                                    schema={inputSchemaFields}
                                    title={t("node_definition_builder.live_preview")}
                                />
                            </ResizablePanel>
                        </ResizablePanelGroup>

                    </TabsContent>

                    {/* Output Schema */}
                    <TabsContent value="output_schema" className="flex-2 w-full h-full overflow-auto p-4">
                        <SchemaFieldList
                            title={t("node_definition_builder.output_fields_title")}
                            fields={outputSchemaFields}
                            onChange={setOutputSchemaFields}
                        />
                    </TabsContent>

                    {/* Locked Defaults */}
                    <TabsContent value="locked_defaults" className="flex-2 overflow-y-auto p-4">
                        <LockedDefaultsEditor
                            entries={lockedDefaults}
                            onChange={setLockedDefaults}
                        />
                    </TabsContent>

                    {/* Mappings */}
                    <TabsContent value="mappings" className="flex-2 overflow-y-auto p-4">
                        <div className="flex flex-col gap-8">
                            <InputMappingEditor
                                entries={inputMapping}
                                onChange={setInputMapping}
                                customFields={inputSchemaFields}
                            />

                            <KeyValueEditor
                                title={t("node_definition_builder.output_mapping_title")}
                                description={t("node_definition_builder.output_mapping_desc")}
                                pairs={outputMapping}
                                onChange={setOutputMapping}
                                keyPlaceholder="output_name"
                                valuePlaceholder="{{$_output.response_body}}"
                                keyLabel={t("node_definition_builder.output_name")}
                                valueLabel={t("node_definition_builder.expression")}
                                keySuggestions={outputMappingKeySuggestions}
                                valueSuggestions={outputMappingValueSuggestions}
                            />
                        </div>
                    </TabsContent>

                    {/* Test */}
                    {!isNew && (
                        <TabsContent value="test" className="flex-2 w-full h-full overflow-hidden">
                            <NodeDefinitionTestTab
                                definitionId={definitionId!}
                                inputSchema={inputSchemaFields}
                            />
                        </TabsContent>
                    )}
                </Tabs>

                <LoadingOverlay isLoading={isLoading} />
            </div>
        </Page>
    );
};

export default NodeDefinitionBuilderPage;
