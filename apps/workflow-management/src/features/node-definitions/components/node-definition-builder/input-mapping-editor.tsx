import { useLanguage } from "@/components/containers/language-provider";
import { Button } from "@common/components/ui/button";
import { Input } from "@common/components/ui/input";
import { cn } from "@common/lib/utils";
import { ChevronDownIcon, ChevronUpIcon, PlusIcon, SparklesIcon, TrashIcon } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import { ISchemaFieldItem } from "./schema-field-editor";
import {
    HTTP_WORKER_FIELDS,
    IWorkerFieldMeta,
    getWorkerFieldMeta,
} from "./worker-field-metadata";

/* ------------------------------------------------------------------ */
/*  Data model                                                         */
/* ------------------------------------------------------------------ */

export interface IMappingEntry {
    workerField: string;
    /** For "expression" mode — the expression string */
    expressionValue: string;
    /** For "key_value_array" mode — array of name/value pairs */
    arrayItems: { name: string; value: string }[];
    /** For "json_template" mode — the raw JSON template string */
    jsonTemplate: string;
}

/* ------------------------------------------------------------------ */
/*  Conversion helpers  (IMappingEntry[] ↔ Record<string, any>)        */
/* ------------------------------------------------------------------ */

export function mappingEntriesToObject(entries: IMappingEntry[]): Record<string, any> {
    const result: Record<string, any> = {};
    for (const entry of entries) {
        if (!entry.workerField) continue;
        const meta = getWorkerFieldMeta(entry.workerField);
        const mode = meta?.mode ?? "expression";

        if (mode === "key_value_array" && meta) {
            const items = entry.arrayItems
                .filter((item) => item.name || item.value)
                .map((item) => ({
                    [meta.nameKey!]: item.name,
                    [meta.valueKey!]: item.value,
                }));
            if (items.length > 0) result[entry.workerField] = items;
        } else if (mode === "json_template") {
            if (entry.jsonTemplate.trim()) result[entry.workerField] = entry.jsonTemplate;
        } else {
            if (entry.expressionValue.trim()) result[entry.workerField] = entry.expressionValue;
        }
    }
    return result;
}

export function objectToMappingEntries(obj: Record<string, any> | undefined | null): IMappingEntry[] {
    if (!obj || typeof obj !== "object") return [];
    return Object.entries(obj).map(([key, value]) => {
        const meta = getWorkerFieldMeta(key);
        const mode = meta?.mode ?? "expression";

        const entry: IMappingEntry = {
            workerField: key,
            expressionValue: "",
            arrayItems: [],
            jsonTemplate: "",
        };

        if (mode === "key_value_array" && Array.isArray(value) && meta) {
            entry.arrayItems = value.map((item: any) => ({
                name: String(item[meta.nameKey!] ?? ""),
                value: String(item[meta.valueKey!] ?? ""),
            }));
        } else if (mode === "json_template") {
            entry.jsonTemplate = typeof value === "string" ? value : JSON.stringify(value, null, 2);
        } else {
            entry.expressionValue = typeof value === "string" ? value : JSON.stringify(value);
        }

        return entry;
    });
}

/* ------------------------------------------------------------------ */
/*  Sub-editors                                                        */
/* ------------------------------------------------------------------ */

interface ExpressionEditorProps {
    value: string;
    onChange: (val: string) => void;
    customFields: ISchemaFieldItem[];
    placeholder?: string;
}

const ExpressionEditor = ({ value, onChange, customFields, placeholder }: ExpressionEditorProps) => (
    <div className="flex flex-col gap-1">
        <Input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder || "value or {{$custom.field}}"}
            className="h-8 text-sm font-mono"
        />
        {customFields.length > 0 && (
            <div className="flex flex-wrap gap-1">
                {customFields.map((f) => (
                    <button
                        key={f.key}
                        type="button"
                        onClick={() => onChange(value + `{{$custom.${f.key}}}`)}
                        className="text-xs px-1.5 py-0.5 bg-blue-50 text-blue-700 rounded hover:bg-blue-100 font-mono"
                    >
                        {f.label || f.key}
                    </button>
                ))}
            </div>
        )}
    </div>
);

interface KeyValueArrayEditorProps {
    items: { name: string; value: string }[];
    onChange: (items: { name: string; value: string }[]) => void;
    meta: IWorkerFieldMeta;
    customFields: ISchemaFieldItem[];
}

