import { BrowserRouter, Route, Routes } from "react-router-dom";

import RootLayout from "./layouts/root-layout";
import Home from "./pages/home";
import ChatPage from "./pages/chat";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<RootLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/chat" element={<ChatPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
