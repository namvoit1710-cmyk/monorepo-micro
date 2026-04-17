# TanStack Query

**Version:** `@tanstack/react-query@^5.90.20`
**Internal package:** `@ldc/tanstack-query`

TanStack Query (formerly React Query) is the primary **server state** management library in LDC. All data coming from the API flows through TanStack Query — `useState + useEffect` for data fetching is not used.

---

## Why TanStack Query?

Without TanStack Query, every component has to manage its own `isLoading`, `error`, `data`, refetch, cache, and cancellation logic. This leads to duplicated code, race conditions, and out-of-sync UI. TanStack Query solves all of these problems.

---

## Pros

**Smart caching:** Data is cached by `queryKey`. Multiple components using the same key trigger only one fetch (deduplication).

**Background refetching:** When a user returns to the tab, data is silently refetched in the background and the UI updates without showing a loading spinner.

**Optimistic updates:** UI updates immediately before the API responds — for a seamless user experience.

**Suspense support:** `useSuspenseQuery` integrates with React Suspense so you never need to manually check `isLoading`.

**DevTools:** `@tanstack/react-query-devtools` lets you inspect cache, queries, and mutations directly in the browser.

**Separation of concerns:** Server state (API data) is kept separate from client state (UI state). No need for Redux to manage server data.

## Cons

**Learning curve:** You need to understand `staleTime`, `gcTime`, `queryKey` invalidation, and optimistic updates. Misconfiguration can cause over-fetching or stale data.

**Complex query keys:** Query key arrays must be organised carefully. Without a key factory pattern it becomes difficult to invalidate the right queries.

**Not global state:** Not suitable for client state (theme, sidebar, user preferences). Zustand should be used alongside for that.

---

## `QueryClient` configuration

```ts
// packages/tanstack-query/src/query-client.ts
const getQueryClient = (options?: QueryClientConfig) =>
  new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 60 * 1000,   // 1 hour — data does not auto-refetch
        refetchOnWindowFocus: false,  // No refetch on tab focus
        retry: false,                 // No retry on error
      },
      mutations: {
        retry: false,
      },
    },
    ...options,
  });
```

---

## Usage patterns

### 1. Basic fetch with Suspense (standard pattern)

```tsx
import { useSuspenseQuery } from "@ldc/tanstack-query";

// No isLoading check needed inside the component
export function UserProfile({ userId }: { userId: string }) {
  const { data: user } = useSuspenseQuery({
    queryKey: ["user", userId],
    queryFn: () => userApi.getUser(userId),
    staleTime: 5 * 60 * 1000,  // 5 minutes
  });

  return <div>{user.name}</div>;
}

// Wrap with Suspense in the parent
<Suspense fallback={<Skeleton />}>
  <UserProfile userId="123" />
</Suspense>
```

### 2. Parallel queries

```tsx
import { useSuspenseQueries } from "@tanstack/react-query";

const [statsQuery, usersQuery, activityQuery] = useSuspenseQueries({
  queries: [
    { queryKey: ["stats"], queryFn: () => statsApi.getStats() },
    { queryKey: ["users", "active"], queryFn: () => userApi.getActiveUsers() },
    { queryKey: ["activity", "recent"], queryFn: () => activityApi.getRecent() },
  ],
});
```

### 3. Mutation with cache invalidation

```ts
import { useMutation, useQueryClient } from "@ldc/tanstack-query";

export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<User> }) =>
      userApi.updateUser(id, data),

    onSuccess: (_, variables) => {
      // Invalidate cache → triggers automatic refetch
      queryClient.invalidateQueries({ queryKey: ["user", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
}

// Usage:
const updateUser = useUpdateUser();
updateUser.mutate({ id: "123", data: { name: "New Name" } });
```

### 4. Optimistic update

```ts
return useMutation({
  mutationFn: (userId: string) => userApi.toggleStatus(userId),

  onMutate: async (userId) => {
    await queryClient.cancelQueries({ queryKey: ["users"] });
    const previous = queryClient.getQueryData<User[]>(["users"]);

    // Update immediately — no waiting for the API
    queryClient.setQueryData<User[]>(["users"], (old) =>
      old?.map(u => u.id === userId ? { ...u, active: !u.active } : u) ?? []
    );

    return { previous };  // Context for rollback
  },

  onError: (_, __, context) => {
    // Roll back if the API call fails
    queryClient.setQueryData(["users"], context?.previous);
  },

  onSettled: () => {
    queryClient.invalidateQueries({ queryKey: ["users"] });
  },
});
```

### 5. Cache-first strategy (LDC pattern)

```ts
// Reuse list cache data before fetching detail
export function useWorkflowDetail(id: string) {
  const queryClient = useQueryClient();

  return useSuspenseQuery({
    queryKey: ["workflow", id],
    queryFn: async () => {
      // Check list cache first
      const listCache = queryClient.getQueryData<Workflow[]>(["workflows"]);
      const cached = listCache?.find(w => w.id === id);
      if (cached) return cached;

      return workflowApi.getById(id);  // Fallback to API
    },
    staleTime: 5 * 60 * 1000,
  });
}
```

---

## Exports from `@ldc/tanstack-query`

```ts
// packages/tanstack-query/src/hooks/index.ts
export {
  useQuery, useMutation, useSuspenseQuery,
  useInfiniteQuery, useQueryClient, useQueries,
} from "@tanstack/react-query";
```

---

## Comparison with alternatives

| Criterion | **TanStack Query v5** | SWR | RTK Query | Apollo Client |
|---|---|---|---|---|
| Caching | ✅ Sophisticated | ✅ | ✅ | ✅ |
| Mutations | ✅ Full-featured | ⚠️ Basic | ✅ | ✅ |
| Optimistic updates | ✅ | ⚠️ | ✅ | ✅ |
| Suspense | ✅ First-class | ⚠️ | ✅ | ✅ |
| DevTools | ✅ Good | ⚠️ | ✅ | ✅ Best |
| Framework agnostic | ✅ | ⚠️ React-only | ❌ Redux deps | ❌ GraphQL |
| Bundle size | ✅ ~13kb | ✅ ~4kb | 🔶 Redux | ❌ Large |
| **Best for** | REST + full features | Simple REST | Redux apps | GraphQL |

> **Conclusion:** TanStack Query v5 is the best choice for LDC because it is full-featured, Suspense-first, and does not lock you into any state management framework. SWR is lighter but lacks first-class mutations. RTK Query only makes sense if you are already using Redux.
