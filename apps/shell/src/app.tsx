import { lazy, Suspense } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";

import RootLayout from "./layouts/root-layout";
import Home from "./pages/home";

const Dashboard = lazy(() =>
  import("dashboard/remote-dashboard").catch((error: unknown) => ({
    default: () => {
      throw error instanceof Error ? error : new Error("Remote dashboard is unavailable");
    },
  }))
);


export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<RootLayout />}>
          <Route path="/" element={<Home />} />
          <Route
            path="/dashboard"
            element={
              <Suspense fallback={<div>Loading...</div>}>
                  <Dashboard />
                </Suspense>
            }
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
