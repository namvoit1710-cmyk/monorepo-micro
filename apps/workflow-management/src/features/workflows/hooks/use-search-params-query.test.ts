/* @vitest-environment jsdom */
import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const queryState: Record<string, unknown> = {};
const setterMocks: Record<string, ReturnType<typeof vi.fn>> = {};
let locationState: any = {};

vi.mock("react-router-dom", () => ({
  useLocation: () => ({ state: locationState }),
}));

vi.mock("nuqs", () => ({
  createParser: () => ({ withDefault: (value: unknown) => value }),
  parseAsBoolean: { withDefault: (value: unknown) => value },
  parseAsInteger: { withDefault: (value: unknown) => value },
  parseAsString: { withDefault: (value: unknown) => value },
  useQueryState: (key: string, parser: unknown) => {
    if (!Object.prototype.hasOwnProperty.call(queryState, key)) {
      queryState[key] = parser;
    }

    if (!setterMocks[key]) {
      setterMocks[key] = vi.fn((value: unknown) => {
        queryState[key] = value;
      });
    }

    return [queryState[key], setterMocks[key]] as const;
  },
}));

import useSearchParamsQuery from "./use-search-params-query";

beforeEach(() => {
  locationState = {};
  Object.keys(queryState).forEach((key) => delete queryState[key]);
  Object.keys(setterMocks).forEach((key) => setterMocks[key].mockClear());
});

describe("useSearchParamsQuery", () => {
  it("returns default query state and resets page when filter values change", () => {
    queryState.workflowId = "all";
    queryState.q = "";
    queryState.mainFlow = false;
    queryState.page = 3;
    queryState.limit = 10;
    queryState.sort = [];
    queryState.dateRange = "";
    queryState.status = "";

    const { result } = renderHook(() => useSearchParamsQuery({ defaultSorting: [{ id: "created_at", desc: true }] }));

    expect(result.current.workflowId).toBe("all");
    expect(result.current.currentPage).toBe(3);

    act(() => {
      result.current.setSearch("new search");
    });

    expect(setterMocks.page).toHaveBeenCalledWith(1);
  });

  it("hydrates state from location listSearch and resets all search values", () => {
    locationState = {
      listSearch: {
        workflowId: "wf-9",
        search: "approval",
        currentPage: 5,
        limit: 20,
        sorting: [{ id: "created_at", desc: false }],
        dateRange: "2026-01-01",
        executionStatus: "failed",
        mainFlow: true,
      },
    };

    const { result, rerender } = renderHook(() => useSearchParamsQuery({ defaultSorting: [{ id: "created_at", desc: true }] }));

    act(() => {
      rerender();
    });

    expect(result.current.workflowId).toBe("wf-9");
    expect(result.current.search).toBe("approval");
    expect(result.current.currentPage).toBe(5);
    expect(result.current.mainFlow).toBe(true);
    expect(setterMocks.workflowId).toHaveBeenCalledWith("wf-9");
    expect(setterMocks.q).toHaveBeenCalledWith("approval");
    expect(setterMocks.page).toHaveBeenCalledWith(5);
  });

  it("clears search params with resetSearchQuery", () => {
    const { result } = renderHook(() => useSearchParamsQuery({ defaultSorting: [{ id: "created_at", desc: true }] }));

    act(() => {
      result.current.resetSearchQuery();
    });

    expect(setterMocks.workflowId).toHaveBeenCalledWith("");
    expect(setterMocks.q).toHaveBeenCalledWith("");
    expect(setterMocks.page).toHaveBeenCalledWith(1);
    expect(setterMocks.limit).toHaveBeenCalledWith(10);
    expect(setterMocks.sort).toHaveBeenCalledWith([{ id: "created_at", desc: true }]);
    expect(setterMocks.dateRange).toHaveBeenCalledWith("");
    expect(setterMocks.status).toHaveBeenCalledWith("");
  });
});