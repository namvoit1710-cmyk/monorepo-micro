import { ThemeProvider } from "@ldc/ui";
import React from "react";
import { createRoot } from "react-dom/client";

import App from "./app";

import "./index.css";

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error(
    "Failed to find the root element. Did you forget to add it to your index.html?",
  );
}

createRoot(rootElement).render(
  <React.StrictMode>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </React.StrictMode>,
);
