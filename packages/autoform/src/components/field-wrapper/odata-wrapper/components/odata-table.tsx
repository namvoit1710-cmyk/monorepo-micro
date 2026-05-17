import type { PaginationState } from "@ldc/data-table";
import { DataTable } from "@ldc/data-table";
import type { IField } from "../../../../types/schema";
import { useTableColumns } from "../hooks/use-table-columns";

export interface ODataTableControlProps<T> extends Omit<React.ComponentProps<typeof DataTable>, "columns" | "data"> {
    field: IField;
    data: T[];
    onPaginationChange: (pagination: PaginationState) => void;

    isDeletable?: boolean;
    isEditable?: boolean;
    isShowRowMoreAction?: boolean;

    trackUpdate: (rowId: string, partial: Record<string, any>) => void;

    sortState: {
        field: string;
        order: "asc" | "desc";
    } | null;
    onSortChange?: (field: string, order: "asc" | "desc") => void;

    rowSelection?: Record<string, boolean>;
    onRowSelectionChange?: (selectedRowIds: Record<string, boolean>) => void;

    onRowAction?: (action: string, row: T) => void;
}

const ODataTable = <T extends { _id: string },>(props: ODataTableControlProps<T>) => {
    const {
        field,
        data,

        sortState,
        onSortChange,

        isDeletable,
        isEditable,
        isShowRowMoreAction,

        onRowAction,

        trackUpdate,

        ...dataTableProps
    } = props;

    const subField = field.fields?.[0];

    const { columns } = useTableColumns({
        tableRowWrapper: subField!,
        isReadonly: field.fieldConfig.wrapperProps?.isReadonly ?? false,
        selectedIndex: [],
        sortState,
        onSortChange,
        isDeletable,
        isEditable,
        isShowRowMoreAction,
        onAction: (action: string, row: any) => {
            onRowAction?.(action, row.original);
        },
        trackUpdate: trackUpdate,
    })

    return (
        <DataTable
            data={data}
            columns={columns}

            enableSelection
            enableMultiRowSelection

            enablePagination
            manualPagination
            enableVirtualization

            {...dataTableProps}
        />
    );
};

export default ODataTable;