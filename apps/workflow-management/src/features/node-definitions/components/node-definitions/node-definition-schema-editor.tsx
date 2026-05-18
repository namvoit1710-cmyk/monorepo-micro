import { useLanguage } from "@/hooks/use-language";
import { cn } from "@ldc/ui";
import { Button } from "@ldc/ui/components/button";
import { CheckIcon, CopyIcon } from "lucide-react";
import { useCallback, useState } from "react";

interface NodeDefinitionSchemaEditorProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    label?: string;
    rows?: number;
    disabled?: boolean;
}

const NodeDefinitionSchemaEditor = ({
    value,
    onChange,
    placeholder,
    label,
    rows = 8,
    disabled,
}: NodeDefinitionSchemaEditorProps) => {
    const { t } = useLanguage();
    const [error, setError] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);

    const handleChange = useCallback(
        (e: React.ChangeEvent<HTMLTextAreaElement>) => {
            const newValue = e.target.value;
            onChange(newValue);

            if (!newValue.trim()) {
                setError(null);
                return;
            }

            try {
                JSON.parse(newValue);
                setError(null);
            } catch (err) {
                setError((err as Error).message);
            }
        },
        [onChange]
    );

    const handleFormat = useCallback(() => {
        if (!value.trim()) return;
        try {
            const parsed = JSON.parse(value);
            onChange(JSON.stringify(parsed, null, 2));
            setError(null);
        } catch (err) {
            setError((err as Error).message);
        }
    }, [value, onChange]);

    const handleCopy = useCallback(() => {
        navigator.clipboard.writeText(value);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    }, [value]);

    return (
        <div className="flex flex-col gap-1">
            {label && (
                <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">{label}</label>
                    <div className="flex gap-1">
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-6 text-xs"
                            onClick={handleFormat}
                            disabled={disabled || !value.trim()}
                        >
                            {t("node_definitions.format_json")}
                        </Button>
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-6 text-xs"
                            onClick={handleCopy}
                            disabled={!value.trim()}
                        >
                            {copied ? <CheckIcon className="size-3" /> : <CopyIcon className="size-3" />}
                        </Button>
                    </div>
                </div>
            )}
            <textarea
                className={cn(
                    "w-full font-mono text-xs p-2 border rounded-md resize-y",
                    "focus:outline-none focus:ring-2 focus:ring-blue-500",
                    error ? "border-red-300" : "border-gray-200",
                    disabled && "opacity-50 cursor-not-allowed"
                )}
                value={value}
                onChange={handleChange}
                placeholder={placeholder}
                rows={rows}
                disabled={disabled}
            />
            {error && <p className="text-xs text-red-500">{error}</p>}
        </div>
    );
};

export default NodeDefinitionSchemaEditor;
