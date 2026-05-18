import { INodeInputSchema } from "@/features/workflows/types/node-pallete";
import { useLanguage } from "@/hooks/use-language";
import { LdcCodeEditor } from "@ldc/autoform";
import { cn } from "@ldc/ui";
import { Input } from "@ldc/ui/components/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@ldc/ui/components/select";
import { LockIcon, UnlockIcon } from "lucide-react";
import { useCallback, useMemo } from "react";

export interface ILockedDefaultEntry {
    key: string;
    label: string;
    value: string;
    type: "string" | "number" | "boolean" | "json";
    locked: boolean;
    controlType?: string;
    options?: { id: string; value: string }[];
}

interface LockedDefaultsEditorProps {
    entries: ILockedDefaultEntry[];
    onChange: (entries: ILockedDefaultEntry[]) => void;
}

function outputTypeToEntryType(outputType: string): ILockedDefaultEntry["type"] {
    switch (outputType) {
        case "number": return "number";
        case "boolean": return "boolean";
        case "object":
        case "array": return "json";
        default: return "string";
    }
}

function extractOptions(schema: INodeInputSchema): { id: string; value: string }[] | undefined {
    const opts = schema.fieldConfig?.controlProps?.options;
    if (!Array.isArray(opts) || opts.length === 0) return undefined;
    return opts.map((o: any) => ({
        id: String(o.id ?? o.value ?? o),
        value: String(o.value ?? o.id ?? o),
    }));
}

export function workerSchemaToEntries(
    schema: INodeInputSchema[],
    existingDefaults?: Record<string, any>
): ILockedDefaultEntry[] {
    return schema.map((field) => {
        const hasExisting = existingDefaults && field.key in existingDefaults;
        const existingValue = hasExisting ? existingDefaults[field.key] : undefined;
        const entryType = outputTypeToEntryType(field.outputType);

        let strValue = "";
        if (hasExisting) {
            if (typeof existingValue === "string") strValue = existingValue;
            else if (typeof existingValue === "boolean" || typeof existingValue === "number") strValue = String(existingValue);
            else strValue = JSON.stringify(existingValue);
        }

        return {
            key: field.key,
            label: (field.fieldConfig as any)?.wrapperProps?.label || field.fieldConfig?.label || field.key,
            value: strValue,
            type: entryType,
            locked: !!hasExisting,
            controlType: field.fieldConfig?.fieldControl,
            options: extractOptions(field),
        };
    });
}

export function lockedDefaultsToEntries(
    obj: Record<string, any> | undefined | null,
    schema?: INodeInputSchema[]
): ILockedDefaultEntry[] {
    if (schema?.length) {
        return workerSchemaToEntries(schema, obj ?? undefined);
    }

    if (!obj || typeof obj !== "object") return [];
    return Object.entries(obj).map(([key, value]) => {
        let type: ILockedDefaultEntry["type"] = "string";
        let strValue = "";

        if (typeof value === "boolean") {
            type = "boolean";
            strValue = String(value);
        } else if (typeof value === "number") {
            type = "number";
            strValue = String(value);
        } else if (typeof value === "string") {
            type = "string";
            strValue = value;
        } else {
            type = "json";
            strValue = JSON.stringify(value);
        }

        return { key, label: key, value: strValue, type, locked: true };
    });
}

export function entriesToLockedDefaults(entries: ILockedDefaultEntry[]): Record<string, any> {
    const result: Record<string, any> = {};
    for (const entry of entries) {
        if (!entry.key || !entry.locked) continue;
        if (entry.value === "") continue;
        switch (entry.type) {
            case "number":
                result[entry.key] = Number(entry.value) || 0;
                break;
            case "boolean":
                result[entry.key] = entry.value === "true";
                break;
            case "json":
                try {
                    result[entry.key] = JSON.parse(entry.value);
                } catch {
                    result[entry.key] = entry.value;
                }
                break;
            default:
                result[entry.key] = entry.value;
        }
    }
    return result;
}

