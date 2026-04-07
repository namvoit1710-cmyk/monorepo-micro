import { defineConfig } from "eslint/config";

import { baseConfig } from "@ldc/eslint-config/base";

export default defineConfig(
  {
    ignores: [],
  },
  baseConfig,
  {
    rules: {
      "@typescript-eslint/no-unsafe-assignment": "off",
      "@typescript-eslint/no-unsafe-return": "off",
      "@typescript-eslint/no-unsafe-call": "off",
    },
  },
);
