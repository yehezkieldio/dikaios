import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { ArrowLeft } from "lucide-react";
import { useState } from "react";

type NetworkInfo = {
    address: string;
    netmask: string;
    wildcard: string;
    network: string;
    broadcast: string;
    hostmin: string;
    hostmax: string;
    hosts: number;
    ipClass: string;
    isPrivate: boolean;
};

const IpCalculator = () => {
    const [ipAddress, setIpAddress] = useState("");
    const [networkBits, setNetworkBits] = useState("");
    const [result, setResult] = useState<NetworkInfo>();

    const calculateNetworkInfo = () => {
        if (!ipAddress || !networkBits) {
            alert("Please enter both IP address and network bits.");
            return;
        }

        try {
            const info = parseAndCalculate(ipAddress, networkBits);
            setResult(info);
        } catch (error) {
            if (error instanceof Error) {
                alert(error.message);
            }
        }
    };

    const parseAndCalculate = (ip: string, bits: string) => {
        // Validate inputs
        const maskBits = Number.parseInt(bits, 10);
        if (Number.isNaN(maskBits) || maskBits < 0 || maskBits > 32) {
            throw new Error("Invalid network bits (must be between 0 and 32)");
        }

        const ipParts = ip.split(".");
        if (ipParts.length !== 4) {
            throw new Error("Invalid IP address format");
        }

        const ipNums = ipParts.map((part) => {
            const num = Number.parseInt(part, 10);
            if (Number.isNaN(num) || num < 0 || num > 255) {
                throw new Error("Invalid IP address numbers");
            }
            return num;
        });

        // Calculate network details
        const ipInt = (ipNums[0] << 24) | (ipNums[1] << 16) | (ipNums[2] << 8) | ipNums[3];
        const maskInt = (-1 << (32 - maskBits)) >>> 0;
        const wildcardInt = ~maskInt >>> 0;
        const networkInt = (ipInt & maskInt) >>> 0;
        const broadcastInt = (networkInt | wildcardInt) >>> 0;
        const hostminInt = networkInt + 1;
        const hostmaxInt = broadcastInt - 1;
        const numHosts = 2 ** (32 - maskBits) - 2;

        // Determine IP class and private status
        const ipClass = getIpClass(ipNums[0]);
        const isPrivate = checkIfPrivate(ipNums);

        return {
            address: ipToString(ipInt),
            netmask: ipToString(maskInt),
            wildcard: ipToString(wildcardInt),
            network: ipToString(networkInt),
            broadcast: ipToString(broadcastInt),
            hostmin: ipToString(hostminInt),
            hostmax: ipToString(hostmaxInt),
            hosts: numHosts,
            ipClass,
            isPrivate,
        };
    };

    const ipToString = (ipInt: number): string => {
        return [(ipInt >>> 24) & 255, (ipInt >>> 16) & 255, (ipInt >>> 8) & 255, ipInt & 255].join(".");
    };

    const getIpClass = (firstOctet: number): string => {
        if (firstOctet < 128) return "A";
        if (firstOctet < 192) return "B";
        if (firstOctet < 224) return "C";
        if (firstOctet < 240) return "D";
        return "E";
    };

    const checkIfPrivate = (ipNums: number[]): boolean => {
        return (
            ipNums[0] === 10 ||
            (ipNums[0] === 172 && ipNums[1] >= 16 && ipNums[1] <= 31) ||
            (ipNums[0] === 192 && ipNums[1] === 168)
        );
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
                                value={ipAddress}
                                onChange={(e) => setIpAddress(e.target.value)}
                                placeholder="192.168.4.56"
                            />
                        </div>
                        <div>
                            <Label>Subnet Mask</Label>
                            <Input
                                type="text"
                                value={networkBits}
                                onChange={(e) => setNetworkBits(e.target.value)}
                                placeholder="28"
                            />
                        </div>
                        <Button variant="default" type="button" onClick={calculateNetworkInfo}>
                            Calculate
                        </Button>
                    </div>
                    <div className="w-1/2">
                        <h3>Valid IP Addresses:</h3>
                        {result ? (
                            <div className="border p-4 space-y-2">
                                <div className="grid grid-cols-2 gap-2">
                                    <span className="font-medium">Address:</span>
                                    <span>{result.address}</span>

                                    <span className="font-medium">Netmask:</span>
                                    <span>{result.netmask}</span>

                                    <span className="font-medium">Wildcard:</span>
                                    <span>{result.wildcard}</span>

                                    <span className="font-medium">Network:</span>
                                    <span>{result.network}</span>

                                    <span className="font-medium">Broadcast:</span>
                                    <span>{result.broadcast}</span>

                                    <span className="font-medium">HostMin:</span>
                                    <span>{result.hostmin}</span>

                                    <span className="font-medium">HostMax:</span>
                                    <span>{result.hostmax}</span>

                                    <span className="font-medium">Hosts/Net:</span>
                                    <span>{result.hosts.toLocaleString()}</span>

                                    <span className="font-medium">IP Class:</span>
                                    <span>{result.ipClass}</span>

                                    <span className="font-medium">Type:</span>
                                    <span>{result.isPrivate ? "Private" : "Public"}</span>
                                </div>
                            </div>
                        ) : (
                            <div className="border p-4 text-center text-muted-foreground">
                                Enter IP address and network bits to see results
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </main>
    );
};

export default IpCalculator;
