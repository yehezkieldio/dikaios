import { buttonVariants } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import {} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import type { ColumnDef } from "@tanstack/react-table";
import { ArrowLeft } from "lucide-react";

type SubnetMaskReference = {
    cidr: string;
    totalHosts: number;
    usableHosts: number;
    subnetMask: string;
};

export const subnetMaskReference: SubnetMaskReference[] = [
    {
        cidr: "/31",
        totalHosts: 2,
        usableHosts: 2,
        subnetMask: "255.255.255.254",
    },
    {
        cidr: "/30",
        totalHosts: 4,
        usableHosts: 2,
        subnetMask: "255.255.255.252",
    },
    {
        cidr: "/29",
        totalHosts: 8,
        usableHosts: 6,
        subnetMask: "255.255.255.248",
    },
    {
        cidr: "/28",
        totalHosts: 16,
        usableHosts: 14,
        subnetMask: "255.255.255.240",
    },
    {
        cidr: "/27",
        totalHosts: 32,
        usableHosts: 30,
        subnetMask: "255.255.255.224",
    },
    {
        cidr: "/26",
        totalHosts: 64,
        usableHosts: 62,
        subnetMask: "255.255.255.192",
    },
    {
        cidr: "/25",
        totalHosts: 128,
        usableHosts: 126,
        subnetMask: "255.255.255.128",
    },
    {
        cidr: "/24",
        totalHosts: 256,
        usableHosts: 254,
        subnetMask: "255.255.255.0",
    },
    {
        cidr: "/23",
        totalHosts: 512,
        usableHosts: 510,
        subnetMask: "255.255.254.0",
    },
    {
        cidr: "/22",
        totalHosts: 1024,
        usableHosts: 1022,
        subnetMask: "255.255.252.0",
    },
    {
        cidr: "/21",
        totalHosts: 2048,
        usableHosts: 2046,
        subnetMask: "255.255.248.0",
    },
    {
        cidr: "/20",
        totalHosts: 4096,
        usableHosts: 4094,
        subnetMask: "255.255.240.0",
    },
    {
        cidr: "/19",
        totalHosts: 8192,
        usableHosts: 8190,
        subnetMask: "255.255.224.0",
    },
    {
        cidr: "/18",
        totalHosts: 16384,
        usableHosts: 16382,
        subnetMask: "255.255.192.0",
    },
    {
        cidr: "/17",
        totalHosts: 32768,
        usableHosts: 32766,
        subnetMask: "255.255.128.0",
    },
    {
        cidr: "/16",
        totalHosts: 65536,
        usableHosts: 65534,
        subnetMask: "255.255.0.0",
    },
];

export const columns: ColumnDef<SubnetMaskReference>[] = [
    {
        header: "Mask",
        accessorKey: "cidr",
    },
    {
        header: "IP Address",
        accessorKey: "totalHosts",
    },
    {
        header: "Hosts",
        accessorKey: "usableHosts",
    },
    {
        header: "Netmask",
        accessorKey: "subnetMask",
    },
];

const SubnetMaskReferencePage = () => {
    return (
        <main>
            <div className="p-4 flex flex-col gap-4">
                <a
                    className={cn(
                        buttonVariants({
                            variant: "outline",
                            size: "sm",
                        }),
                        "px-4 max-w-24",
                    )}
                    href="/"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back
                </a>
                <div>
                    <DataTable columns={columns} data={subnetMaskReference} />
                </div>
            </div>
        </main>
    );
};

export default SubnetMaskReferencePage;
