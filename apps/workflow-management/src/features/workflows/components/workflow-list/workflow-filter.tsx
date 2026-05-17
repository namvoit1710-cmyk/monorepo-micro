import { useLanguage } from "@/components/containers/language-provider"
import { SearchInput } from "@common/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@common/components/ui/select"
import { useDebounceCallback } from "@common/hooks/use-debounce-callback"
import { useCallback, useEffect, useState } from "react"

type IFilter = {
    search: string,
    mainFlow: boolean
}

interface IWorkflowFilter {
    filter: IFilter,
    onChangeFilter: (filter: IFilter) => void
}

const WorkflowFilter = ({ filter, onChangeFilter }: IWorkflowFilter) => {
    const { t } = useLanguage();

    const { search, mainFlow } = filter;

    const [searchString, setSearchString] = useState(search);

    const handleSearchChange = useCallback((value: string) => {
        onChangeFilter({ ...filter, search: value })
    }, [filter, onChangeFilter])
    const debouncedSearch = useDebounceCallback(handleSearchChange, 500);

    useEffect(() => {
        if (search !== searchString) {
            setSearchString(search)
        }
    }, [search])

    return (
        <div className="flex items-center justify-end gap-2">
            <SearchInput
                placeholder={t("search_workflow")}
                value={searchString}
                onChange={(e) => {
                    setSearchString(e.target.value)
                    debouncedSearch(e.target.value)
                }}
            />


            <Select
                defaultValue="all"
                value={mainFlow ? "main" : "all"}
                onValueChange={(value) => onChangeFilter({ ...filter, mainFlow: value === "main" })}
            >
                <SelectTrigger>
                    <SelectValue
                        placeholder={t("main_flow_select")}
                    />
                </SelectTrigger>

                <SelectContent>
                    <SelectItem value="main">{t("main_flow")}</SelectItem>
                    <SelectItem value="all">{t("all_flows")}</SelectItem>
                </SelectContent>
            </Select>
        </div>
    )
}

export default WorkflowFilter