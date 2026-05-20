import { BrowserRouter, Route, Routes } from "react-router-dom";

import { ChatLayout } from "./layouts/chat-layout";
import { ChatPage } from "./pages/chat-page";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<ChatLayout />}>
          <Route path="/" element={<ChatPage />} />
          <Route path="/chat/:conversationId" element={<ChatPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
