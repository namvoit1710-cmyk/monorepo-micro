import { IWorkflowSchemaField } from "@/features/workflows/types/workflows";
import { useLanguage } from "@/hooks/use-language";
import { Button } from "@ldc/ui/components/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@ldc/ui/components/tabs";
import { useDebounceCallback } from "@ldc/ui/hooks/use-debounce-callback";
import { Editor } from "@monaco-editor/react";
import { PlusIcon } from "lucide-react";
import { useCallback, useState } from "react";
import SchemaFieldEditor, { ISchemaFieldItem } from "./schema-field-editor";
export type { ISchemaFieldItem } from "./schema-field-editor";

interface SchemaFieldListProps {
    title: string;
    fields: ISchemaFieldItem[];
    onChange: (fields: ISchemaFieldItem[]) => void;
    readonly?: boolean;
}

export const createEmptyField = (): ISchemaFieldItem => ({
    key: "",
    label: "",
    outputType: "string",
    fieldControl: "InputControl",
    required: false,
    placeholder: "",
    description: "",
    options: "",
});

export function schemaFieldsToAutoForm(fields: ISchemaFieldItem[]): IWorkflowSchemaField[] {
    return fields
        .filter((f) => f.key)
        .map((f) => {
            const rules: Record<string, any>[] = [];
            if (f.required) rules.push({ method: "required" });

            const controlProps: Record<string, any> = {};
            if (f.placeholder) controlProps.placeholder = f.placeholder;

            if (
                (f.fieldControl === "SelectControl" ||
                    f.fieldControl === "ComboBoxControl" ||
                    f.fieldControl === "MultipleComboboxControl") &&
                f.options
            ) {
                controlProps.options = f.options
                    .split(",")
                    .map((opt) => opt.trim())
                    .filter(Boolean)
                    .map((opt) => ({ id: opt.toLowerCase().replace(/\s+/g, "_"), value: opt }));
            }

            return {
                key: f.key,
                outputType: f.outputType,
                fieldConfig: {
                    fieldWrapper: "FormItemWrapper",
                    wrapperProps: {
                        label: f.label || f.key,
                        required: f.required,
                    },
                    fieldControl: f.fieldControl,
                    controlProps,
                    ...(rules.length > 0 ? { rules } : {}),
                },
            };
        });
}

export function autoFormToSchemaFields(schema: IWorkflowSchemaField[]): ISchemaFieldItem[] {
    if (!schema?.length) return [];

    return schema.map((field) => {
        const fc = field.fieldConfig ?? {};
        const wp = fc.wrapperProps ?? {};
        const cp = fc.controlProps ?? {};

        let options = "";
        if (cp.options && Array.isArray(cp.options)) {
            options = cp.options.map((o: any) => o.value ?? o.id ?? o).join(", ");
        }

        const hasRequired =
            wp.required ||
            fc.rules?.some?.((r: any) => r.method === "required");

        return {
            key: field.key ?? "",
            label: wp.label ?? field.label ?? field.key ?? "",
            outputType: field.outputType ?? field.type ?? "string",
            fieldControl: fc.fieldControl ?? "InputControl",
            required: !!hasRequired,
            placeholder: cp.placeholder ?? "",
            description: field.description ?? "",
            options,
        };
    });
}

const SchemaFieldList = ({ title, fields, onChange, readonly }: SchemaFieldListProps) => {
    const { t } = useLanguage();

    const [mode, setMode] = useState<"form" | "editor">("editor");

    const handleAdd = useCallback(() => {
        onChange([...fields, createEmptyField()]);
    }, [fields, onChange]);

    const handleChange = useCallback(
        (index: number, updated: ISchemaFieldItem) => {
            const next = [...fields];
            next[index] = updated;
            onChange(next);
        },
        [fields, onChange]
    );

    const handleRemove = useCallback(
        (index: number) => {
            onChange(fields.filter((_, i) => i !== index));
        },
        [fields, onChange]
    );

    const handleMoveUp = useCallback(
        (index: number) => {
            if (index === 0) return;
            const next = [...fields];
            const tmp = next[index - 1]!;
            next[index - 1] = next[index]!;
            next[index] = tmp;
            onChange(next);
        },
        [fields, onChange]
    );

    const handleMoveDown = useCallback(
        (index: number) => {
            if (index >= fields.length - 1) return;
            const next = [...fields];
            const tmp = next[index]!;
            next[index] = next[index + 1]!;
            next[index + 1] = tmp;
            onChange(next);
        },
        [fields, onChange]
    );

    const debounceSetFormText = useDebounceCallback((value: string) => {
        try {
            const parsed = JSON.parse(value);
            onChange(parsed);
        } catch (error) {
            console.error("Error parsing JSON:", error);
        }
    }, 400);

    function handleMount(editor: any, _monaco: any) {

        editor.updateOptions({
            formatOnPaste: true,
            formatOnType: true,
            automaticLayout: true,
        });

        setTimeout(() => {
            editor.getAction("editor.action.formatDocument").run();
        }, 100);
    }

    return (
        <Tabs value={mode} onValueChange={(value) => setMode(value as "form" | "editor")} className="h-full">
            <div className="flex flex-col gap-3 h-full">

                <div className="flex items-center justify-between">
                    <h4 className="text-sm font-semibold uppercase text-gray-600">{title}</h4>
                    <div className="flex items-center justify-end gap-2">
                        {mode === "form" && !readonly && (
                            <Button variant="outline" size="sm" onClick={handleAdd}>
                                <PlusIcon className="size-3 mr-1" />
                                {t("node_definition_builder.add_field")}
                            </Button>
                        )}

                        <TabsList>
                            <TabsTrigger value="editor" className="cursor-pointer">Editor</TabsTrigger>
                        </TabsList>
                    </div>
                </div>

                <TabsContent value="form">
                    <>
                        {fields.length === 0 && (
                            <div className="text-center py-8 text-sm text-gray-400 border border-dashed border-gray-200 rounded-lg">
                                {t("node_definition_builder.no_fields")}
                            </div>
                        )}

                        <div className="flex flex-col gap-2">
                            {fields.map((field, index) => (
                                <SchemaFieldEditor
                                    key={index}
                                    field={field}
                                    index={index}
                                    total={fields.length}
                                    onChange={handleChange}
                                    onRemove={handleRemove}
                                    onMoveUp={handleMoveUp}
                                    onMoveDown={handleMoveDown}
                                />
                            ))}
                        </div>
                    </>
                </TabsContent>

                <TabsContent value="editor" className="flex flex-col h-full w-full">
                    <div className="flex flex-col flex-2 w-full">
                        <Editor
                            height="100%"
                            language="json"
                            onMount={handleMount}
                            value={JSON.stringify(fields)}
                            options={{
                                automaticLayout: true,
                                lineNumbers: "off",
                                lineDecorationsWidth: 0,
                                lineNumbersMinChars: 0,
                                minimap: { enabled: false }
                            }}
                            onChange={(value) => {
                                debounceSetFormText(value!);
                            }}
                        />
                    </div>
                </TabsContent>

            </div>
        </Tabs>

    );
};

export default SchemaFieldList;
