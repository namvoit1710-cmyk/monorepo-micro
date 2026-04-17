import { BrowserRouter, Route, Routes } from "react-router-dom";

import RootLayout from "./layouts/root-layout";
import DocPage from "./pages/doc-page";
import Home from "./pages/home";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/docs" element={<RootLayout />} />
        <Route path="/docs/:slug" element={<DocPage />} />
      </Routes>
    </BrowserRouter>
  );
}
