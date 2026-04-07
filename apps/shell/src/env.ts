/// <reference types="vite/client" />

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
