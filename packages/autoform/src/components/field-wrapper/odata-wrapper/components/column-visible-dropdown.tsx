import { Button } from "@common/components/ui/button";
import { Checkbox } from "@common/components/ui/checkbox";
import { SearchInput } from "@common/components/ui/input";
import { Label } from "@common/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@common/components/ui/popover";
import { useDebounceValue } from "@common/hooks/use-debounce-value";
import { ReactNode, useEffect, useState } from "react";

interface ColumnVisibleDropdownProps {
    children: ReactNode;
    value: Record<string, boolean>;
    columns: { label: string; key: string }[];
    onChange: (updatedColumns: Record<string, boolean>) => void;
}

const ColumnVisibleDropdown = ({ children, columns, value, onChange }: ColumnVisibleDropdownProps) => {
    const [open, setOpen] = useState(false);
    const [selectedColumns, setSelectedColumns] = useState(value);

    useEffect(() => {
        setSelectedColumns(value);
    }, [value]);

    const handleCheckedChange = (key: string, checked: boolean) => {
        const newSelectedColumns = { ...selectedColumns, [key]: checked };
        setSelectedColumns(newSelectedColumns);
    }

    const handleApplyColumnVisibility = () => {
        onChange(selectedColumns);
        setOpen(false);
    }

    const handleSelectAll = () => {
        const allVisible = columns.reduce((acc, col) => {
            acc[col.key] = true;
            return acc;
        }, {} as Record<string, boolean>);
        setSelectedColumns(allVisible);
    }

    const handleDeselectAll = () => {
        const allHidden = columns.reduce((acc, col) => {
            acc[col.key] = false;
            return acc;
        }, {} as Record<string, boolean>);
        setSelectedColumns(allHidden);
    }

    const [searchColumnString, setSearchColumnString] = useState("");
    const [debouncedSearchColumnString] = useDebounceValue(searchColumnString, 300);

    const filteredColumns = columns.filter((col) => col.label.toLowerCase().includes(debouncedSearchColumnString.toLowerCase()));

    const visibleCount = Object.values(selectedColumns).filter(Boolean).length;

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                {children}
            </PopoverTrigger>

            <PopoverContent align="end" className="min-w-64 max-h-[400px]! flex flex-col gap-3">
                <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">
                        Columns ({visibleCount}/{columns.length})
                    </span>
                    <div className="flex gap-1">
                        <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-7 text-xs"
                            onClick={handleSelectAll}
                        >
                            All
                        </Button>
                        <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-7 text-xs"
                            onClick={handleDeselectAll}
                        >
                            None
                        </Button>
                    </div>
                </div>

                <SearchInput
                    placeholder="Search column"
                    value={searchColumnString}
                    onChange={(e) => setSearchColumnString(e.target.value)}
                />

                <div className="flex flex-col gap-2 flex-2 overflow-y-auto">
                    {!filteredColumns.length && (
                        <div className="text-sm text-muted-foreground text-center py-2">No columns</div>
                    )}
                    {!!filteredColumns?.length && filteredColumns.map((column, index) => (
                        <div key={column.key} className="flex items-center space-x-2">
                            <Checkbox 
                                id={`column-${column.key}`} 
                                checked={selectedColumns[column.key] ?? true}
                                onCheckedChange={(checked: boolean) => handleCheckedChange(column.key, checked)}
                            />
                            <Label 
                                htmlFor={`column-${column.key}`} 
                                className="text-sm font-normal cursor-pointer flex-1"
                            >
                                {column.label}
                            </Label>
                        </div>
                    ))}
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setOpen(false)}
                    >
                        Cancel
                    </Button>
                    <Button
                        size="sm"
                        onClick={handleApplyColumnVisibility}
                    >
                        Apply
                    </Button>
                </div>
            </PopoverContent>
        </Popover>
    )
}

export default ColumnVisibleDropdown;