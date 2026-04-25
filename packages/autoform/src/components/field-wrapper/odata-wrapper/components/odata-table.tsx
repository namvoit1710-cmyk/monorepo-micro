import { IField } from "@common/components/ldc-auto-form/interfaces/component.interface";
import { DataTable } from "@common/components/ldc-table";
import { PaginationState } from "@tanstack/react-table";
import { useTableColumns } from "../hooks/use-table-columns";

export interface ODataTableControlProps<T> extends Omit<React.ComponentProps<typeof DataTable>, "columns" | "data"> {
    field: IField;
    data: T[];
    onPaginationChange: (pagination: PaginationState) => void;

    isDeletable?: boolean;
    isEditable?: boolean;
    isShowRowMoreAction?: boolean;

    sortState: {
        field: string;
        order: "asc" | "desc";
    } | null;
    onSortChange?: (field: string, order: "asc" | "desc") => void;

    rowSelection?: Record<string, boolean>;
    onRowSelectionChange?: (selectedRowIds: Record<string, boolean>) => void;

    onRowAction?: (action: string, row: T) => void;
}

const ODataTable = <T,>(props: ODataTableControlProps<T>) => {
    const {
        field,
        data,

        sortState,
        onSortChange,

        isDeletable,
        isEditable,
        isShowRowMoreAction,

        onRowAction,

        ...dataTableProps
    } = props;

    const subField: IField = field.fields?.[0];

    const { columns } = useTableColumns({
        tableRowWrapper: subField,
        isReadonly: field.fieldConfig.wrapperProps?.isReadonly ?? false,
        selectedIndex: [],
        sortState,
        onSortChange,
        isDeletable,
        isEditable,
        isShowRowMoreAction,
        onAction: (action: string, row: any) => {
            onRowAction?.(action, row.original);
        }
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