const LockedDefaultsEditor = ({ entries, onChange }: LockedDefaultsEditorProps) => {
    const { t } = useLanguage();

    const handleUpdate = useCallback(
        (index: number, partial: Partial<ILockedDefaultEntry>) => {
            const next = [...entries];
            next[index] = { ...next[index], ...partial } as ILockedDefaultEntry;
            onChange(next);
        },
        [entries, onChange]
    );

    const handleToggleLock = useCallback(
        (index: number) => {
            const next = [...entries];
            next[index] = { ...next[index], locked: !next[index]?.locked } as ILockedDefaultEntry;
            onChange(next);
        },
        [entries, onChange]
    );

    const lockedCount = useMemo(() => entries.filter(e => e.locked).length, [entries]);

    const renderValueInput = (entry: ILockedDefaultEntry, index: number) => {
        const disabled = !entry.locked;

        if (entry.type === "boolean") {
            return (
                <Select
                    value={entry.value || "false"}
                    onValueChange={(value) => handleUpdate(index, { value })}
                    disabled={disabled}
                >
                    <SelectTrigger className={cn(
                        "h-8 text-sm border border-gray-200 rounded-md px-2 bg-white w-full",
                        disabled && "opacity-40 cursor-not-allowed"
                    )}>
                        <SelectValue placeholder={t("node_definition_builder.select_value")} />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="true">true</SelectItem>
                        <SelectItem value="false">false</SelectItem>
                    </SelectContent>
                </Select>
            );
        }

        if (entry.options?.length) {
            return (
                <Select
                    value={entry.value}
                    onValueChange={(value) => handleUpdate(index, { value })}
                    disabled={disabled}
                >
                    <SelectTrigger className={cn(
                        "h-8 text-sm border border-gray-200 rounded-md px-2 bg-white w-full",
                        disabled && "opacity-40 cursor-not-allowed"
                    )}>
                        <SelectValue placeholder={t("node_definition_builder.select_value")} />
                    </SelectTrigger>
                    <SelectContent>
                        {entry.options.map((opt) => (
                            <SelectItem key={opt.id} value={opt.id}>{opt.value}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            );
        }

        if (entry.type === "json") {
            return (
                <LdcCodeEditor
                    language="json"
                    value={entry.value}
                    placeholder='{"key": "value"}'
                    onChange={(value) => handleUpdate(index, { value })}
                    disabled={disabled}
                />
            );
        }

        return (
            <Input
                value={entry.value}
                onChange={(e) => handleUpdate(index, { value: e.target.value })}
                className={cn("h-8 text-sm", disabled && "opacity-40 cursor-not-allowed")}
                type={entry.type === "number" ? "number" : "text"}
                disabled={disabled}
            />
        );
    };

    return (
        <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
                <div className="flex flex-col">
                    <h4 className="text-sm font-semibold uppercase text-gray-600">
                        {t("node_definition_builder.locked_defaults")}
                    </h4>
                    <p className="text-xs text-gray-400 mt-0.5">
                        {t("node_definition_builder.locked_defaults_desc")}
                    </p>
                </div>
                <span className="text-xs text-gray-500">
                    {t("node_definition_builder.locked_count", { count: lockedCount, total: entries.length })}
                </span>
            </div>

            {entries.length > 0 && (
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                    <div className="grid grid-cols-[40px_1fr_100px_1fr] gap-0 bg-gray-50 px-3 py-2 border-b border-gray-200">
                        <span className="text-xs font-medium text-gray-500 uppercase text-center">
                            {t("node_definition_builder.lock")}
                        </span>
                        <span className="text-xs font-medium text-gray-500 uppercase">
                            {t("node_definition_builder.parameter")}
                        </span>
                        <span className="text-xs font-medium text-gray-500 uppercase">
                            {t("node_definition_builder.default_type")}
                        </span>
                        <span className="text-xs font-medium text-gray-500 uppercase">
                            {t("node_definition_builder.fixed_value")}
                        </span>
                    </div>

                    {entries.map((entry, index) => (
                        <div
                            key={entry.key}
                            className={cn(
                                "grid grid-cols-[40px_1fr_100px_1fr] gap-2 px-3 py-2 items-center border-b border-gray-100 last:border-b-0",
                                entry.locked ? "bg-blue-50/30" : ""
                            )}
                        >
                            <button
                                onClick={() => handleToggleLock(index)}
                                className={cn(
                                    "flex items-center justify-center size-7 rounded-md transition-colors mx-auto",
                                    entry.locked
                                        ? "text-blue-600 bg-blue-100 hover:bg-blue-200"
                                        : "text-gray-400 hover:bg-gray-100"
                                )}
                                title={entry.locked
                                    ? t("node_definition_builder.click_to_unlock")
                                    : t("node_definition_builder.click_to_lock")}
                            >
                                {entry.locked
                                    ? <LockIcon className="size-3.5" />
                                    : <UnlockIcon className="size-3.5" />}
                            </button>

                            <div className="flex flex-col min-w-0">
                                <span className={cn(
                                    "text-sm truncate",
                                    entry.locked ? "font-medium text-gray-900" : "text-gray-400"
                                )}>
                                    {entry.label}
                                </span>
                                <span className="text-xs text-gray-400 truncate">{entry.key}</span>
                            </div>

                            <span className={cn(
                                "text-xs px-2 py-1 rounded-md text-center",
                                entry.locked ? "bg-gray-100 text-gray-600" : "text-gray-300"
                            )}>
                                {entry.type}
                            </span>

                            {renderValueInput(entry, index)}
                        </div>
                    ))}
                </div>
            )}

            {entries.length === 0 && (
                <div className="text-center py-8 text-sm text-gray-400 border border-dashed border-gray-200 rounded-lg">
                    {t("node_definition_builder.no_worker_params")}
                </div>
            )}
        </div>
    );
};

export default LockedDefaultsEditor;