const KeyValueArrayEditor = ({ items, onChange, meta, customFields }: KeyValueArrayEditorProps) => {
    const { t } = useLanguage();

    const handleAdd = () => onChange([...items, { name: "", value: "" }]);
    const handleRemove = (idx: number) => onChange(items.filter((_, i) => i !== idx));
    const handleUpdate = (idx: number, field: "name" | "value", val: string) => {
        const next = [...items];
        next[idx] = { ...next[idx], [field]: val };
        onChange(next);
    };

    return (
        <div className="flex flex-col gap-2">
            {items.length > 0 && (
                <div className="border border-gray-100 rounded-md overflow-hidden">
                    <div className="grid grid-cols-[1fr_1fr_32px] gap-0 bg-gray-50 px-2 py-1 border-b border-gray-100">
                        <span className="text-xs text-gray-500">{meta.nameLabel || "Name"}</span>
                        <span className="text-xs text-gray-500">{meta.valueLabel || "Value"}</span>
                        <span />
                    </div>
                    {items.map((item, idx) => (
                        <div key={idx} className="grid grid-cols-[1fr_1fr_32px] gap-1.5 px-2 py-1.5 items-center border-b border-gray-50 last:border-0">
                            <Input
                                value={item.name}
                                onChange={(e) => handleUpdate(idx, "name", e.target.value)}
                                placeholder={meta.nameKey}
                                className="h-7 text-xs"
                            />
                            <div className="flex flex-col gap-0.5">
                                <Input
                                    value={item.value}
                                    onChange={(e) => handleUpdate(idx, "value", e.target.value)}
                                    placeholder="{{$custom.field}}"
                                    className="h-7 text-xs font-mono"
                                />
                                {customFields.length > 0 && (
                                    <div className="flex flex-wrap gap-0.5">
                                        {customFields.map((f) => (
                                            <button
                                                key={f.key}
                                                type="button"
                                                onClick={() => handleUpdate(idx, "value", `{{$custom.${f.key}}}`)}
                                                className="text-[10px] px-1 py-0 bg-blue-50 text-blue-600 rounded hover:bg-blue-100 font-mono leading-4"
                                            >
                                                {f.key}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="size-6 text-red-400 hover:text-red-600"
                                onClick={() => handleRemove(idx)}
                            >
                                <TrashIcon className="size-3" />
                            </Button>
                        </div>
                    ))}
                </div>
            )}
            <Button variant="outline" size="sm" className="self-start h-7 text-xs" onClick={handleAdd}>
                <PlusIcon className="size-3 mr-1" />
                {t("node_definition_builder.add_entry")}
            </Button>
        </div>
    );
};

interface JsonTemplateEditorProps {
    value: string;
    onChange: (val: string) => void;
    customFields: ISchemaFieldItem[];
}

const JsonTemplateEditor = ({ value, onChange, customFields }: JsonTemplateEditorProps) => {
    const { t } = useLanguage();

    const insertField = (fieldKey: string, fieldType: string) => {
        const expr = fieldType === "number" || fieldType === "boolean"
            ? `{{$custom.${fieldKey}}}`
            : `"{{$custom.${fieldKey}}}"`;
        onChange(value + expr);
    };

    const generateTemplate = () => {
        if (!customFields.length) return;
        const obj: Record<string, string> = {};
        for (const f of customFields) {
            if (!f.key) continue;
            obj[f.key] = `{{$custom.${f.key}}}`;
        }
        // Build a JSON string with expression placeholders (not valid JSON but the template format)
        let tpl = "{\n";
        const entries = Object.entries(obj);
        entries.forEach(([key, val], idx) => {
            const field = customFields.find((f) => f.key === key);
            const isNumOrBool = field?.outputType === "number" || field?.outputType === "boolean";
            const comma = idx < entries.length - 1 ? "," : "";
            tpl += isNumOrBool
                ? `  "${key}": ${val}${comma}\n`
                : `  "${key}": "${val}"${comma}\n`;
        });
        tpl += "}";
        onChange(tpl);
    };

    return (
        <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs text-gray-500">{t("node_definition_builder.insert_field")}:</span>
                {customFields.map((f) => (
                    <button
                        key={f.key}
                        type="button"
                        onClick={() => insertField(f.key, f.outputType)}
                        className="text-xs px-1.5 py-0.5 bg-blue-50 text-blue-700 rounded hover:bg-blue-100 font-mono"
                    >
                        {f.label || f.key}
                        <span className="text-gray-400 ml-1">{f.outputType}</span>
                    </button>
                ))}
                {customFields.length > 0 && (
                    <Button
                        variant="outline"
                        size="sm"
                        className="h-6 text-xs ml-auto"
                        onClick={generateTemplate}
                    >
                        <SparklesIcon className="size-3 mr-1" />
                        {t("node_definition_builder.auto_generate")}
                    </Button>
                )}
            </div>
            <textarea
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={"{\"key\": \"{{$custom.field}}\"}"}
                className="w-full font-mono text-xs p-2 border border-gray-200 rounded-md resize-y min-h-[80px] focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={5}
            />
        </div>
    );
};

/* ------------------------------------------------------------------ */
/*  Main component                                                     */
/* ------------------------------------------------------------------ */

interface InputMappingEditorProps {
    entries: IMappingEntry[];
    onChange: (entries: IMappingEntry[]) => void;
    customFields: ISchemaFieldItem[];
}

const InputMappingEditor = ({ entries, onChange, customFields }: InputMappingEditorProps) => {
    const { t } = useLanguage();

    // Worker fields not yet used
    const availableFields = useMemo(() => {
        const usedKeys = new Set(entries.map((e) => e.workerField));
        return HTTP_WORKER_FIELDS.filter((f) => !usedKeys.has(f.key));
    }, [entries]);

    const handleAdd = useCallback(
        (fieldKey: string) => {
            const meta = getWorkerFieldMeta(fieldKey);
            onChange([
                ...entries,
                {
                    workerField: fieldKey,
                    expressionValue: "",
                    arrayItems: meta?.mode === "key_value_array" ? [{ name: "", value: "" }] : [],
                    jsonTemplate: "",
                },
            ]);
        },
        [entries, onChange]
    );

    const handleRemove = useCallback(
        (idx: number) => onChange(entries.filter((_, i) => i !== idx)),
        [entries, onChange]
    );

    const handleUpdate = useCallback(
        (idx: number, partial: Partial<IMappingEntry>) => {
            const next = [...entries];
            next[idx] = { ...next[idx], ...partial };
            onChange(next);
        },
        [entries, onChange]
    );

    const [addMenuOpen, setAddMenuOpen] = useState(false);

    return (
        <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
                <div className="flex flex-col">
                    <h4 className="text-sm font-semibold uppercase text-gray-600">
                        {t("node_definition_builder.input_mapping_title")}
                    </h4>
                    <p className="text-xs text-gray-400 mt-0.5">
                        {t("node_definition_builder.input_mapping_desc")}
                    </p>
                </div>
                <div className="relative">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setAddMenuOpen(!addMenuOpen)}
                        disabled={availableFields.length === 0}
                    >
                        <PlusIcon className="size-3 mr-1" />
                        {t("node_definition_builder.add_mapping")}
                    </Button>
                    {addMenuOpen && (
                        <div className="absolute z-50 right-0 top-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-64 overflow-y-auto w-64">
                            {availableFields.map((field) => (
                                <button
                                    key={field.key}
                                    type="button"
                                    className="w-full text-left px-3 py-2 hover:bg-blue-50 flex flex-col border-b border-gray-50 last:border-0"
                                    onClick={() => {
                                        handleAdd(field.key);
                                        setAddMenuOpen(false);
                                    }}
                                >
                                    <span className="text-sm font-medium">{field.label}</span>
                                    <span className="text-xs text-gray-400 font-mono">{field.key}</span>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {entries.length === 0 && (
                <div className="text-center py-8 text-sm text-gray-400 border border-dashed border-gray-200 rounded-lg">
                    {t("node_definition_builder.no_mappings")}
                </div>
            )}

            <div className="flex flex-col gap-3">
                {entries.map((entry, idx) => {
                    const meta = getWorkerFieldMeta(entry.workerField);
                    const mode = meta?.mode ?? "expression";
                    const modeIcon = mode === "key_value_array"
                        ? "list"
                        : mode === "json_template"
                        ? "braces"
                        : "arrow-right";

                    return (
                        <div
                            key={`${entry.workerField}-${idx}`}
                            className="border border-gray-200 rounded-lg bg-white overflow-hidden"
                        >
                            {/* Header */}
                            <div className="flex items-center justify-between px-3 py-2 bg-gray-50 border-b border-gray-200">
                                <div className="flex items-center gap-2">
                                    <span className={cn(
                                        "text-[10px] uppercase px-1.5 py-0.5 rounded font-medium",
                                        mode === "key_value_array" && "bg-purple-100 text-purple-700",
                                        mode === "json_template" && "bg-amber-100 text-amber-700",
                                        mode === "expression" && "bg-blue-100 text-blue-700",
                                    )}>
                                        {mode === "key_value_array" ? "Array" : mode === "json_template" ? "JSON" : "Value"}
                                    </span>
                                    <div className="flex flex-col">
                                        <span className="text-sm font-medium">{meta?.label || entry.workerField}</span>
                                        <span className="text-xs text-gray-400 font-mono">{entry.workerField}</span>
                                    </div>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="size-7 text-red-400 hover:text-red-600"
                                    onClick={() => handleRemove(idx)}
                                >
                                    <TrashIcon className="size-3" />
                                </Button>
                            </div>

                            {/* Body */}
                            <div className="px-3 py-3">
                                {mode === "expression" && (
                                    <ExpressionEditor
                                        value={entry.expressionValue}
                                        onChange={(val) => handleUpdate(idx, { expressionValue: val })}
                                        customFields={customFields}
                                    />
                                )}

                                {mode === "key_value_array" && meta && (
                                    <KeyValueArrayEditor
                                        items={entry.arrayItems}
                                        onChange={(items) => handleUpdate(idx, { arrayItems: items })}
                                        meta={meta}
                                        customFields={customFields}
                                    />
                                )}

                                {mode === "json_template" && (
                                    <JsonTemplateEditor
                                        value={entry.jsonTemplate}
                                        onChange={(val) => handleUpdate(idx, { jsonTemplate: val })}
                                        customFields={customFields}
                                    />
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default InputMappingEditor;
