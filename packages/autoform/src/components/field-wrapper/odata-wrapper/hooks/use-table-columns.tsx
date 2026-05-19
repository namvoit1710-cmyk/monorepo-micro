import type { ColumnDef } from "@ldc/data-table";
import { Badge } from "@ldc/ui/components/badge";
import { Button } from "@ldc/ui/components/button";
import { Checkbox } from "@ldc/ui/components/checkbox";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@ldc/ui/components/dropdown-menu";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@ldc/ui/components/tooltip";
import { AlertCircle, AlertTriangle, Eye, MoreHorizontal, Pencil, Trash } from "lucide-react";
import { useEffect, useMemo, useRef } from "react";
import { Slot } from "../../../../contexts/slot.context";
import type { IField } from "../../../../types/schema";
import type { RowDisplayStatus } from "./use-table-data";

interface OptionItem {
    label: string;
    value: string | number;
    [key: string]: any;
}

const normalizeOptions = (raw: any[]): OptionItem[] => {
    if (!Array.isArray(raw)) return [];

    return raw.map((opt) => {
        if (typeof opt === "string" || typeof opt === "number") {
            return { label: String(opt), value: opt };
        }
        return {
            label: opt.label ?? opt.name ?? opt.text ?? String(opt.value ?? opt.id),
            value: opt.value ?? opt.id ?? opt.code,
            ...opt,
        };
    });
};

const resolveLabel = (value: any, options: OptionItem[], valueKey?: string, labelKey?: string): string | string[] => {
    if (options.length === 0) return value;

    if (Array.isArray(value)) {
        return value.map((v) => {
            const found = options.find((opt) => String(opt[valueKey ?? "id"]) === String(v));
            return found?.[labelKey ?? "value"] ?? String(v);
        });
    }

    const found = options.find((opt) => String(opt[valueKey ?? "id"]) === String(value));
    return found?.[labelKey ?? "value"] ?? String(value ?? "");
};

const BadgeCell = ({ labels }: { labels: string[] }) => (
    <div className="flex flex-wrap gap-1">
        {labels.map((label) => (
            <Badge key={label} variant="secondary" className="text-xs">
                {label}
            </Badge>
        ))}
    </div>
);

const CheckboxCell = ({ checked }: { checked: boolean }) => (
    <div className="flex items-center justify-center">
        <Checkbox checked={checked} aria-readonly />
    </div>
);

const ValidationIcon = ({ status, message }: { status: "error" | "warning"; message: string }) => {
    const Icon = status === "error" ? AlertCircle : AlertTriangle;
    const colorClass = status === "error" ? "text-destructive" : "text-yellow-500";

    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger>
                    <Icon className={`size-4 ${colorClass} ml-2 inline-block`} />
                </TooltipTrigger>
                <TooltipContent>
                    <p>{message}</p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
};

interface UseTableColumnsOptions {
    tableRowWrapper: IField;
    isReadonly: boolean;
    selectedIndex: string[];

    isDeletable?: boolean;
    isEditable?: boolean;
    isShowRowMoreAction?: boolean;

    sortState: {
        field: string;
        order: "asc" | "desc";
    } | null;
    onSortChange?: (field: string, order: "asc" | "desc") => void;

    onAction?: (action: string, row: any) => void;

    trackUpdate: (rowId: string, partial: Record<string, any>) => void;
}

