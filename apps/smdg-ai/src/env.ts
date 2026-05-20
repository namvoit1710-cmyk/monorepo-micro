import { z } from "zod";

import { createClientEnv } from "@ldc/env";

const env = createClientEnv(
    {
        PUBLIC_WORKFLOW_API_URL: z.string().url(),
    },
    {
        PUBLIC_WORKFLOW_API_URL: import.meta.env.PUBLIC_URL_AI_WORKFLOW_CONTROL_PLANE,
    },
);

export { env };

