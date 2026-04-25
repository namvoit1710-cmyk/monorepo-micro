import { useCallback, useRef, useState } from "react";
import { useFormContext } from "react-hook-form";

export type RowAction = "insert" | "update" | "delete";

export interface ChangeRecord {
    _id: string;
    _action: RowAction;
    [key: string]: any;
}

export interface OperationRecord {
    operation: "insert" | "update" | "delete";
    row_id: string | null;
    data: Record<string, unknown>;
}

let feIdCounter = 0;
export const generateFeId = () => `fe_${Date.now()}_${++feIdCounter}`;

function toOperationRecord(record: ChangeRecord): OperationRecord {
    const { _id, _action, _status, _disabled, ...data } = record;

    return {
        operation: _action,
        row_id: _action === "insert" ? null : _id,
        data: _action === "delete" ? {} : data,
    };
}

interface UseChangeTrackerOptions {
    name: string;
}

export const useChangeTracker = ({ name }: UseChangeTrackerOptions) => {
    const { setValue } = useFormContext();
    const changeMapRef = useRef<Map<string, ChangeRecord>>(new Map());

    const [version, setVersion] = useState(0);

    const syncToRHF = useCallback(() => {
        const operations = Array.from(changeMapRef.current.values()).map(toOperationRecord);
        setValue(name, operations, { shouldDirty: true });
        setVersion((v) => v + 1);
    }, [name, setValue]);

    const trackInsert = useCallback((rowData: Record<string, any>) => {
        const _id = generateFeId();
        changeMapRef.current.set(_id, { ...rowData, _id, _action: "insert" });
        syncToRHF();
        return _id;
    }, [syncToRHF]);

    const trackUpdate = useCallback((rowId: string, rowData: Record<string, any>) => {
        const existing = changeMapRef.current.get(rowId);

        if (existing && existing._action === "insert") {
            changeMapRef.current.set(rowId, { ...existing, ...rowData, _id: rowId, _action: "insert" });
        } else {
            changeMapRef.current.set(rowId, { ...rowData, _id: rowId, _action: "update" });
        }
        syncToRHF();
    }, [syncToRHF]);

    const trackDelete = useCallback((rowId: string) => {
        const existing = changeMapRef.current.get(rowId);

        if (existing && existing._action === "insert") {
            changeMapRef.current.delete(rowId);
        } else {
            changeMapRef.current.set(rowId, { _id: rowId, _action: "delete" });
        }
        syncToRHF();
    }, [syncToRHF]);

    const trackDeleteBatch = useCallback((rowIds: string[]) => {
        rowIds.forEach((id) => {
            const existing = changeMapRef.current.get(id);
            if (existing && existing._action === "insert") {
                changeMapRef.current.delete(id);
            } else {
                changeMapRef.current.set(id, { _id: id, _action: "delete" });
            }
        });
        syncToRHF();
    }, [syncToRHF]);

    const resetChanges = useCallback(() => {
        changeMapRef.current.clear();
        setValue(name, [], { shouldDirty: false });
        setVersion((v) => v + 1);
    }, [name, setValue]);

    const getChanges = useCallback((): ChangeRecord[] => {
        return Array.from(changeMapRef.current.values());
    }, []);

    const hasChanges = useCallback((): boolean => {
        return changeMapRef.current.size > 0;
    }, []);

    return {
        trackInsert,
        trackUpdate,
        trackDelete,
        trackDeleteBatch,
        resetChanges,
        getChanges,
        hasChanges,
        changeMapRef,
        version,
    };
};