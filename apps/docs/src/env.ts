/// <reference types="vite/client" />

import { z } from "zod";

import { createClientEnv } from "@ldc/env";

export const env = createClientEnv(
    {
        PUBLIC_DOCS_URL: z.string().url(),
    },
    {
        PUBLIC_DOCS_URL: import.meta.env.PUBLIC_DOCS_URL,
    },
);
