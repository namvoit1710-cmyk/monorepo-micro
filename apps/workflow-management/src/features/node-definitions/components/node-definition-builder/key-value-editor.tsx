import { useLanguage } from "@/components/containers/language-provider";
import { Button } from "@common/components/ui/button";
import { Input } from "@common/components/ui/input";
import { cn } from "@common/lib/utils";
import { PlusIcon, TrashIcon } from "lucide-react";
import { useCallback, useRef, useState } from "react";

export interface IKeyValuePair {
    key: string;
    value: string;
}

export interface ISuggestion {
    value: string;
    label: string;
    description?: string;
}

interface KeyValueEditorProps {
    title: string;
    description?: string;
    pairs: IKeyValuePair[];
    onChange: (pairs: IKeyValuePair[]) => void;
    keyPlaceholder?: string;
    valuePlaceholder?: string;
    keyLabel?: string;
    valueLabel?: string;
    keySuggestions?: ISuggestion[];
    valueSuggestions?: ISuggestion[];
}

export function keyValuePairsToObject(pairs: IKeyValuePair[]): Record<string, any> {
    const result: Record<string, any> = {};
    for (const pair of pairs) {
        if (pair.key) {
            result[pair.key] = pair.value;
        }
    }
    return result;
}

export function objectToKeyValuePairs(obj: Record<string, any> | undefined | null): IKeyValuePair[] {
    if (!obj || typeof obj !== "object") return [];
    return Object.entries(obj).map(([key, value]) => ({
        key,
        value: typeof value === "string" ? value : JSON.stringify(value),
    }));
}

interface AutocompleteInputProps {
    value: string;
    onChange: (val: string) => void;
    placeholder?: string;
    suggestions?: ISuggestion[];
    className?: string;
    mono?: boolean;
}

const AutocompleteInput = ({
    value,
    onChange,
    placeholder,
    suggestions,
    className,
    mono,
}: AutocompleteInputProps) => {
    const [showDropdown, setShowDropdown] = useState(false);
    const [focusedIndex, setFocusedIndex] = useState(-1);
    const inputRef = useRef<HTMLInputElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const filtered = suggestions?.filter((s) => {
        if (!value) return true;
        const lower = value.toLowerCase();
        return (
            s.value.toLowerCase().includes(lower) ||
            s.label.toLowerCase().includes(lower)
        );
    }) ?? [];

    const handleSelect = useCallback(
        (suggestion: ISuggestion) => {
            onChange(suggestion.value);
            setShowDropdown(false);
            setFocusedIndex(-1);
        },
        [onChange]
    );

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (!showDropdown || !filtered.length) return;

        if (e.key === "ArrowDown") {
            e.preventDefault();
            setFocusedIndex((prev) => Math.min(prev + 1, filtered.length - 1));
        } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setFocusedIndex((prev) => Math.max(prev - 1, 0));
        } else if (e.key === "Enter" && focusedIndex >= 0) {
            e.preventDefault();
            handleSelect(filtered[focusedIndex]);
        } else if (e.key === "Escape") {
            setShowDropdown(false);
        }
    };

    const hasSuggestions = suggestions && suggestions.length > 0;

    return (
        <div className="relative">
            <Input
                ref={inputRef}
                value={value}
                onChange={(e) => {
                    onChange(e.target.value);
                    if (hasSuggestions) setShowDropdown(true);
                    setFocusedIndex(-1);
                }}
                onFocus={() => {
                    if (hasSuggestions) setShowDropdown(true);
                }}
                onBlur={() => {
                    // Delay to allow click on dropdown item
                    setTimeout(() => setShowDropdown(false), 150);
                }}
                onKeyDown={handleKeyDown}
                placeholder={placeholder}
                className={cn("h-8 text-sm", mono && "font-mono", className)}
            />

            {showDropdown && filtered.length > 0 && (
                <div
                    ref={dropdownRef}
                    className="absolute z-50 top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-48 overflow-y-auto"
                >
                    {filtered.map((suggestion, idx) => (
                        <button
                            key={suggestion.value}
                            type="button"
                            className={cn(
                                "w-full text-left px-3 py-1.5 text-sm hover:bg-blue-50 flex flex-col",
                                idx === focusedIndex && "bg-blue-50"
                            )}
                            onMouseDown={(e) => {
                                e.preventDefault();
                                handleSelect(suggestion);
                            }}
                        >
                            <span className="font-mono text-xs text-blue-700">{suggestion.value}</span>
                            {suggestion.description && (
                                <span className="text-xs text-gray-400">{suggestion.description}</span>
                            )}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

const KeyValueEditor = ({
    title,
    description,
    pairs,
    onChange,
    keyPlaceholder,
    valuePlaceholder,
    keyLabel,
    valueLabel,
    keySuggestions,
    valueSuggestions,
}: KeyValueEditorProps) => {
    const { t } = useLanguage();

    const handleAdd = useCallback(() => {
        onChange([...pairs, { key: "", value: "" }]);
    }, [pairs, onChange]);

    const handleChange = useCallback(
        (index: number, field: "key" | "value", val: string) => {
            const next = [...pairs];
            next[index] = { ...next[index], [field]: val };
            onChange(next);
        },
        [pairs, onChange]
    );

    const handleRemove = useCallback(
        (index: number) => {
            onChange(pairs.filter((_, i) => i !== index));
        },
        [pairs, onChange]
    );

    return (
        <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
                <div className="flex flex-col">
                    <h4 className="text-sm font-semibold uppercase text-gray-600">{title}</h4>
                    {description && <p className="text-xs text-gray-400 mt-0.5">{description}</p>}
                </div>
                <Button variant="outline" size="sm" onClick={handleAdd}>
                    <PlusIcon className="size-3 mr-1" />
                    {t("node_definition_builder.add_entry")}
                </Button>
            </div>

            {pairs.length > 0 && (
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                    <div className="grid grid-cols-[1fr_1fr_40px] gap-0 bg-gray-50 px-3 py-2 border-b border-gray-200">
                        <span className="text-xs font-medium text-gray-500 uppercase">
                            {keyLabel || t("node_definition_builder.mapping_key")}
                        </span>
                        <span className="text-xs font-medium text-gray-500 uppercase">
                            {valueLabel || t("node_definition_builder.mapping_value")}
                        </span>
                        <span />
                    </div>

                    {pairs.map((pair, index) => (
                        <div
                            key={index}
                            className="grid grid-cols-[1fr_1fr_40px] gap-2 px-3 py-2 items-center border-b border-gray-100 last:border-b-0"
                        >
                            <AutocompleteInput
                                value={pair.key}
                                onChange={(val) => handleChange(index, "key", val)}
                                placeholder={keyPlaceholder || "key"}
                                suggestions={keySuggestions}
                            />
                            <AutocompleteInput
                                value={pair.value}
                                onChange={(val) => handleChange(index, "value", val)}
                                placeholder={valuePlaceholder || "value"}
                                suggestions={valueSuggestions}
                                mono
                            />
                            <Button
                                variant="ghost"
                                size="icon"
                                className="size-7 text-red-500 hover:text-red-700"
                                onClick={() => handleRemove(index)}
                            >
                                <TrashIcon className="size-3" />
                            </Button>
                        </div>
                    ))}
                </div>
            )}

            {pairs.length === 0 && (
                <div className="text-center py-6 text-sm text-gray-400 border border-dashed border-gray-200 rounded-lg">
                    {t("node_definition_builder.no_entries")}
                </div>
            )}
        </div>
    );
};

export default KeyValueEditor;
