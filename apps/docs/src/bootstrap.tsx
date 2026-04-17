import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import "./index.css";
import DocsLayout from "./layouts/root-layout";

const root = document.getElementById("root");
if (!root) throw new Error("Root element not found");

createRoot(root).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="*" element={<DocsLayout />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>
);