export const useTableColumns = <T extends { _id: string },>({
    tableRowWrapper,
    isReadonly,
    selectedIndex,

    isDeletable,
    isEditable,
    isShowRowMoreAction,

    sortState,
    onSortChange,

    onAction,

    trackUpdate,
}: UseTableColumnsOptions) => {
    const onActionRef = useRef(onAction);
    const tableFields = Array.isArray(tableRowWrapper?.fields) ? tableRowWrapper.fields : [];

    useEffect(() => {
        onActionRef.current = onAction;
    }, [onAction]);

    const dataColumns = useMemo<ColumnDef<T>[]>(() => {
        return tableFields.map((field: IField) => {
            const rules = Array.isArray(field?.fieldConfig?.rules) ? field.fieldConfig.rules : [];

            const accessorKey = field?.fieldConfig?.controlProps?.aliasKey ?? field?.key;
            const rawKey = field?.fieldConfig?.controlProps?.aliasKey ?? field?.key;

            const valueKey = field?.fieldConfig?.controlProps?.valueKey ?? "id";
            const labelKey = field?.fieldConfig?.controlProps?.labelKey ?? "value";
            const options = normalizeOptions(field?.fieldConfig?.controlProps?.options ?? []);
            const hasOptions = options.length > 0;

            return {
                accessorKey: field?.fieldConfig?.controlProps?.aliasKey ?? field?.key,
                header: () => (
                    <div className="flex items-center gap-1">
                        {field?.fieldConfig?.wrapperProps?.label}
                        {rules.find((rule) => rule?.method === "required") && (
                            <span className="text-destructive font-bold">*</span>
                        )}
                    </div>
                ),
                meta: { align: field?.fieldConfig?.wrapperProps?.align ?? "left" as const },
                size: field?.fieldConfig?.wrapperProps?.size ?? 200,
                minSize: Math.min(field?.fieldConfig?.wrapperProps?.minSize ?? 200, field?.fieldConfig?.wrapperProps?.size ?? 200),
                fixed: field?.fieldConfig?.wrapperProps?.fixed,
                cell: ({ row }: any) => {
                    const status: RowDisplayStatus = row.original._status;
                    const isLocalChange = status === "inserted" || status === "updated";

                    const validateStatus = row.original.__validate_status as "error" | "warning" | undefined;
                    const validateMessage = row.original.__validate_message as string | undefined;
                    const showValidation = validateStatus && validateMessage && (validateStatus === "error" || validateStatus === "warning") && row.original.__validate_field === rawKey;

                    let content: React.ReactNode;

                    if (!isLocalChange || !hasOptions) {
                        const displayValue = row.getValue(accessorKey);

                        if (Array.isArray(displayValue)) {
                            content = <BadgeCell labels={displayValue.map(String)} />;
                        } else if (typeof displayValue === "boolean") {
                            content = <CheckboxCell checked={displayValue} />;
                        } else {
                            content = displayValue;
                        }
                    } else {
                        const rawValue = row.original[rawKey];
                        const resolved = resolveLabel(rawValue, options, valueKey, labelKey);

                        if (Array.isArray(resolved)) {
                            content = <BadgeCell labels={resolved} />;
                        } else if (typeof resolved === "boolean") {
                            content = <CheckboxCell checked={resolved} />;
                        } else {
                            content = resolved;
                        }
                    }

                    return (
                        <div className="flex items-center gap-1">
                            {showValidation && (
                                <ValidationIcon
                                    status={validateStatus}
                                    message={validateMessage}
                                />
                            )}

                            <span className="line-clamp-2">
                                {content}
                            </span>
                        </div>
                    );
                },
            };
        });
    }, [tableFields, isReadonly]);

    const actionsColumn = useMemo<ColumnDef<T>[]>(() => {
        return [{
            accessorKey: "actions",
            meta: { align: "center" as const },
            fixed: "right",
            size: 120,
            header: "",
            cell: ({ row }: any) => {
                return (
                    <div className="flex items-center justify-center gap-2">
                        {isEditable && (
                            <Button variant="outline" size="icon-sm" onClick={() => onActionRef.current?.("edit", row)}>
                                <Pencil />
                            </Button>
                        )}

                        <Button variant="outline" size="icon-sm" onClick={() => onActionRef.current?.("view", row)}>
                            <Eye />
                        </Button>

                        {isShowRowMoreAction && (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon-sm">
                                        <MoreHorizontal />
                                    </Button>
                                </DropdownMenuTrigger>

                                <DropdownMenuContent align="end" className="w-50">
                                    {isDeletable && (
                                        <DropdownMenuItem variant="destructive" onClick={() => onActionRef.current?.("delete", row)}>
                                            <Trash className="mr-2" />
                                            Delete
                                        </DropdownMenuItem>
                                    )}

                                    <Slot
                                        name="row-more-action"
                                        rowId={row.original._id}
                                        rowData={row.original}
                                        updateRow={(partial: Record<string, any>) => trackUpdate(row.original._id, partial)}
                                    />
                                </DropdownMenuContent>
                            </DropdownMenu>
                        )}
                    </div>
                );
            },
        }];
    }, [onActionRef, selectedIndex.length, isShowRowMoreAction]);

    const columns = useMemo<ColumnDef<T>[]>(
        () => [...dataColumns, ...actionsColumn],
        [dataColumns, actionsColumn]
    );

    return { columns };
};
