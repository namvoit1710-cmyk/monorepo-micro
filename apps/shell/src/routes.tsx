import { lazy, Suspense } from "react";
import type { RouteObject } from "react-router-dom";

import RootLayout from "./layouts/root-layout";

const Dashboard = lazy(() =>
    import("dashboard/remote-dashboard").catch((error: unknown) => {
        return {
            default: () => {
                throw error instanceof Error ? error : new Error("Remote dashboard is unavailable");
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
                element: <div>Welcome to the dashboard!</div>,
            },
            {
                element: (
                    <Suspense fallback={<div>Loading...</div>}>
                        <Dashboard />
                    </Suspense>
                ),
                handle: {
                    crumb: "Dashboard",
                },
            }
        ],
    },
];
