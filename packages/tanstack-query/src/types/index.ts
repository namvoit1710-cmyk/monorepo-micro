import type {
  InfiniteData,
  MutationFunction,
  QueryClient,
  QueryFunction,
  QueryKey,
  UseMutationOptions as TanstackUseMutationOptions,
  UseQueryOptions as TanstackUseQueryOptions,
  UseInfiniteQueryOptions,
  UseMutationResult,
  UseQueryResult,
} from "@tanstack/react-query";

interface UseQueryOptions<
  TData = unknown,
  TQueryParams = unknown,
  TError = unknown,
  TQueryKey extends QueryKey = QueryKey,
> extends Omit<
    TanstackUseQueryOptions<TData, TError, TData, TQueryKey>,
    "queryKey" | "queryFn"
  > {
  queryKey: TQueryKey;
  queryFn: QueryFunction<TData, TQueryKey>;
  queryParams?: TQueryParams;
}

interface UseMutationOptions<
  TData = unknown,
  TVariables = unknown,
  TError = unknown,
  TContext = unknown,
> extends Omit<
    TanstackUseMutationOptions<TData, TError, TVariables, TContext>,
    "mutationFn"
  > {
  mutationFn: MutationFunction<TData, TVariables>;
}

export type {
  UseQueryOptions,
  UseMutationOptions,
  QueryKey,
  QueryClient,
  UseQueryResult,
  UseMutationResult,
  InfiniteData,
  UseInfiniteQueryOptions,
};
