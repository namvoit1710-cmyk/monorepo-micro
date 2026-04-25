import { useBuilderContext } from "@common/components/ldc-auto-form/contexts/builder.context";
import { IField } from "@common/components/ldc-auto-form/interfaces/component.interface";
import { IFormFieldControlBaseProps } from "@common/components/ldc-auto-form/interfaces/form-field.interface";
import { useMessageBox, withMessageBox } from "@common/components/ldc-confirmation/messagebox-provider";
import { Button } from "@common/components/ui/button";
import { SearchInput } from "@common/components/ui/input";
import { cn } from "@common/lib/utils";
import { Columns3Cog, Plus, Trash2 } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import { useChangeTracker } from "../hooks/use-change-tracker";
import useColumnVisible from "../hooks/use-column-visibility";
import { useODataFetch } from "../hooks/use-odata-fetch";
import { useODataState } from "../hooks/use-odata-state";
import useRowSelection from "../hooks/use-row-selection";
import { useTableData } from "../hooks/use-table-data";
import ColumnVisibleDropdown from "./column-visible-dropdown";
import OdataAddEditModal from "./odata-add-edit-modal";
import ODataTable from "./odata-table";

import { BuilderServices } from "@common/components/ldc-auto-form/hooks/use-builder-services";

import { Slot } from "@common/components/ldc-auto-form/contexts/slot.context";
import { useFormContext } from "react-hook-form";
import "../styles/styles.css";
import MoreActionDropdown from "./more-action-dropdown";

export interface IODataWrapperProps extends IFormFieldControlBaseProps {
    field: IField;
    path: string[];
}

const OdataWrapper = (props: IODataWrapperProps) => {
    const { field, path } = props;

    const name: string = useMemo(() => path.join("."), [path]);

    const { getValues } = useFormContext();
    const { services, onFormActions } = useBuilderContext();

    const fileId = getValues(`__${field.key}_file_id`);
    console.log("fileId", `__${field.key}_file_id`, fileId);

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
        odataService: services?.odata as BuilderServices["odata"],
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
    const [selectedRow, setSelectedRow] = useState<any>(null);

    const messageBox = useMessageBox();
    const handleRowAction = async (action: string, row: any) => {
        if (action === "edit") {
            setSelectedRow(row);
            setIsRowActionModal(true);
        }

        if (action === "delete") {
            const confirmed = await messageBox("Are you sure you want to delete this row?", "Confirm Delete");
            if (confirmed) {
                trackDelete(row._id);
            }
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
        const confirmed = await messageBox("Are you sure you want to delete selected rows?", "Confirm Delete");

        if (confirmed) {
            const selectedIds = Object.keys(rowSelections).filter((id) => rowSelections[id]);
            trackDeleteBatch(selectedIds);
            setRowSelections({});
        }
    };

    const getRowClassName = useCallback((row: any) => {
        switch (row.original._status) {
            case "inserted": return "bg-green-50 border-l-4 border-l-green-500";
            case "updated": return "bg-yellow-50 border-l-4 border-l-yellow-500";
            case "deleted": return "bg-red-50 border-l-4 border-l-red-500 opacity-60 pointer-events-none";
            default: return "";
        }
    }, []);

    return (
        <>
            <section className="flex flex-col gap-2">
                <div className="flex items-center gap-4 justify-between">
                    {isShowSearch ? <SearchInput wrapperClassName="flex-2 max-w-100" disabled={isLoading} /> : <span />}

                    <div className="flex items-center justify-end gap-2">
                        <Slot name="filter" />

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

                        sortState={
                            sortState?.field
                                ? { field: sortState.field, order: sortState.order }
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
                field={field}
                isEdit={!!selectedRow}
                defaultValues={selectedRow}

                onSubmit={handleAddEditSubmit}
            />
        </>
    )
}

export default withMessageBox(OdataWrapper);