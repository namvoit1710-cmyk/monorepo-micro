import { useLanguage } from "@/hooks/use-language";
import { Button } from "@ldc/ui/components/button";
import { Input } from "@ldc/ui/components/input";
import { ChevronDownIcon, ChevronUpIcon, GripVerticalIcon, TrashIcon } from "lucide-react";
import { useState } from "react";

export interface ISchemaFieldItem {
    key: string;
    label: string;
    outputType: string;
    fieldControl: string;
    required: boolean;
    placeholder: string;
    description: string;
    options: string;
}

const FIELD_CONTROL_OPTIONS = [
    { id: "InputControl", label: "Text Input" },
    { id: "TextareaControl", label: "Text Area" },
    { id: "NumberControl", label: "Number" },
    { id: "SelectControl", label: "Dropdown Select" },
    { id: "ComboBoxControl", label: "Searchable Select" },
    { id: "MultipleComboboxControl", label: "Multi Select" },
    { id: "SwitchControl", label: "Toggle Switch" },
    { id: "CheckBoxControl", label: "Checkbox" },
];

const OUTPUT_TYPE_OPTIONS = [
    { id: "string", label: "Text" },
    { id: "number", label: "Number" },
    { id: "boolean", label: "Yes/No" },
    { id: "object", label: "Object" },
    { id: "array", label: "List" },
];

interface SchemaFieldEditorProps {
    field: ISchemaFieldItem;
    index: number;
    total: number;
    onChange: (index: number, field: ISchemaFieldItem) => void;
    onRemove: (index: number) => void;
    onMoveUp: (index: number) => void;
    onMoveDown: (index: number) => void;
}

const SchemaFieldEditor = ({
    field,
    index,
    total,
    onChange,
    onRemove,
    onMoveUp,
    onMoveDown,
}: SchemaFieldEditorProps) => {
    const { t } = useLanguage();
    const [isExpanded, setIsExpanded] = useState(true);

    const update = (partial: Partial<ISchemaFieldItem>) => {
        onChange(index, { ...field, ...partial });
    };

    const showOptions = field.fieldControl === "SelectControl" || field.fieldControl === "ComboBoxControl" || field.fieldControl === "MultipleComboboxControl";

    return (
        <div className="border border-gray-200 rounded-lg bg-white">
            <div
                className="flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-gray-50 rounded-t-lg"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <GripVerticalIcon className="size-4 text-gray-400 shrink-0" />

                <div className="flex-1 flex items-center gap-2 min-w-0">
                    <span className="text-sm font-medium truncate">
                        {field.label || field.key || t("node_definition_builder.unnamed_field")}
                    </span>
                    <span className="text-xs text-gray-400 shrink-0">
                        {OUTPUT_TYPE_OPTIONS.find(o => o.id === field.outputType)?.label || field.outputType}
                    </span>
                    {field.required && (
                        <span className="text-xs text-red-500 shrink-0">*</span>
                    )}
                </div>

                <div className="flex items-center gap-1 shrink-0">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="size-7"
                        disabled={index === 0}
                        onClick={(e) => { e.stopPropagation(); onMoveUp(index); }}
                    >
                        <ChevronUpIcon className="size-3" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="size-7"
                        disabled={index === total - 1}
                        onClick={(e) => { e.stopPropagation(); onMoveDown(index); }}
                    >
                        <ChevronDownIcon className="size-3" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="size-7 text-red-500 hover:text-red-700"
                        onClick={(e) => { e.stopPropagation(); onRemove(index); }}
                    >
                        <TrashIcon className="size-3" />
                    </Button>

                    {isExpanded
                        ? <ChevronUpIcon className="size-4 text-gray-400" />
                        : <ChevronDownIcon className="size-4 text-gray-400" />}
                </div>
            </div>

            {isExpanded && (
                <div className="px-4 pb-4 pt-2 border-t border-gray-100 grid grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1">
                        <label className="text-xs font-medium text-gray-600">
                            {t("node_definition_builder.field_key")} *
                        </label>
                        <Input
                            value={field.key}
                            onChange={(e) => update({ key: e.target.value.replace(/\s/g, "_") })}
                            placeholder="e.g. search_query"
                            className="h-8 text-sm"
                        />
                    </div>

                    <div className="flex flex-col gap-1">
                        <label className="text-xs font-medium text-gray-600">
                            {t("node_definition_builder.field_label")}
                        </label>
                        <Input
                            value={field.label}
                            onChange={(e) => update({ label: e.target.value })}
                            placeholder="e.g. Search Query"
                            className="h-8 text-sm"
                        />
                    </div>

                    <div className="flex flex-col gap-1">
                        <label className="text-xs font-medium text-gray-600">
                            {t("node_definition_builder.field_data_type")}
                        </label>
                        <select
                            value={field.outputType}
                            onChange={(e) => update({ outputType: e.target.value })}
                            className="h-8 text-sm border border-gray-200 rounded-md px-2 bg-white"
                        >
                            {OUTPUT_TYPE_OPTIONS.map((opt) => (
                                <option key={opt.id} value={opt.id}>{opt.label}</option>
                            ))}
                        </select>
                    </div>

                    <div className="flex flex-col gap-1">
                        <label className="text-xs font-medium text-gray-600">
                            {t("node_definition_builder.field_control_type")}
                        </label>
                        <select
                            value={field.fieldControl}
                            onChange={(e) => update({ fieldControl: e.target.value })}
                            className="h-8 text-sm border border-gray-200 rounded-md px-2 bg-white"
                        >
                            {FIELD_CONTROL_OPTIONS.map((opt) => (
                                <option key={opt.id} value={opt.id}>{opt.label}</option>
                            ))}
                        </select>
                    </div>

                    <div className="flex flex-col gap-1">
                        <label className="text-xs font-medium text-gray-600">
                            {t("node_definition_builder.field_placeholder")}
                        </label>
                        <Input
                            value={field.placeholder}
                            onChange={(e) => update({ placeholder: e.target.value })}
                            placeholder="e.g. Enter your search term..."
                            className="h-8 text-sm"
                        />
                    </div>

                    <div className="flex items-end gap-2 pb-1">
                        <label className="flex items-center gap-2 text-sm cursor-pointer">
                            <input
                                type="checkbox"
                                checked={field.required}
                                onChange={(e) => update({ required: e.target.checked })}
                                className="rounded border-gray-300"
                            />
                            {t("node_definition_builder.field_required")}
                        </label>
                    </div>

                    {showOptions && (
                        <div className="col-span-2 flex flex-col gap-1">
                            <label className="text-xs font-medium text-gray-600">
                                {t("node_definition_builder.field_options")}
                            </label>
                            <Input
                                value={field.options}
                                onChange={(e) => update({ options: e.target.value })}
                                placeholder={t("node_definition_builder.field_options_placeholder")}
                                className="h-8 text-sm"
                            />
                            <span className="text-xs text-gray-400">
                                {t("node_definition_builder.field_options_hint")}
                            </span>
                        </div>
                    )}

                    <div className="col-span-2 flex flex-col gap-1">
                        <label className="text-xs font-medium text-gray-600">
                            {t("node_definition_builder.field_description")}
                        </label>
                        <Input
                            value={field.description}
                            onChange={(e) => update({ description: e.target.value })}
                            placeholder={t("node_definition_builder.field_description_placeholder")}
                            className="h-8 text-sm"
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default SchemaFieldEditor;
