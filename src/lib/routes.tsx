import RootLayout from "@/components/root-layout";
import SuspenseLayout from "@/components/suspense-layout";
import { Suspense, lazy } from "react";
import { type RouteObject, createBrowserRouter } from "react-router-dom";

const Home = lazy(() => import("@/pages/Home"));
const SubntMaskReference = lazy(() => import("@/pages/SubnetMaskReference"));
const IpCalculator = lazy(() => import("@/pages/IpCalculator"));
const IpRangeCalculator = lazy(() => import("@/pages/IpRangeCalculator"));

const routes: RouteObject[] = [
    {
        path: "/",
        element: <RootLayout />,
        children: [
            {
                path: "/",
                element: (
                    <Suspense fallback={<SuspenseLayout />}>
                        <Home />
                    </Suspense>
                ),
            },
            {
                path: "/subnet-mask-reference-table",
                element: (
                    <Suspense fallback={<SuspenseLayout />}>
                        <SubntMaskReference />
                    </Suspense>
                ),
            },
            {
                path: "/ip-calculator",
                element: (
                    <Suspense fallback={<SuspenseLayout />}>
                        <IpCalculator />
                    </Suspense>
                ),
            },
            {
                path: "/ip-range-calculator",
                element: (
                    <Suspense fallback={<SuspenseLayout />}>
                        <IpRangeCalculator />
                    </Suspense>
                ),
            },
        ],
    },
];

export const router = createBrowserRouter(routes);
