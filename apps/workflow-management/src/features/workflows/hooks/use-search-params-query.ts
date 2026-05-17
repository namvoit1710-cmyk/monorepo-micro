import { LIMIT_DEFAULT } from "@/constants/common";
import { SortingState } from "@tanstack/react-table";
import { createParser, parseAsBoolean, parseAsInteger, parseAsString, useQueryState } from "nuqs";
import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const parseAsSorting = createParser({
  parse(queryValue) {
    const inBetween = queryValue.split(".")
    if (inBetween.length !== 2) return []
    const [id, desc] = inBetween
    return [{ id, desc: desc === "true" }]
  },
  serialize(value) {
    if (!value || !value[0]) return null
    return `${value[0]?.id}.${value[0]?.desc}`
  }
})

const useSearchParamsQuery = ({defaultSorting}: {defaultSorting?: SortingState}) => {
   const [workflowId, setWorkflowId] = useQueryState("workflowId", parseAsString.withDefault("all"))
   const [search, setSearch] = useQueryState("q", parseAsString.withDefault(""))
   const [mainFlow, setMainFlow] = useQueryState("mainFlow", parseAsBoolean.withDefault(false))
   const [currentPage, setCurrentPage] = useQueryState("page", parseAsInteger.withDefault(1))
   const [limit, setLimit] = useQueryState("limit", parseAsInteger.withDefault(LIMIT_DEFAULT))
   const [sorting, setSorting] = useQueryState("sort", parseAsSorting.withDefault(defaultSorting ?? []))
   const [dateRange, setDateRange] = useQueryState("dateRange", parseAsString.withDefault(""))
   const [executionStatus, setExecutionStatus] = useQueryState("status", parseAsString.withDefault(""))

   const { state } = useLocation();

   useEffect(() => {
      if (currentPage !== 1) {
         setCurrentPage(1)
      }
   }, [search, limit, workflowId, dateRange, executionStatus, mainFlow])

   useEffect(() => {
        if (state?.listSearch) {
            const { workflowId, search, currentPage, limit, sorting, dateRange, executionStatus, mainFlow } = state.listSearch
            setWorkflowId(workflowId)
            setSearch(search)
            setLimit(limit)
            setSorting(sorting)
            setDateRange(dateRange)
            setExecutionStatus(executionStatus)
            setMainFlow(mainFlow)

            setCurrentPage(currentPage)
        }
   }, [state])

   const resetSearchQuery = () => {
      setWorkflowId("")
      setSearch("")
      setCurrentPage(1)
      setLimit(LIMIT_DEFAULT)
      setSorting(defaultSorting ?? [])
      setDateRange("")
      setExecutionStatus("")
   }

   const searchQueryParams = {
        workflowId,
        search,
        currentPage,
        limit,
        sorting,
        dateRange,
        mainFlow,
        executionStatus
   }

   return {
      dateRange,
      setDateRange,

      workflowId,
      setWorkflowId,

      mainFlow,
      setMainFlow,

      executionStatus,
      setExecutionStatus,
      
      search,
      setSearch,
      
      currentPage,
      setCurrentPage,
      
      limit,
      setLimit,
      
      sorting,
      setSorting,

      searchQueryParams,
      
      resetSearchQuery
   }
}

export default useSearchParamsQuery