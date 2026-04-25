import { Slot } from "@common/components/ldc-auto-form/contexts/slot.context";
import { IField } from "@common/components/ldc-auto-form/interfaces/component.interface";
import { ColumnDef } from "@common/components/ldc-table";
import { Badge } from "@common/components/ui/badge";
import { Button } from "@common/components/ui/button";
import { Checkbox } from "@common/components/ui/checkbox";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@common/components/ui/dropdown-menu";
import { Eye, MoreHorizontal, Pencil, Trash } from "lucide-react";
import { useEffect, useMemo, useRef } from "react";
import { RowDisplayStatus } from "./use-table-data";

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
}

export const useTableColumns = ({
    tableRowWrapper,
    isReadonly,
    selectedIndex,

    isDeletable,
    isEditable,
    isShowRowMoreAction,

    sortState,
    onSortChange,

    onAction,
}: UseTableColumnsOptions) => {
    const onActionRef = useRef(onAction);
    const tableFields = Array.isArray(tableRowWrapper?.fields) ? tableRowWrapper.fields : [];

    useEffect(() => {
        onActionRef.current = onAction;
    }, [onAction]);

    const dataColumns = useMemo<ColumnDef<any>[]>(() => {
        return tableFields.map((field: IField) => {
            const rules = Array.isArray(field?.fieldConfig?.rules) ? field.fieldConfig.rules : [];

            const accessorKey = field?.fieldConfig?.controlProps?.aliasKey ?? field?.key;
            const rawKey = field?.key;

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

                    if (!isLocalChange || !hasOptions) {
                        const displayValue = row.getValue(accessorKey);

                        if (Array.isArray(displayValue)) {
                            return <BadgeCell labels={displayValue.map(String)} />;
                        }

                        if (typeof displayValue === "boolean") {
                            return (
                                <CheckboxCell checked={displayValue} />
                            );
                        }
                        return displayValue;
                    }

                    const rawValue = row.original[rawKey];
                    const resolved = resolveLabel(rawValue, options, valueKey, labelKey);

                    if (Array.isArray(resolved)) {
                        return <BadgeCell labels={resolved} />;
                    }

                    if (typeof resolved === "boolean") {
                        return <CheckboxCell checked={resolved} />;
                    }

                    return resolved;
                },
            };
        });
    }, [tableFields, isReadonly]);

    const actionsColumn = useMemo<ColumnDef<any>[]>(() => {
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

                                    <Slot name="row-more-action" />
                                </DropdownMenuContent>
                            </DropdownMenu>
                        )}
                    </div>
                );
            },
        }];
    }, [onActionRef, selectedIndex.length, isShowRowMoreAction]);

    const columns = useMemo<ColumnDef<any>[]>(
        () => [...dataColumns, ...actionsColumn],
        [dataColumns, actionsColumn]
    );

    return { columns };
};
