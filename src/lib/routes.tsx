import RootLayout from "@/components/root-layout";
import SuspenseLayout from "@/components/suspense-layout";
import { Suspense, lazy } from "react";
import { type RouteObject, createBrowserRouter } from "react-router-dom";

const Home = lazy(() => import("@/pages/Home"));
const SubntMaskReference = lazy(() => import("@/pages/SubnetMaskReference"));
const IpCalculator = lazy(() => import("@/pages/IpCalculator"));
const IpRangeCalculator = lazy(() => import("@/pages/IpRangeCalculator"));
const VlsmCalculator = lazy(() => import("@/pages/VlsmCalculator"));
const VlanAllocationCalculator = lazy(() => import("@/pages/VlanAllocationCalculator"));
const WirelessNetworkSetup = lazy(() => import("@/pages/WirelessNetworkSetup"));

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
            {
                path: "/vlsm-calculator",
                element: (
                    <Suspense fallback={<SuspenseLayout />}>
                        <VlsmCalculator />
                    </Suspense>
                ),
            },
            {
                path: "/vlan-allocation-calculator",
                element: (
                    <Suspense fallback={<SuspenseLayout />}>
                        <VlanAllocationCalculator />
                    </Suspense>
                ),
            },
            {
                path: "/wireless-network-setup",
                element: (
                    <Suspense fallback={<SuspenseLayout />}>
                        <WirelessNetworkSetup />
                    </Suspense>
                ),
            },
        ],
    },
];

export const router = createBrowserRouter(routes);
