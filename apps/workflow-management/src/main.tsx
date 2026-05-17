import React from "react";
import ReactDOM from "react-dom/client";
import App from "./app";

import "./main.css";

import LanguageProvider from "@/components/containers/language-provider";
import QueryProvider from "@/components/containers/query-client-provider";
import { NuqsAdapter } from "nuqs/adapters/react";
import { MessageBoxProvider } from "./components/containers/messagebox-provider";

ReactDOM.createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
        <LanguageProvider>
            <QueryProvider>
                <NuqsAdapter>
                    <MessageBoxProvider>
                        <App />
                    </MessageBoxProvider>
                </NuqsAdapter>
            </QueryProvider>
        </LanguageProvider>
    </React.StrictMode>
);
