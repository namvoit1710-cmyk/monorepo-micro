# T3 Env (`@t3-oss/env-core`)

**Version:** `@t3-oss/env-core@^0.13.11`
**Internal package:** `@ldc/env`

T3 Env is a library for validating environment variables at runtime using Zod schemas. In LDC, it's wrapped into the `@ldc/env` package for all apps to use consistently.

---

## Why T3 Env?

Common problem: App deploys to production missing an env var → crashes at runtime with hard-to-read errors. T3 Env solves this by validating all env vars when the app starts — if missing or wrong type, it throws a clear error immediately, not when code reaches the line using that var.

---

## Advantages

**Fail fast:** Validates immediately when importing `env.ts` — clear error: `"Missing PUBLIC_API_URL"` instead of `Cannot read properties of undefined`.

**Complete type safety:** `env.PUBLIC_API_URL` has type `string` (or any Zod type), not `string | undefined`.

**Client/server separation:** Prevents leaking server secrets into browser bundle. `PUBLIC_` prefix for client vars is enforced automatically.

**Zod integration:** Use any Zod transformer — `z.string().url()`, `z.coerce.number()`, `z.enum(["prod", "dev"])`.

## Disadvantages

**Small boilerplate:** Each app must create an `env.ts` file and list all vars. Adding new vars requires updating both schema and `runtimeEnv`.

**No auto-discovery:** Unlike `dotenv`, T3 Env doesn't auto-read `.env` — must pass `import.meta.env.*` or `process.env.*` to `runtimeEnv` manually.

---

## `@ldc/env` Structure

```ts
// packages/env/src/client.ts
import { createEnv } from "@t3-oss/env-core";

export function createClientEnv<
  T extends Record<`PUBLIC_${string}`, ZodRawShape[string]>,
>(schema: T, runtimeEnv: Record<string, string | undefined>) {
  return createEnv({
    clientPrefix: "PUBLIC_",
    client: schema,
    runtimeEnv,
  }) as Readonly<{ [K in keyof T]: z.infer<T[K]> }>;
}
```

```ts
// packages/env/src/server.ts
export function createServerEnv<T extends ZodRawShape>(
  schema: T,
  runtimeEnv = process.env as Record<string, string | undefined>,
) {
  return createEnv({ server: schema, runtimeEnv });
}
```

---

## Usage in Apps

### Client-side env (Dashboard)

```ts
// apps/dashboard/src/env.ts
import { z } from "zod";
import { createClientEnv } from "@ldc/env";

const env = createClientEnv(
  {
    PUBLIC_WORKFLOW_API_URL: z.string().url(),
  },
  {
    PUBLIC_WORKFLOW_API_URL: import.meta.env.PUBLIC_WORKFLOW_API_URL,
  },
);

export { env };
```

### Client-side env (Shell — prefix VITE_)

```ts
// apps/shell/src/env.ts
import { z } from "zod";
import { createClientEnv } from "@ldc/env";

export const env = createClientEnv(
  {
    VITE_API_URL: z.string().url(),
    VITE_APP_NAME: z.string(),
  } satisfies Record<`VITE_${string}`, z.ZodTypeAny>,
  {
    VITE_API_URL: import.meta.env.VITE_API_URL as string,
    VITE_APP_NAME: import.meta.env.VITE_APP_NAME as string,
  },
);
```

### Usage in Code

```ts
import { env } from "@/env";

const apiClient = axios.create({
  baseURL: env.PUBLIC_WORKFLOW_API_URL, // type: string ✅, not string | undefined
});
```

---

## Environment Variable Naming Rules

| Type | Prefix | Access |
|---|---|---|
| Client (browser) | `PUBLIC_` or `VITE_` | `import.meta.env.*` |
| Server only | No prefix | `process.env.*` |

> ⚠️ **Never** use `createClientEnv` for secrets (API keys, DB passwords). Use `createServerEnv` for server-side code.

---

## Comparison with Alternatives

| Method | Type safety | Fail fast | Client/Server | Boilerplate |
|---|---|---|---|---|
| **T3 Env** | ✅ Zod typed | ✅ | ✅ Separated | 🔶 Medium |
| `process.env.X` directly | ❌ `string \| undefined` | ❌ | ❌ Not separated | ✅ None |
| Pure `dotenv` | ❌ Not typed | ❌ | ❌ | ✅ Little |
| `envalid` | ✅ Typed | ✅ | ⚠️ Limited | 🔶 Medium |
| Manual Zod | ✅ | ✅ | ⚠️ Self-written | ❌ Much |

> **Conclusion:** T3 Env is a thin layer over Zod, best suited when the project already uses Zod. Especially important in MF environments since each remote app needs to validate its own env vars.
