import { pluginModuleFederation } from "@module-federation/rsbuild-plugin";
import { defineConfig, loadEnv } from "@rsbuild/core";
import { pluginReact } from "@rsbuild/plugin-react";
import path from "node:path";

const { publicVars } = loadEnv({ cwd: path.resolve(__dirname, "../..") });

export default defineConfig({
    source: {
        define: publicVars,
        entry: { index: "./src/main.tsx" },
    },
    plugins: [
        pluginReact(),
        pluginModuleFederation({
            name: "dashboard",
            exposes: { "./remote-dashboard": "./src/pages/home" },
            shared: {
                react: { singleton: true, eager: true, requiredVersion: "^18" },
                "react-dom": { singleton: true, eager: true, requiredVersion: "^18" },
                "react-router-dom": { singleton: true, eager: true },
                "i18next": { singleton: true, eager: true },
                "react-i18next": { singleton: true, eager: true },
            },
        }),
    ],
    tools: {
        postcss: {
            postcssOptions: {
                plugins: [require("@tailwindcss/postcss")],
            },
        },
    },
    resolve: {
        alias: { "@": "./src" },
    },

    server: { port: 3001 },
});
