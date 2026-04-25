import { IField } from "@common/components/ldc-auto-form/interfaces/component.interface";
import { useState } from "react";

interface IUseColumnVisibleProps {
    field: IField;
}

const useColumnVisible = ({
    field,
}: IUseColumnVisibleProps) => {

    const subFields: IField = field?.fields?.[0];
    const columns = (subFields?.fields ?? [])?.map((subField) => ({
        key: subField.key,
        label: subField.fieldConfig?.wrapperProps?.label || subField.key,
    }));

    const initialVisibility = columns.reduce((acc, col) => {
        acc[col.key] = true;
        return acc;
    }, {} as Record<string, boolean>);

    const [visibleColumns, setVisibleColumns] = useState<Record<string, boolean>>(initialVisibility);

    return {
        columns,
        visibleColumns,
        setVisibleColumns,
    }
}

export default useColumnVisible;