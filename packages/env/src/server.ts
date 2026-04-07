import type { ZodRawShape } from "zod";
import { createEnv } from "@t3-oss/env-core";

export function createServerEnv<T extends ZodRawShape>(
  schema: T,
  runtimeEnv: Record<string, string | undefined> = process.env as Record<
    string,
    string | undefined
  >,
) {
  return createEnv({
    server: schema,
    runtimeEnv,
  });
}
