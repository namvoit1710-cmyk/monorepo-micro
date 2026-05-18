import { pluginModuleFederation } from "@module-federation/rsbuild-plugin";
import { defineConfig, loadEnv } from "@rsbuild/core";
import { pluginReact } from "@rsbuild/plugin-react";
import path from "node:path";

const { publicVars } = loadEnv({ cwd: path.resolve(__dirname, "../..") });

export default defineConfig({
  plugins: [
    pluginReact(),
    pluginModuleFederation({
      name: "workflow_management",
      exposes: {
        "./App": "./src/app.tsx",
      },
      remotes: {},
      shared: {
        react: { singleton: true, eager: true, requiredVersion: "^19" },
        "react-dom": { singleton: true, eager: true, requiredVersion: "^19" },
        "react-router-dom": { singleton: true, eager: true },
        "react-i18next": {
          singleton: true,
          eager: true,
          requiredVersion: false,
        },
        "i18next": {
          singleton: true,
          eager: true,
          requiredVersion: false,
        },
      },
      // dts: {
      //   generateTypes: {
      //     abortOnError: false,
      //   },
      //   consumeTypes: {
      //     abortOnError: false,
      //   },
      // },
      dts: false,
    }),
  ],
  tools: {
    postcss: {
      postcssOptions: {
        plugins: [
          require("@tailwindcss/postcss")
        ],
      },
    },
  },

  resolve: {
    alias: { "@": "./src" },
  },
  source: {
    define: publicVars,
    entry: { index: "./src/main.tsx" },
  },
  server: { port: 3004 },

  dev: {
    client: {
      overlay: false,
    },
    lazyCompilation: {
      entries: true,
      imports: false,
    },
  },
});
