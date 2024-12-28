import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn, randomId } from "@/lib/utils";
import { ArrowLeft } from "lucide-react";
import { useState } from "react";

const IpRangeCalculator = () => {
    const [endOfIP, setEndOfIP] = useState("");
    const [subnetMask, setSubnetMask] = useState("");
    const [result, setResult] = useState<string[]>([]);

    const calculateValidIPs = () => {
        if (!endOfIP || !subnetMask) {
            alert("Please enter both end of IP and subnet mask.");
            return;
        }

        try {
            const [startIP, maskBits] = parseInput(endOfIP, subnetMask);
            const ipList = getValidIPs(startIP, maskBits);
            setResult(ipList);
        } catch (_error) {
            console.log(_error);
            alert("Invalid input. Please provide correct values.");
        }
    };

    const parseInput = (endOfIP: string, subnetMask: string) => {
        const maskBits = Number.parseInt(subnetMask, 10);

        if (Number.isNaN(maskBits) || maskBits < 0 || maskBits > 32) {
            throw new Error("Invalid subnet mask.");
        }

        const ipParts = endOfIP.split(".");
        if (ipParts.length !== 4 || ipParts.some((part) => Number.isNaN(Number.parseInt(part)) && part !== "")) {
            throw new Error("Invalid IP address format.");
        }

        const baseIP = ipParts.map((part) => (part === "" ? "0" : part)).join(".");
        return [baseIP, maskBits] as const;
    };

    const getValidIPs = (startIP: string, maskBits: number): string[] => {
        const ipParts = startIP.split(".").map(Number);
        const ipAsInt = (ipParts[0] << 24) | (ipParts[1] << 16) | (ipParts[2] << 8) | ipParts[3];

        const hostBits = 32 - maskBits;
        const subnetSize = 1 << hostBits;

        const networkAddress = ipAsInt & ~(subnetSize - 1);
        const broadcastAddress = networkAddress | (subnetSize - 1);

        const validIPs = [];
        for (let ip = networkAddress + 1; ip < broadcastAddress; ip++) {
            validIPs.push([(ip >> 24) & 255, (ip >> 16) & 255, (ip >> 8) & 255, ip & 255].join("."));
        }

        return validIPs;
    };

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
                <div className="flex flex-row gap-12">
                    <div className="flex flex-col gap-4 w-1/3">
                        <div>
                            <Label htmlFor="ip">IP Address</Label>
                            <Input
                                id="ip"
                                type="text"
                                value={endOfIP}
                                onChange={(e) => setEndOfIP(e.target.value)}
                                placeholder="192.168.4.56"
                            />
                        </div>
                        <div>
                            <Label>Subnet Mask</Label>
                            <Input
                                type="text"
                                value={subnetMask}
                                onChange={(e) => setSubnetMask(e.target.value)}
                                placeholder="28"
                            />
                        </div>
                        <Button variant="default" type="button" onClick={calculateValidIPs}>
                            Calculate
                        </Button>
                    </div>
                    <div className="w-1/2">
                        <h3>Valid IP Addresses:</h3>
                        {result.length > 0 ? (
                            <div className="flex flex-row gap-8 border max-h-[400px] overflow-y-auto p-4">
                                {(() => {
                                    const maxRows = 3;
                                    const totalItems = result.length;
                                    const rows = Math.min(maxRows, Math.ceil(totalItems / 10));
                                    const itemsPerRow = Math.ceil(totalItems / rows);

                                    return Array.from({ length: rows }, (_, index) => (
                                        <ul key={randomId()} style={{ flex: "1 1 auto", minWidth: "150px" }}>
                                            {result.slice(index * itemsPerRow, (index + 1) * itemsPerRow).map((ip) => (
                                                <li key={ip}>{ip}</li>
                                            ))}
                                        </ul>
                                    ));
                                })()}
                            </div>
                        ) : (
                            <div className="border p-4 text-gray-500 text-center">No results to display.</div>
                        )}
                    </div>
                </div>
            </div>
        </main>
    );
};

export default IpRangeCalculator;
