import { initializeI18n } from "@ldc/i18n";
import { addReteEditorResources } from "@ldc/workflow-editor";
import React from "react";
import ReactDOM from "react-dom/client";

import "./main.css";

import QueryProvider from "@/components/containers/query-client-provider";
import { NuqsAdapter } from "nuqs/adapters/react";
import { MessageBoxProvider } from "./components/containers/messagebox-provider";

import enWorkflow from "./locales/en/workflow-management.json";
import jpWorkflow from "./locales/jp/workflow-management.json";
import App from "./app";

const setupI18n = async () => {
    const i18nInstance = await initializeI18n({
        en: { "workflow-management": enWorkflow },
        jp: { "workflow-management": jpWorkflow },
    });
    addReteEditorResources(i18nInstance);
};

const renderApp = () => {
    ReactDOM.createRoot(document.getElementById("root")!).render(
        <React.StrictMode>
            <QueryProvider>
                <NuqsAdapter>
                    <MessageBoxProvider>
                        <App />
                    </MessageBoxProvider>
                </NuqsAdapter>
            </QueryProvider>
        </React.StrictMode>
    );
};

setupI18n().catch((error) => {
    console.error("[i18n] Failed to initialize, falling back to default language", error);
});

renderApp();
