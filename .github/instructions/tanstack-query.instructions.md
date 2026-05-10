---
name: TanStack Query & API Integration
description: Conventions for TanStack Query setup, query keys, API functions, hooks, mutations, and network request headers for Supabase integration.
applyTo: "**/src/api/**/*.ts,**/src/providers/**/*.ts"
---

# TanStack Query & API Integration

This project uses `@tanstack/react-query` with a consistent folder structure, query-key factory pattern, and Supabase network request headers.

## Folder Structure (Required)

- `src/providers/AppProviders.tsx` — Create and export a singleton `queryClient` and wrap the app with `QueryClientProvider`.
- `src/api/queryKeys.ts` — Central export merging all domain query-key factories into a single `queryKeys` object.
- For each domain under `src/api/<domain>/` (example: `lists`, `categories`):
  - `<domain>.ts` — Plain async API functions (no React Query imports).
  - `<domain>.queryKeys.ts` — Query-key factory using `@lukemorales/query-key-factory`.
  - `<domain>.utils.ts` — Invalidation helpers and optional normalization helpers.
  - `hooks/` — Directory containing React Query hooks only (`useQuery`, `useMutation`).

## Query Keys (Required)

- Use `@lukemorales/query-key-factory` for type-safe, composable keys — enables IDE autocompletion and prevents typos in key names.
- Export per-domain keys as `<domain>Keys`: `export const listsKeys = createQueryKeys("lists", { ... })`
- Merge all domain keys into a single `queryKeys` object in `src/api/queryKeys.ts`: `export const queryKeys = mergeQueryKeys(listsKeys, categoriesKeys, ...)`
- Hook code should use the merged `queryKeys`: `queryKey: queryKeys.lists.list(normalizedParams).queryKey`
- Keys must be **serializable** (strings, numbers, booleans, nullables, plain objects only) — React Query caches based on key structure.
- Normalize params before passing to query-key factory — prevents duplicate cache entries for semantically identical queries (e.g. apply pagination defaults, canonicalize sort order).
- For optional IDs: use a stable placeholder in the key (e.g. `id ?? ""`) and gate the query with `enabled` — allows React Query to cache consistently even when dependencies are undefined.

## API Functions (in `src/api/<domain>/<domain>.ts`)

- Use verb-first naming: `getX`, `createX`, `patchX`, `deleteX`, `bulkCreateX`, `joinXByY` — immediately communicates intent and HTTP method.
- No React Query imports in API functions — keep them framework-agnostic.
- Always parse JSON responses and throw `Error` with server message (if available) or clear fallback — ensures downstream hooks receive consistent error shape.

## React Query Hooks (in `src/api/<domain>/hooks/`)

### Naming

- Query hooks: `use<Thing>Query` (e.g. `useListsQuery`, `useListItemsQuery`)
- Mutation hooks: `use<Verb><Thing>Mutation` (e.g. `useCreateListMutation`, `useDeleteListItemMutation`)
- Hook files must match the export name: `useListItemsQuery.ts` exports `useListItemsQuery`

### Query Hook Patterns

Keep `useQuery` hooks thin with only essential options:

- `queryKey` from `queryKeys.<domain>.<key>(args).queryKey`
- `queryFn` calling a single API function
- `enabled` guard when arguments are optional: `enabled: typeof id === "string" && id.length > 0`
- `staleTime` only when there is a reason (e.g. catalog data that changes rarely)

### Mutation Hook Patterns

- Put invalidation helpers in `src/api/<domain>/<domain>.utils.ts` — centralize cache invalidation logic.
- Invalidation helper must call `queryClient.invalidateQueries({ queryKey: ... })` — ensures UI reflects server state.
- Prefer invalidating with `listsKeys.<key>._def` for "all variants of this key" or `queryKeys.<domain>.<key>(args).queryKey` for a specific resource.

### Optimistic Updates (Use Sparingly)

Use optimistic updates **only for trivial interactions** (toggle, delete) where rollback UX is acceptable.

```ts
// Pattern:
useMutation({
	mutationFn: async (id: string) => deleteItem(id),
	onMutate: async (id: string) => {
		await queryClient.cancelQueries({
			queryKey: queryKeys.items.list().queryKey,
		});
		const previous = queryClient.getQueryData(queryKeys.items.list().queryKey);
		queryClient.setQueryData(queryKeys.items.list().queryKey, (old) =>
			old.filter((item) => item.id !== id),
		);
		return { previous };
	},
	onError: (_err, _id, context) => {
		if (context?.previous) {
			queryClient.setQueryData(
				queryKeys.items.list().queryKey,
				context.previous,
			);
		}
	},
	onSettled: () => {
		queryClient.invalidateQueries({ queryKey: queryKeys.items.list()._def });
	},
});
```

## Network Request Headers (Required for Supabase)

When calling Supabase Edge Functions or endpoints, include:

- `Authorization: Bearer <accessToken>` — user JWT from auth session
- `apikey: <public anon key>` — Supabase public anon key (enables row-level security evaluation)
- `Content-Type: application/json` — standard REST convention

### Environment Variables

- Base URL: `process.env.EXPO_PUBLIC_SUPABASE_URL` (or appropriate public env var for your app)
- Public API key: `process.env.EXPO_PUBLIC_SUPABASE_KEY`

### Error Handling

- Always attempt to parse JSON error responses — servers often return structured error details.
- Throw `Error` with server-provided message if available; otherwise provide clear fallback message — ensures error bubbles up to UI with meaningful context.
