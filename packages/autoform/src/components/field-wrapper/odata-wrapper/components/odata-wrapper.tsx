import { AlertCircle, Columns3Cog, Plus, Trash2 } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useChangeTracker } from "../hooks/use-change-tracker";
import useColumnVisible from "../hooks/use-column-visibility";
import { useODataFetch } from "../hooks/use-odata-fetch";
import { useODataState } from "../hooks/use-odata-state";
import useRowSelection from "../hooks/use-row-selection";
import { useTableData } from "../hooks/use-table-data";
import ColumnVisibleDropdown from "./column-visible-dropdown";
import OdataAddEditModal from "./odata-add-edit-modal";
import ODataTable from "./odata-table";

import { cn } from "@ldc/ui";
import { SearchInput } from "@ldc/ui/blocks/search-input/search-input";
import { Button } from "@ldc/ui/components/button";
import { useFormContext } from "react-hook-form";
import { useBuilderContext } from "../../../../contexts/builder.context";
import { Slot } from "../../../../contexts/slot.context";
import type { FieldWrapperProps, IField } from "../../../../types/schema";
import MoreActionDropdown from "./more-action-dropdown";

import "../styles/styles.css";

export interface IODataWrapperProps extends FieldWrapperProps {
    field: IField;
    path: string[];
}

