/* eslint-disable react-hooks/refs */

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