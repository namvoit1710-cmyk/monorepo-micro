import type { QueryKey, UseQueryOptions } from "@tanstack/react-query";

export interface IQueryKey<TKey, TListQuery = unknown, TDetailQuery = unknown> {
  all: readonly [TKey];
  lists: () => readonly [...IQueryKey<TKey>["all"], "list"];
  list: (
    query: TListQuery,
  ) => readonly [
    ...ReturnType<IQueryKey<TKey>["lists"]>,
    { query: TListQuery },
  ];
  details: () => readonly [...IQueryKey<TKey>["all"], "detail"];
  detail: (
    id: TDetailQuery,
    query?: TListQuery,
  ) => readonly [
    ...ReturnType<IQueryKey<TKey>["details"]>,
    TDetailQuery,
    { query: TListQuery },
  ];
}

export type UseQueryOptionsWrapper<
  TQueryFn = unknown,
  E = Error,
  TQueryKey extends QueryKey = QueryKey,
> = Omit<
  UseQueryOptions<TQueryFn, E, TQueryFn, TQueryKey>,
  "queryKey" | "queryFn"
>;

export const queryKeyFactory = <
  TKey,
  TListQueryType = unknown,
  TDetailQueryType = unknown,
>(
  key: TKey,
) => {
  return {
    all: [key] as const,
    lists: () => [...queryKeyFactory(key).all, "list"] as const,
    list: (query: TListQueryType) =>
      [...queryKeyFactory(key).lists(), query ? { query } : undefined].filter(
        (k) => !!k,
      ),
    details: () => [...queryKeyFactory(key).all, "detail"] as const,
    detail: (id: TDetailQueryType, query?: TListQueryType) =>
      [
        ...queryKeyFactory(key).details(),
        id,
        query ? { query } : undefined,
      ].filter((k) => !!k),
  };
};
