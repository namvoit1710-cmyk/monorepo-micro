import { lazy, Suspense } from "react";
import type { RouteObject } from "react-router-dom";

import RootLayout from "./layouts/root-layout";
import HomePage from "./pages/home";

const Dashboard = lazy(() =>
    import("dashboard/remote-dashboard").catch((error: unknown) => {
        return {
            default: () => {
                throw error instanceof Error ? error : new Error("Remote dashboard is unavailable");
            },
        };
    })
);

const Documentation = lazy(() =>
    import("docs/remote-docs").catch((error: unknown) => {
        return {
            default: () => {
                throw error instanceof Error ? error : new Error("Remote documentation is unavailable");
            },
        };
    })
);


export const routes: RouteObject[] = [
    {
        path: "/",
        element: <RootLayout />,
        handle: {
            crumb: "Home",
        },
        children: [
            {
                index: true,
                element: <HomePage />,
            },
            {
                path: "dashboard",
                element: (
                    <Suspense fallback={<div>Loading...</div>}>
                        <Dashboard />
                    </Suspense>
                ),
                handle: {
                    crumb: "Dashboard",
                },
            },
            {
                path: "docs/:slug",
                element: (
                    <Suspense fallback={<div>Loading...</div>}>
                        <div className="overflow-hidden [&_#doc-scroll_main]:p-0! [&_#doc-scroll_main]:max-w-full">
                            <Documentation />
                        </div>
                    </Suspense>
                ),
                handle: {
                    crumb: "Documentation",
                },
            },
        ],
    },
];
