import type { ColumnDef } from "@ldc/data-table";
import { Button } from "@ldc/ui/components/button";
import { Minus, Plus } from "lucide-react";
import { useEffect, useMemo, useRef } from "react";
import type { IButtonAction, IField } from "../../../../types/schema";
import ActionCell from "../components/action-cell";
import TableCellField from "../components/table-cell-field";

interface UseTableColumnsOptions {
    tableRowWrapper: IField;
    isReadonly: boolean;
    showAdd: boolean;
    showMinus: boolean;
    selectedIndex: string[];
    onInsert: () => void;
    onRemoveRow: (id: string) => void;
    onRemoveSelected: () => void;
    onCellChange: (id: string, fieldKey: string, value: any) => void;
    isFiltering?: boolean;
    namePrefix?: string;
    buttonAction?: (control: IButtonAction, row: any) => void;
}

export const useTableColumns = ({
    tableRowWrapper,
    isReadonly,
    showAdd,
    showMinus,
    selectedIndex,
    onInsert,
    onRemoveRow,
    onRemoveSelected,
    onCellChange,
    isFiltering,
    namePrefix = "",
    buttonAction,
}: UseTableColumnsOptions) => {
    const lastestButtonAction = useRef(buttonAction);
    useEffect(() => {
        lastestButtonAction.current = buttonAction;
    }, [buttonAction]);

    const cellChangeRef = useRef(onCellChange);
    useEffect(() => {
        cellChangeRef.current = onCellChange;
    }, [onCellChange]);

    const dataColumns = useMemo<ColumnDef<any>[]>(() => {
        return tableRowWrapper?.fields?.map((field: IField) => ({
            accessorKey: field?.key,
            header: () => (
                <div className="flex items-center gap-1">
                    {field?.fieldConfig?.wrapperProps?.label}
                    {field?.fieldConfig?.rules?.find((rule) => rule?.method === "required") && (
                        <span className="text-destructive font-bold">*</span>
                    )}
                </div>
            ),
            size: field?.fieldConfig?.wrapperProps?.size ?? 200,
            minSize: Math.min(field?.fieldConfig?.wrapperProps?.minSize ?? 200, field?.fieldConfig?.wrapperProps?.size ?? 200),
            fixed: field?.fieldConfig?.wrapperProps?.fixed,
            cell: ({ row }: any) => {
                if (isReadonly) return row.getValue(field?.key);

                return (
                    <TableCellField
                        field={field}
                        value={row.getValue(field?.key)}
                        rowIndex={row.index}
                        rowId={row.original._id}
                        fieldKey={field?.key}
                        name={`${namePrefix}.${row.index}.${field?.key}`}
                        onCellChange={(...args) => cellChangeRef.current(...args)}
                        onClick={field.fieldConfig?.fieldControl === "ButtonControl" ? () => lastestButtonAction.current?.(
                            field.fieldConfig?.controlProps?.events, row
                        ) : () => null}
                    />
                );
            },
        })) ?? [];
    }, [tableRowWrapper, isReadonly]);

    const actionsColumn = useMemo<ColumnDef<any>[]>(() => {
        if (!showAdd && !showMinus) return [];

        return [{
            accessorKey: "actions",
            meta: { align: "center" as const },
            fixed: "right",
            minSize: 90,
            header: () => (
                <div className="flex items-center justify-center gap-2">
                    {showAdd && (
                        <Button
                            size="icon"
                            variant="outline"
                            onClick={onInsert}
                            disabled={isFiltering}
                        >
                            <Plus />
                        </Button>
                    )}
                    {showMinus && (
                        <Button
                            size="icon"
                            variant="destructive"
                            disabled={!selectedIndex.length}
                            onClick={onRemoveSelected}
                        >
                            <Minus />
                        </Button>
                    )}
                </div>
            ),
            cell: ({ row }: any) => {
                if (!showMinus) return null;

                return (
                    <div className="flex items-center justify-center gap-2">
                        {showMinus && (<ActionCell rowId={row.original._id} onRemove={onRemoveRow} />)}
                    </div>
                );
            },
        }];
    }, [showAdd, showMinus, onInsert, onRemoveSelected, onRemoveRow, selectedIndex.length, isFiltering, buttonAction]);

    const columns = useMemo<ColumnDef<any>[]>(
        () => [...dataColumns, ...actionsColumn],
        [dataColumns, actionsColumn]
    );

    const initialColumnVisibility = useMemo(() => {
        const visibility: Record<string, boolean> = {};

        tableRowWrapper?.fields?.forEach((field: IField) => {
            const hidden = field?.fieldConfig?.wrapperProps?.columnvisibility;
            visibility[field.key] = hidden !== "hidden";
        });

        return visibility;
    }, [tableRowWrapper]);

    return { columns, initialColumnVisibility };
};
