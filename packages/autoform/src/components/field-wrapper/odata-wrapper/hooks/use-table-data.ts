/* eslint-disable react-hooks/refs */
// import { PaginationState } from "@common/components/ldc-table";
// import { startTransition, useCallback, useEffect, useMemo, useState } from "react";
// import { TableDataChangeType } from "./use-table-sync";

// let rowIdCounter = 0;
// export const generateRowId = () => `_trow_${++rowIdCounter}`;

// export const ensureRowIds = (data: any[]): any[] => {
//     if (!Array.isArray(data)) return [];
//     return data.map(item =>
//         item._id ? item : { ...item, _id: generateRowId() }
//     );
// };

// interface UseTableDataOptions {
//     emptyRowTemplate: Record<string, any>;
//     initialData: any[];
//     onDataChange: (data: any[], changeType: TableDataChangeType) => void;
//     setPagination: (pagination: PaginationState | ((prev: PaginationState) => PaginationState)) => void;

//     selectedRows: Record<string, boolean>;
//     resetSelectedRow: () => void;
// }

// export const useTableData = ({
//     emptyRowTemplate,
//     initialData,
//     onDataChange,
//     setPagination,
//     selectedRows,
//     resetSelectedRow,
// }: UseTableDataOptions) => {
//     const [tableData, setTableData] = useState<any[]>(() => initialData.map((item, index) => ({ ...item, _id: item.id || index })));

//     useEffect(() => {
//         setTableData(initialData.map((item, index) => ({ ...item, _id: item.id || index })));
//     }, [initialData]);

//     const ensureData = useMemo(() => {
//         return ensureRowIds(tableData);
//     }, [tableData]);

//     const applyChange = useCallback((updater: (prev: any[]) => any[], changeType: TableDataChangeType) => {
//         setTableData(prev => {
//             const next = updater(prev);
//             return next;
//         });
//     }, [onDataChange]);

//     const handleInsertRow = useCallback(() => {
//         const newRow = { ...emptyRowTemplate, _id: generateRowId() };
//         applyChange(prev => [newRow, ...prev], "insert");
//         startTransition(() => {
//             setPagination((prev: PaginationState) => ({ ...prev, pageIndex: 0 }));
//         });
//     }, [emptyRowTemplate, applyChange, setPagination]);

//     const handleRemoveRow = useCallback((id: string) => {
//         applyChange(prev => prev.filter((item) => item._id !== id), "remove");
//     }, [applyChange]);

//     const handleRemoveSelected = useCallback(() => {
//         applyChange(prev => prev.filter((item) => !selectedRows[item._id]), "remove");
//         resetSelectedRow();
//     }, [selectedRows, applyChange, resetSelectedRow]);

//     const handleCellChange = useCallback((id: string, fieldKey: string, value: any) => {
//         applyChange(prev => {
//             return prev.map(item => 
//                 item._id === id ? { ...item, [fieldKey]: value } : item
//             );
//         }, "cell-change");
//     }, [applyChange]);

//     const handleRowChange = useCallback((id: string, partial: Record<string, any>) => {
//         applyChange(prev =>
//             prev.map(item =>
//                 item._id === id ? { ...item, ...partial } : item
//             )
//         , "cell-change");
//     }, [applyChange]);

//     return {
//         tableData,
//         ensureData,
        
//         handleInsertRow,
//         handleRemoveRow,
//         handleCellChange,
//         handleRowChange,
//         handleRemoveSelected,
//     };
// };

import { useMemo } from "react";
import type { ChangeRecord } from "./use-change-tracker";

export type RowDisplayStatus = "inserted" | "updated" | "deleted" | "none";

export interface DisplayRow {
    _id: string;
    _status: RowDisplayStatus;
    _disabled: boolean;
    [key: string]: any;
}

interface UseTableDataOptions {
    serverData: any[];
    changeMapRef: React.RefObject<Map<string, ChangeRecord>>;
    version: number;
}

export const useTableData = ({
    serverData,
    changeMapRef,
    version,
}: UseTableDataOptions) => {
    const tableData = useMemo<DisplayRow[]>(() => {
        const changeMap = changeMapRef.current;

        const insertedRows: DisplayRow[] = [];
        changeMap.forEach((record) => {
            if (record._action === "insert") {
                insertedRows.unshift({
                    ...record,
                    _status: "inserted",
                    _disabled: false,
                });
            }
        });

        const serverRows: DisplayRow[] = serverData.map((row) => {
            const id = row._id ?? row.id ?? row.ID;
            const change = changeMap.get(String(id));

            if (!change) {
                return { ...row, _id: String(id), _status: "none", _disabled: false };
            }

            if (change._action === "delete") {
                return { ...row, _id: String(id), _status: "deleted", _disabled: true };
            }

            if (change._action === "update") {
                const { _id, _action, ...updatedFields } = change;
                return { ...row, ...updatedFields, _id: String(id), _status: "updated", _disabled: false };
            }

            return { ...row, _id: String(id), _status: "none", _disabled: false };
        });

        return [...insertedRows, ...serverRows];
    }, [serverData, version]);

    return { tableData };
};