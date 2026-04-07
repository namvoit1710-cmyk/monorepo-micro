import { BrowserRouter, Route, Routes } from "react-router-dom";

import RootLayout from "./layouts/root-layout";
import Home from "./pages/home";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<RootLayout />}>
          <Route path="/" element={<Home />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
