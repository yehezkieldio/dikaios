import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { invoke } from "@tauri-apps/api/core";
import { ArrowLeft, Copy, Plus, Trash2 } from "lucide-react";
import { useState } from "react";

type VlanConfig = {
    vlan_id: number;
    vlan_name: string;
    required_hosts: number;
};

type VlanAllocation = {
    vlan_id: number;
    vlan_name: string;
    network: string;
    cidr: number;
    subnet_mask: string;
    gateway: string;
    first_host: string;
    last_host: string;
    broadcast: string;
    usable_hosts: number;
};

const VlanAllocationCalculator = () => {
    const [baseNetwork, setBaseNetwork] = useState("");
    const [baseCidr, setBaseCidr] = useState("");
    const [vlanConfigs, setVlanConfigs] = useState<VlanConfig[]>([]);
    const [newVlanId, setNewVlanId] = useState("");
    const [newVlanName, setNewVlanName] = useState("");
    const [newRequiredHosts, setNewRequiredHosts] = useState("");
    const [result, setResult] = useState<VlanAllocation[]>([]);
    const [ciscoCommands, setCiscoCommands] = useState("");

    const addVlan = () => {
        if (newVlanId && newVlanName && newRequiredHosts) {
            const vlanId = Number(newVlanId);
            if (vlanId < 1 || vlanId > 4094) {
                alert("VLAN ID must be between 1 and 4094");
                return;
            }
            if (vlanConfigs.some((v) => v.vlan_id === vlanId)) {
                alert("VLAN ID already exists");
                return;
            }

            setVlanConfigs([
                ...vlanConfigs,
                {
                    vlan_id: vlanId,
                    vlan_name: newVlanName,
                    required_hosts: Number(newRequiredHosts),
                },
            ]);
            setNewVlanId("");
            setNewVlanName("");
            setNewRequiredHosts("");
        }
    };

    const removeVlan = (vlanId: number) => {
        setVlanConfigs(vlanConfigs.filter((vlan) => vlan.vlan_id !== vlanId));
    };

    const calculateVlan = async () => {
        if (!baseNetwork || !baseCidr || vlanConfigs.length === 0) {
            alert("Please enter base network, CIDR, and at least one VLAN configuration.");
            return;
        }

        try {
            const response = await invoke<{
                allocations: VlanAllocation[];
                cisco_commands: string | null;
                error: string | null;
            }>("calculate_vlan_allocation", {
                input: {
                    base_network: baseNetwork,
                    base_cidr: Number(baseCidr),
                    vlan_configs: vlanConfigs,
                },
            });

            if (response.error) {
                alert(response.error);
                return;
            }

            setResult(response.allocations);
            setCiscoCommands(response.cisco_commands || "");
        } catch (error) {
            if (error instanceof Error) {
                alert(error.message);
            }
        }
    };

    const copyCiscoCommands = () => {
        navigator.clipboard.writeText(ciscoCommands);
        alert("Cisco commands copied to clipboard!");
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
                <h2 className="text-2xl font-bold">VLAN Allocation Calculator</h2>
                <p className="text-sm text-muted-foreground">
                    Allocate VLANs with IP addresses, subnet masks, and gateways. Generate Cisco Packet Tracer commands.
                </p>

                <div className="flex flex-row gap-8">
                    <div className="flex flex-col gap-4 w-1/3">
                        <div>
                            <Label htmlFor="baseNetwork">Base Network Address</Label>
                            <Input
                                id="baseNetwork"
                                type="text"
                                value={baseNetwork}
                                onChange={(e) => setBaseNetwork(e.target.value)}
                                placeholder="192.168.0.0"
                            />
                        </div>
                        <div>
                            <Label htmlFor="baseCidr">Base Network CIDR</Label>
                            <Input
                                id="baseCidr"
                                type="number"
                                value={baseCidr}
                                onChange={(e) => setBaseCidr(e.target.value)}
                                placeholder="16"
                                min="0"
                                max="32"
                            />
                        </div>

                        <div className="border-t pt-4">
                            <Label>VLAN Configurations</Label>
                            <div className="flex flex-col gap-2 mt-2">
                                <Input
                                    type="number"
                                    value={newVlanId}
                                    onChange={(e) => setNewVlanId(e.target.value)}
                                    placeholder="VLAN ID (1-4094)"
                                    min="1"
                                    max="4094"
                                />
                                <Input
                                    type="text"
                                    value={newVlanName}
                                    onChange={(e) => setNewVlanName(e.target.value)}
                                    placeholder="VLAN Name"
                                />
                                <Input
                                    type="number"
                                    value={newRequiredHosts}
                                    onChange={(e) => setNewRequiredHosts(e.target.value)}
                                    placeholder="Required Hosts"
                                    min="1"
                                />
                                <Button variant="outline" size="sm" onClick={addVlan}>
                                    <Plus className="w-4 h-4 mr-2" />
                                    Add VLAN
                                </Button>
                            </div>
                            <div className="mt-4 space-y-2 max-h-64 overflow-y-auto">
                                {vlanConfigs.map((vlan) => (
                                    <div
                                        key={`vlan-${vlan.vlan_id}`}
                                        className="flex items-center justify-between border p-2 rounded"
                                    >
                                        <div className="text-sm">
                                            <div className="font-medium">
                                                VLAN {vlan.vlan_id}: {vlan.vlan_name}
                                            </div>
                                            <div className="text-muted-foreground">{vlan.required_hosts} hosts</div>
                                        </div>
                                        <Button variant="ghost" size="sm" onClick={() => removeVlan(vlan.vlan_id)}>
                                            <Trash2 className="w-4 h-4 text-destructive" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <Button variant="default" type="button" onClick={calculateVlan}>
                            Calculate VLAN Allocation
                        </Button>
                    </div>

                    <div className="flex-1 flex flex-col gap-4">
                        <div>
                            <h3 className="text-lg font-semibold mb-4">VLAN Allocations:</h3>
                            {result.length > 0 ? (
                                <div className="space-y-4 max-h-96 overflow-y-auto">
                                    {result.map((vlan) => (
                                        <div key={`vlan-result-${vlan.vlan_id}`} className="border p-4 space-y-2">
                                            <div className="font-semibold text-primary">
                                                VLAN {vlan.vlan_id}: {vlan.vlan_name}
                                            </div>
                                            <div className="grid grid-cols-2 gap-2 text-sm">
                                                <span className="font-medium">Network:</span>
                                                <span>
                                                    {vlan.network}/{vlan.cidr}
                                                </span>

                                                <span className="font-medium">Subnet Mask:</span>
                                                <span>{vlan.subnet_mask}</span>

                                                <span className="font-medium">Gateway:</span>
                                                <span className="text-green-600 font-medium">{vlan.gateway}</span>

                                                <span className="font-medium">First Host:</span>
                                                <span>{vlan.first_host}</span>

                                                <span className="font-medium">Last Host:</span>
                                                <span>{vlan.last_host}</span>

                                                <span className="font-medium">Broadcast:</span>
                                                <span>{vlan.broadcast}</span>

                                                <span className="font-medium">Usable Hosts:</span>
                                                <span>{vlan.usable_hosts}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="border p-4 text-center text-muted-foreground">
                                    Enter base network and VLAN configurations to see allocations
                                </div>
                            )}
                        </div>

                        {ciscoCommands && (
                            <div className="border-t pt-4">
                                <div className="flex items-center justify-between mb-2">
                                    <h3 className="text-lg font-semibold">Cisco Packet Tracer Commands:</h3>
                                    <Button variant="outline" size="sm" onClick={copyCiscoCommands}>
                                        <Copy className="w-4 h-4 mr-2" />
                                        Copy Commands
                                    </Button>
                                </div>
                                <pre className="border p-4 bg-muted rounded text-xs overflow-x-auto max-h-64 overflow-y-auto">
                                    {ciscoCommands}
                                </pre>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </main>
    );
};

export default VlanAllocationCalculator;
