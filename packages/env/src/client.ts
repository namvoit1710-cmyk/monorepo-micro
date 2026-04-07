import type { ZodRawShape, z } from "zod";
import { createEnv } from "@t3-oss/env-core";

export function createClientEnv<
  T extends Record<`PUBLIC_${string}`, ZodRawShape[string]>,
>(schema: T, runtimeEnv: Record<string, string | undefined>) {
  return createEnv({
    clientPrefix: "PUBLIC_",
    client: schema,
    runtimeEnv,
  }) as Readonly<{
    [K in keyof T]: z.infer<T[K]>;
  }>;
}
