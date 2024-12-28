import { buttonVariants } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { cn } from "@/lib/utils";
import type { ColumnDef } from "@tanstack/react-table";
import { invoke } from "@tauri-apps/api/core";
import { ArrowLeft } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

type SubnetMaskReference = {
    cidr: string;
    total_hosts: number;
    usable_hosts: number;
    subnet_mask: string;
};

export const getSubnetMaskReference = async (): Promise<SubnetMaskReference[]> => {
    return await invoke<SubnetMaskReference[]>("generate_subnet_references");
};

export const columns: ColumnDef<SubnetMaskReference>[] = [
    {
        header: "Mask",
        accessorKey: "cidr",
    },
    {
        header: "IP Address",
        accessorKey: "total_hosts",
    },
    {
        header: "Hosts",
        accessorKey: "usable_hosts",
    },
    {
        header: "Netmask",
        accessorKey: "subnet_mask",
    },
];

const SubnetMaskReferencePage = () => {
    const [data, setData] = useState<SubnetMaskReference[]>([]);

    const fetchData = useCallback(async () => {
        const references = await getSubnetMaskReference();
        setData(references);
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

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
                    <DataTable columns={columns} data={data} />
                </div>
            </div>
        </main>
    );
};

export default SubnetMaskReferencePage;
