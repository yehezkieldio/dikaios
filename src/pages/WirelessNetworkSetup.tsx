import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { invoke } from "@tauri-apps/api/core";
import { ArrowLeft, Copy, Radio } from "lucide-react";
import { useState } from "react";

type WirelessNetworkConfig = {
    network: string;
    cidr: number;
    subnet_mask: string;
    router_ip: string;
    ap_ip: string;
    dhcp_start: string;
    dhcp_end: string;
    broadcast: string;
    usable_hosts: number;
    ssid: string;
    router_commands: string;
    ap_commands: string;
    setup_steps: string[];
};

const WirelessNetworkSetup = () => {
    const [autoGenerate, setAutoGenerate] = useState(true);
    const [baseNetwork, setBaseNetwork] = useState("");
    const [baseCidr, setBaseCidr] = useState("");
    const [ssid, setSsid] = useState("");
    const [wpaPassword, setWpaPassword] = useState("");
    const [routerHostname, setRouterHostname] = useState("WirelessRouter");
    const [apHostname, setApHostname] = useState("AccessPoint");
    const [result, setResult] = useState<WirelessNetworkConfig | null>(null);

    const generateConfig = async () => {
        if (!ssid || !wpaPassword) {
            alert("Please enter SSID and WPA password.");
            return;
        }

        if (!autoGenerate && (!baseNetwork || !baseCidr)) {
            alert("Please enter base network and CIDR when not auto-generating.");
            return;
        }

        if (wpaPassword.length < 8) {
            alert("WPA password must be at least 8 characters long.");
            return;
        }

        try {
            const response = await invoke<{
                config: WirelessNetworkConfig | null;
                error: string | null;
            }>("configure_wireless_network", {
                input: {
                    base_network: autoGenerate ? null : baseNetwork,
                    base_cidr: autoGenerate ? null : Number(baseCidr),
                    auto_generate: autoGenerate,
                    ssid: ssid,
                    wpa_password: wpaPassword,
                    router_hostname: routerHostname,
                    ap_hostname: apHostname,
                },
            });

            if (response.error) {
                alert(response.error);
                return;
            }

            if (response.config) {
                setResult(response.config);
            }
        } catch (error) {
            if (error instanceof Error) {
                alert(error.message);
            }
        }
    };

    const copyToClipboard = (text: string, type: string) => {
        navigator.clipboard.writeText(text);
        alert(`${type} copied to clipboard!`);
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
                <div className="flex items-center gap-2">
                    <Radio className="w-6 h-6" />
                    <h2 className="text-2xl font-bold">Wireless Network Setup</h2>
                </div>
                <p className="text-sm text-muted-foreground">
                    Comprehensive WLAN setup tool for Cisco Packet Tracer with integrated subnetting, IP configuration,
                    and step-by-step instructions. Based on NetAcad 13.1.10.
                </p>

                <div className="flex flex-row gap-8">
                    <div className="flex flex-col gap-4 w-1/3">
                        <div className="border rounded p-4 space-y-4">
                            <h3 className="font-semibold">Network Configuration</h3>
                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="autoGenerate"
                                    checked={autoGenerate}
                                    onChange={(e) => setAutoGenerate(e.target.checked)}
                                    className="w-4 h-4"
                                />
                                <Label htmlFor="autoGenerate">Auto-generate IP addresses (192.168.1.0/24)</Label>
                            </div>

                            {!autoGenerate && (
                                <>
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
                                        <Label htmlFor="baseCidr">CIDR Prefix</Label>
                                        <Input
                                            id="baseCidr"
                                            type="number"
                                            value={baseCidr}
                                            onChange={(e) => setBaseCidr(e.target.value)}
                                            placeholder="24"
                                            min="16"
                                            max="30"
                                        />
                                    </div>
                                </>
                            )}
                        </div>

                        <div className="border rounded p-4 space-y-4">
                            <h3 className="font-semibold">Wireless Settings</h3>
                            <div>
                                <Label htmlFor="ssid">SSID (Network Name)</Label>
                                <Input
                                    id="ssid"
                                    type="text"
                                    value={ssid}
                                    onChange={(e) => setSsid(e.target.value)}
                                    placeholder="MyWirelessNetwork"
                                />
                            </div>
                            <div>
                                <Label htmlFor="wpaPassword">WPA2 Password (min 8 characters)</Label>
                                <Input
                                    id="wpaPassword"
                                    type="password"
                                    value={wpaPassword}
                                    onChange={(e) => setWpaPassword(e.target.value)}
                                    placeholder="SecurePassword123"
                                />
                            </div>
                        </div>

                        <div className="border rounded p-4 space-y-4">
                            <h3 className="font-semibold">Device Names</h3>
                            <div>
                                <Label htmlFor="routerHostname">Router Hostname</Label>
                                <Input
                                    id="routerHostname"
                                    type="text"
                                    value={routerHostname}
                                    onChange={(e) => setRouterHostname(e.target.value)}
                                    placeholder="WirelessRouter"
                                />
                            </div>
                            <div>
                                <Label htmlFor="apHostname">Access Point Hostname</Label>
                                <Input
                                    id="apHostname"
                                    type="text"
                                    value={apHostname}
                                    onChange={(e) => setApHostname(e.target.value)}
                                    placeholder="AccessPoint"
                                />
                            </div>
                        </div>

                        <Button variant="default" type="button" onClick={generateConfig}>
                            Generate Configuration
                        </Button>
                    </div>

                    <div className="flex-1 flex flex-col gap-4">
                        {result ? (
                            <>
                                <div>
                                    <h3 className="text-lg font-semibold mb-4">Network Information</h3>
                                    <div className="border p-4 space-y-2">
                                        <div className="grid grid-cols-2 gap-2 text-sm">
                                            <span className="font-medium">Network:</span>
                                            <span>
                                                {result.network}/{result.cidr}
                                            </span>

                                            <span className="font-medium">Subnet Mask:</span>
                                            <span>{result.subnet_mask}</span>

                                            <span className="font-medium">Router IP:</span>
                                            <span className="text-green-600 font-medium">{result.router_ip}</span>

                                            <span className="font-medium">Access Point IP:</span>
                                            <span className="text-blue-600 font-medium">{result.ap_ip}</span>

                                            <span className="font-medium">DHCP Range:</span>
                                            <span>
                                                {result.dhcp_start} - {result.dhcp_end}
                                            </span>

                                            <span className="font-medium">Broadcast:</span>
                                            <span>{result.broadcast}</span>

                                            <span className="font-medium">Usable Hosts:</span>
                                            <span>{result.usable_hosts}</span>

                                            <span className="font-medium">SSID:</span>
                                            <span className="font-medium text-primary">{result.ssid}</span>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <h3 className="text-lg font-semibold mb-4">Setup Steps</h3>
                                    <div className="border p-4 space-y-2 max-h-64 overflow-y-auto">
                                        <ol className="text-sm space-y-2">
                                            {result.setup_steps.map((step, index) => (
                                                <li key={`step-${index}`} className={step.startsWith("   ") ? "ml-4" : ""}>
                                                    {step}
                                                </li>
                                            ))}
                                        </ol>
                                    </div>
                                </div>

                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <h3 className="text-lg font-semibold">Router Configuration Commands</h3>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() =>
                                                copyToClipboard(result.router_commands, "Router commands")
                                            }
                                        >
                                            <Copy className="w-4 h-4 mr-2" />
                                            Copy
                                        </Button>
                                    </div>
                                    <pre className="border p-4 bg-muted rounded text-xs overflow-x-auto max-h-64 overflow-y-auto">
                                        {result.router_commands}
                                    </pre>
                                </div>

                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <h3 className="text-lg font-semibold">Access Point Configuration Commands</h3>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => copyToClipboard(result.ap_commands, "AP commands")}
                                        >
                                            <Copy className="w-4 h-4 mr-2" />
                                            Copy
                                        </Button>
                                    </div>
                                    <pre className="border p-4 bg-muted rounded text-xs overflow-x-auto max-h-64 overflow-y-auto">
                                        {result.ap_commands}
                                    </pre>
                                </div>
                            </>
                        ) : (
                            <div className="border p-4 text-center text-muted-foreground">
                                Enter wireless network settings and click Generate Configuration to see the setup guide
                                and Cisco commands
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </main>
    );
};

export default WirelessNetworkSetup;
