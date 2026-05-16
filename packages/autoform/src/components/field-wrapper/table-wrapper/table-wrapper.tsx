import { useCallback, useEffect, useMemo } from "react";
import { useFormContext } from "react-hook-form";

import { Search, X } from "lucide-react";

import type { PaginationState, Updater } from "@ldc/data-table";
import { DataTable } from "@ldc/data-table";
import { Button } from "@ldc/ui/components/button";
import { Input } from "@ldc/ui/components/input";
import { useBuilderContext } from "../../../contexts/builder.context";
import type { IField } from "../../../types/schema";
import { useTableColumns } from "./hooks/use-table-columns";
import { useTableData } from "./hooks/use-table-data";
import { useTableSearch } from "./hooks/use-table-search";
import { useTableSync } from "./hooks/use-table-sync";
import useValidateRow from "./hooks/use-validate-row";

export interface ITableWrapperProps {
    field?: IField;
    path?: string[];
}

const TableWrapper = ({ field: fieldControl, path }: ITableWrapperProps) => {
    if (!fieldControl || !path) {
        return null;
    }

    const name = useMemo(() => path.join("."), [path]);

    const { getValues, trigger, clearErrors } = useFormContext();
    const { onFormActions, registerRefetch, unregisterRefetch } = useBuilderContext();

    const subField = fieldControl.fields?.[0];
    const wrapperProps = fieldControl.fieldConfig.wrapperProps ?? {
        enablePagination: true,
    };
    const tableRowWrapper: IField = fieldControl.fields?.[0] ?? { key: "", outputType: "object", fieldConfig: {} };

    const isReadonly = !!subField?.fieldConfig.wrapperProps?.readonly;
    const showAdd = !!subField?.fieldConfig.wrapperProps?.add;
    const showMinus = !!subField?.fieldConfig.wrapperProps?.minus;

    const emptyRowTemplate = useMemo(() => {
        return Object.fromEntries(
            tableRowWrapper.fields?.filter((f: IField) => f.fieldConfig.fieldControl !== "ButtonControl").map((f: IField) => [f.key, f.default ?? null]) ?? []
        );
    }, [tableRowWrapper]);

    const { syncArrayToRHF } = useTableSync({ name });

    const initialData = useMemo(() => getValues(name) ?? [], [getValues, name]);

    const {
        tableData,
        ensureData,
        rowSelections,
        setRowSelections,
        selectedIds,
        pagination,
        setPagination,
        rowCount,
        handleInsertRow,
        handleRemoveRow,
        handleRemoveSelected,
        handleCellChange,
        handleRowChange,
        resetData,
    } = useTableData({
        initialData,
        emptyRowTemplate,
        onDataChange: syncArrayToRHF,
        initialRowCount: wrapperProps?.rowCount,
        initialPageSize: wrapperProps?.pageSize,
        initialPageIndex: wrapperProps?.pageIndex,
    });

    const {
        getRowError,
        addRowError,
        clearRowError,
        addRowSuccess,
        clearRowSuccess,
        getRowClassName,
        clearErrorByRowIds,
        clearSuccessByRowIds
    } = useValidateRow({
        onHasNoError: () => onFormActions?.("valid_data_trigger"),
        onHasError: () => onFormActions?.("invalid_data_trigger")
    });

    // Sync external data changes directly from wrapperProps (without re-mounting)
    useEffect(() => {
        if (wrapperProps?.data && Array.isArray(wrapperProps.data)) {
            resetData(wrapperProps.data, wrapperProps?.rowCount);
            syncArrayToRHF(wrapperProps.data, "reset");
        } else if (initialData && initialData.length > 0) {
            syncArrayToRHF(initialData, "reset");
        }
    }, [wrapperProps?.data, wrapperProps?.rowCount, resetData, syncArrayToRHF, initialData]);

    // Register refetch function with Builder
    useEffect(() => {
        if (registerRefetch) {
            registerRefetch(name, async () => {
                const currentData = getValues(name);
                resetData(currentData ?? []);
            });
        }
        return () => {
            unregisterRefetch?.(name);
        };
    }, [name, registerRefetch, unregisterRefetch, resetData, getValues]);

    const isSyncServer = wrapperProps?.isSyncServer ?? (!!wrapperProps?.callback || !!wrapperProps?.callApi);

    const { filteredData, updateSearch, searchValue, clearSearch } = useTableSearch({
        tableData,
        searchConfig: wrapperProps?.search,
        isSyncServer,
    });

    const { columns, initialColumnVisibility } = useTableColumns({
        tableRowWrapper,
        isReadonly,
        showAdd,
        showMinus,
        selectedIndex: selectedIds,
        onInsert: () => {
            clearErrors(name);
            handleInsertRow()
        },
        onRemoveRow: (rowId: string) => {
            handleRemoveRow(rowId)
            clearErrors(name);
            clearRowError(rowId);
            clearRowSuccess(rowId);
        },
        onRemoveSelected: () => {
            handleRemoveSelected()

            clearErrors(name)
            clearErrorByRowIds(selectedIds);
            clearSuccessByRowIds(selectedIds);
        },
        onCellChange: handleCellChange,
        isFiltering: !!searchValue,
        namePrefix: name,
        buttonAction: async (rest, row) => {
            const currentIndex = ensureData.findIndex((item: any) => item._id === row.original._id);
            if (currentIndex === -1) return;

            const isValidating = await trigger(`${name}.${currentIndex}`, { shouldFocus: true });
            if (!isValidating) return;

            return onFormActions?.(
                (rest.action),
                {
                    rowId: row.original._id,
                    rowData: row.original,
                    buttonAction: rest,
                    callback: (result: any, error: any) => {

                        if (error) {
                            addRowError(row.original._id, error.message || "Action failed");
                            return;
                        }

                        handleRowChange(row.original._id, result);
                        addRowSuccess(row.original._id, "Validation successful");
                    }
                }
            )
        }
    });

    const handlePaginationChange = useCallback(
        (updater: Updater<PaginationState>) => {
            const next = typeof updater === "function" ? updater(pagination) : updater;

            if (isSyncServer) {
                (wrapperProps.callback || wrapperProps.callApi)?.({ ...next });
            }
            setPagination(next);
        },
        [pagination, setPagination, isSyncServer, wrapperProps]
    );

    return (
        <div className="table-form-wrapper flex flex-col gap-6 w-full flex-2 h-full overflow-hidden bg-gray-50 p-4 rounded-3xl">
            {wrapperProps?.search && (
                <div className="relative">
                    <div className="text-muted-foreground pointer-events-none absolute inset-y-0 left-0 flex items-center justify-center pl-3 peer-disabled:opacity-50">
                        <Search className="size-4" />
                    </div>
                    <Input
                        type="text"
                        placeholder={wrapperProps?.search?.placeholder ?? "Search"}
                        className="pl-9 pr-9 h-9"
                        value={searchValue}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateSearch(e.target.value)}
                        onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                            if (e.key === "Enter" && isSyncServer) {
                                (wrapperProps?.callback || wrapperProps?.callApi)?.(searchValue);
                                setPagination((prev: PaginationState) => ({ ...prev, pageIndex: 0 }));
                            }
                        }}
                    />
                    {searchValue && (
                        <Button
                            variant="ghost"
                            size="icon"
                            className="absolute inset-y-0 right-0 h-full w-9 hover:bg-transparent"
                            onClick={() => {
                                clearSearch();
                                if (isSyncServer) {
                                    (wrapperProps?.callback || wrapperProps?.callApi)?.("");
                                    setPagination((prev: PaginationState) => ({ ...prev, pageIndex: 0 }));
                                }
                            }}
                        >
                            <X className="size-4" />
                        </Button>
                    )}
                </div>
            )}

            <DataTable
                {...wrapperProps}
                columns={columns}
                className=""
                data={filteredData}
                enableSelection
                enableMultiRowSelection
                rowSelection={rowSelections}
                onRowSelectionChange={setRowSelections}
                enableVirtualization

                pagination={pagination}
                manualPagination={isSyncServer}
                onPaginationChange={handlePaginationChange}
                rowCount={rowCount}
                enablePagination={wrapperProps.enablePagination ?? filteredData.length > pagination.pageSize}

                columnVisibility={initialColumnVisibility}

                getRowError={getRowError}
                getRowClassName={getRowClassName}
            />


        </div>
    );
};

export default TableWrapper;