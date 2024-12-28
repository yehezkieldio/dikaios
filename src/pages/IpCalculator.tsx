import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { invoke } from "@tauri-apps/api/core";
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
    ip_class: string;
    is_private: boolean;
};

const IpCalculator = () => {
    const [ipAddress, setIpAddress] = useState("");
    const [networkBits, setNetworkBits] = useState("");
    const [result, setResult] = useState<NetworkInfo>();

    const calculateNetworkInfo = async () => {
        if (!ipAddress || !networkBits) {
            alert("Please enter both IP address and network bits.");
            return;
        }

        try {
            const response = await invoke<{ info: NetworkInfo | null; error: string | null }>(
                "calculate_network_info",
                {
                    input: {
                        ip_address: ipAddress,
                        network_bits: networkBits,
                    },
                },
            );

            if (response.error) {
                alert(response.error);
                return;
            }

            if (response.info) {
                setResult(response.info);
            }
        } catch (error) {
            if (error instanceof Error) {
                alert(error.message);
            }
        }
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
                                    <span>{result.ip_class}</span>

                                    <span className="font-medium">Type:</span>
                                    <span>{result.is_private ? "Private" : "Public"}</span>
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
