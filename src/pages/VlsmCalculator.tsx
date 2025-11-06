import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { invoke } from "@tauri-apps/api/core";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { uuidv7 } from "uuidv7";

type VlsmSubnet = {
    network: string;
    cidr: number;
    subnet_mask: string;
    first_host: string;
    last_host: string;
    broadcast: string;
    required_hosts: number;
    usable_hosts: number;
};

type HostRequirement = {
    id: string;
    hosts: number;
};

const VlsmCalculator = () => {
    const [baseNetwork, setBaseNetwork] = useState("");
    const [baseCidr, setBaseCidr] = useState("");
    const [hostRequirements, setHostRequirements] = useState<HostRequirement[]>([]);
    const [newRequirement, setNewRequirement] = useState("");
    const [result, setResult] = useState<VlsmSubnet[]>([]);

    const addRequirement = () => {
        if (newRequirement && Number(newRequirement) > 0) {
            setHostRequirements([...hostRequirements, { id: uuidv7(), hosts: Number(newRequirement) }]);
            setNewRequirement("");
        }
    };

    const removeRequirement = (id: string) => {
        setHostRequirements(hostRequirements.filter((req) => req.id !== id));
    };

    const calculateVlsm = async () => {
        if (!baseNetwork || !baseCidr || hostRequirements.length === 0) {
            alert("Please enter base network, CIDR, and at least one host requirement.");
            return;
        }

        try {
            const response = await invoke<{ subnets: VlsmSubnet[]; error: string | null }>("calculate_vlsm", {
                input: {
                    base_network: baseNetwork,
                    base_cidr: Number(baseCidr),
                    host_requirements: hostRequirements.map((req) => req.hosts),
                },
            });

            if (response.error) {
                alert(response.error);
                return;
            }

            setResult(response.subnets);
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
                <h2 className="text-2xl font-bold">VLSM Calculator</h2>
                <p className="text-sm text-muted-foreground">
                    Variable Length Subnet Mask calculator - efficiently allocates subnets from largest to smallest host
                    requirements
                </p>

                <div className="flex flex-row gap-12">
                    <div className="flex flex-col gap-4 w-1/3">
                        <div>
                            <Label htmlFor="baseNetwork">Base Network Address</Label>
                            <Input
                                id="baseNetwork"
                                type="text"
                                value={baseNetwork}
                                onChange={(e) => setBaseNetwork(e.target.value)}
                                placeholder="192.168.1.0"
                            />
                        </div>
                        <div>
                            <Label htmlFor="baseCidr">Base Network CIDR</Label>
                            <Input
                                id="baseCidr"
                                type="number"
                                value={baseCidr}
                                onChange={(e) => setBaseCidr(e.target.value)}
                                placeholder="24"
                                min="0"
                                max="32"
                            />
                        </div>

                        <div className="border-t pt-4">
                            <Label>Host Requirements</Label>
                            <div className="flex gap-2 mt-2">
                                <Input
                                    type="number"
                                    value={newRequirement}
                                    onChange={(e) => setNewRequirement(e.target.value)}
                                    placeholder="Number of hosts"
                                    min="1"
                                />
                                <Button variant="outline" size="sm" onClick={addRequirement}>
                                    <Plus className="w-4 h-4" />
                                </Button>
                            </div>
                            <div className="mt-4 space-y-2">
                                {hostRequirements.map((req) => (
                                    <div key={req.id} className="flex items-center justify-between border p-2 rounded">
                                        <span>{req.hosts} hosts</span>
                                        <Button variant="ghost" size="sm" onClick={() => removeRequirement(req.id)}>
                                            <Trash2 className="w-4 h-4 text-destructive" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <Button variant="default" type="button" onClick={calculateVlsm}>
                            Calculate VLSM
                        </Button>
                    </div>

                    <div className="flex-1">
                        <h3 className="text-lg font-semibold mb-4">Subnet Allocations:</h3>
                        {result.length > 0 ? (
                            <div className="space-y-4">
                                {result.map((subnet, index) => (
                                    <div
                                        key={`subnet-${subnet.network}-${subnet.cidr}`}
                                        className="border p-4 space-y-2"
                                    >
                                        <div className="font-semibold text-primary">
                                            Subnet {index + 1}: {subnet.network}/{subnet.cidr}
                                        </div>
                                        <div className="grid grid-cols-2 gap-2 text-sm">
                                            <span className="font-medium">Required Hosts:</span>
                                            <span>{subnet.required_hosts}</span>

                                            <span className="font-medium">Usable Hosts:</span>
                                            <span>{subnet.usable_hosts}</span>

                                            <span className="font-medium">Network:</span>
                                            <span>{subnet.network}</span>

                                            <span className="font-medium">Subnet Mask:</span>
                                            <span>{subnet.subnet_mask}</span>

                                            <span className="font-medium">First Host:</span>
                                            <span>{subnet.first_host}</span>

                                            <span className="font-medium">Last Host:</span>
                                            <span>{subnet.last_host}</span>

                                            <span className="font-medium">Broadcast:</span>
                                            <span>{subnet.broadcast}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="border p-4 text-center text-muted-foreground">
                                Enter base network and host requirements to see VLSM allocation
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </main>
    );
};

export default VlsmCalculator;