const OdataWrapper = (props: IODataWrapperProps) => {
    const { field, path } = props;

    const name: string = useMemo(() => path.join("."), [path]);

    const { getValues, getFieldState } = useFormContext();
    const { error } = getFieldState(name);
    const { services, registerRefetch, unregisterRefetch } = useBuilderContext();

    const fileId = getValues(`__${name}_file_id`);

    const wrapperProps = field.fieldConfig.wrapperProps || {};
    const {
        isAdd = true,
        isEdit = true,
        isDelete = true,
        isShowMoreAction = true,
        isShowColumnSetting = true,
        isShowSearch = true,
        isShowRowMoreAction = true,
    } = wrapperProps;

    const {
        trackInsert, trackUpdate, trackDelete, trackDeleteBatch,
        changeMapRef, version,
    } = useChangeTracker({ name });

    const customHandlers = useMemo(() => ({
        updateTableData: (ctx: any) => {
            const updatedRows = ctx.lastResult?.updatedRows;
            if (!updatedRows || !Array.isArray(updatedRows)) {
                console.warn("[ODataWrapper] updateTableData: no updatedRows in lastResult");
                return;
            }

            updatedRows.forEach(row => {
                if (row._id) {
                    trackUpdate(row._id, row);
                }
            });
        }
    }), [trackUpdate]);

    const {
        pagination,
        setPagination,

        setSort,
        sortState,

        searchValue,
        getFilterString,
        getOrderByString,
    } = useODataState();

    const odataService = useODataFetch({
        odataService: services?.odata,
        endpoint: fileId ? `odata/${fileId}/data` : field?.fieldConfig?.wrapperProps?.endpoint,
        pagination,
        defaultOrderBy: getOrderByString(),
        defaultFilter: getFilterString(),
        searchValue,
    });
    const isLoading = odataService.loading;

    const { tableData } = useTableData({
        serverData: odataService?.data || [],
        changeMapRef,
        version,
    });

    const { columns, visibleColumns, setVisibleColumns } = useColumnVisible({ field });
    const showLoading = isLoading;

    const { rowSelections, hasRowSelected, setRowSelections } = useRowSelection();

    const [isRowActionModal, setIsRowActionModal] = useState(false);
    const [readOnly, setReadOnly] = useState(false);
    const [selectedRow, setSelectedRow] = useState<any>(null);

    const handleRowAction = async (action: string, row: any) => {
        if (action === "edit") {
            setSelectedRow(row);
            setIsRowActionModal(true);
        }

        if (action === "view") {
            setSelectedRow(row);
            setReadOnly(true);
            setIsRowActionModal(true);
        }

        if (action === "delete") {
            trackDelete(row._id);
            return;
        }
    }

    const handleAddEditSubmit = (rowData: Record<string, any>) => {
        setIsRowActionModal(false);
        setSelectedRow(null);

        if (selectedRow) {
            trackUpdate(selectedRow._id, rowData);
            return;
        }

        trackInsert(rowData);
    }

    const handleRemoveSelectedRows = async () => {
        // const confirmed = await messageBox("Are you sure you want to delete selected rows?", "Confirm Delete");

        // if (confirmed) {
        const selectedIds = Object.keys(rowSelections).filter((id) => rowSelections[id]);
        trackDeleteBatch(selectedIds);
        setRowSelections({});
        // }
    };

    const getRowClassName = useCallback((row: any) => {
        switch (row.original.__validate_status) {
            case "error": return "bg-red-50 border-l-4 border-l-red-500";
            case "warning": return "bg-yellow-50 border-l-4 border-l-yellow-500";
            case "success": return "bg-green-50 border-l-4 border-l-green-500";
        }

        switch (row.original.__status) {
            case "inserted": return "bg-green-50 border-l-4 border-l-green-500";
            case "edited": return "bg-yellow-50 border-l-4 border-l-yellow-500";
            case "deleted": return "bg-red-50 border-l-4 border-l-red-500 opacity-60 pointer-events-none";
            default: return "";
        }
    }, []);

    useEffect(() => {
        registerRefetch?.(field.key, odataService.refetch);
        return () => unregisterRefetch?.(field.key);
    }, [odataService.refetch, field.key]);

    return (
        <>
            <section className="flex flex-col gap-2">
                {error && (
                    <div className="flex items-center gap-2 p-3 rounded-md bg-destructive/10 border border-destructive/20">
                        <AlertCircle className="size-5 text-destructive shrink-0" />
                        <span className="text-sm text-destructive font-medium">
                            {error.message}
                        </span>
                    </div>
                )}

                <div className="flex items-center gap-4 justify-between">
                    {isShowSearch ? <SearchInput wrapperClassName="flex-2 max-w-100" disabled={isLoading} /> : <span />}

                    <div className="flex items-center justify-end gap-2">
                        <Slot
                            name="filter"
                            slotData={{
                                tableData,
                                rowSelections,
                                pagination,
                                sortState,
                                searchValue,
                                customHandlers
                            }}
                        />

                        <span className="h-4 w-0.5 bg-muted" />

                        <div className="flex items-center gap-1 justify-end">
                            {isDelete && (
                                <Button
                                    variant="destructive"
                                    size="icon"
                                    disabled={!hasRowSelected || isLoading}

                                    onClick={handleRemoveSelectedRows}
                                >
                                    <Trash2 />
                                </Button>
                            )}

                            {isAdd && (
                                <Button
                                    disabled={isLoading}
                                    onClick={() => setIsRowActionModal(true)}
                                >
                                    <Plus className="mr-2 size-4" />
                                    Add Row
                                </Button>
                            )}

                            {isShowColumnSetting &&
                                <ColumnVisibleDropdown
                                    value={visibleColumns}
                                    columns={columns}
                                    onChange={setVisibleColumns}
                                >
                                    <Button variant="outline" size="icon" disabled={isLoading}>
                                        <Columns3Cog className="size-4" />
                                    </Button>
                                </ColumnVisibleDropdown>
                            }

                            {isShowMoreAction && <MoreActionDropdown />}
                        </div>
                    </div>
                </div>

                <div
                    className={cn(
                        "relative min-h-60 flex-2 overflow-hidden transition-opacity",
                        showLoading ? "opacity-60 pointer-events-none" : ""
                    )}
                >
                    {showLoading && (
                        <div className="loader-bar w-full" />
                    )}

                    <ODataTable
                        field={field}
                        data={tableData}

                        isEditable={isEdit}
                        isDeletable={isDelete}
                        isShowRowMoreAction={isShowRowMoreAction}

                        rowCount={odataService.totalCount ? odataService.totalCount : tableData.length}
                        manualPagination={!!odataService.totalCount}
                        pagination={pagination}
                        onPaginationChange={setPagination}

                        columnVisibility={visibleColumns}

                        rowSelection={rowSelections}
                        onRowSelectionChange={setRowSelections}

                        trackUpdate={trackUpdate}

                        sortState={
                            sortState?.field
                                ? { field: sortState.field, order: sortState.order ?? "asc" }
                                : { field: "", order: "asc" }
                        }
                        onSortChange={setSort}

                        onRowAction={handleRowAction}
                        getRowClassName={getRowClassName}
                    />
                </div>
            </section>

            <OdataAddEditModal
                open={isRowActionModal}
                onOpenChange={(open) => {
                    if (!open) {
                        setIsRowActionModal(false);
                        setSelectedRow(null);
                    }
                }}
                readOnly={readOnly}
                field={field}
                isEdit={!!selectedRow}
                defaultValues={selectedRow}

                onSubmit={handleAddEditSubmit}
            />
        </>
    )
}

export default OdataWrapper;