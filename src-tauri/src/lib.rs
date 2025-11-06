use serde::{Deserialize, Serialize};

#[derive(Deserialize)]
struct IpInput {
    ip_address: String,
    subnet_mask: String,
}

#[derive(Serialize)]
struct IpResult {
    valid_ips: Vec<String>,
    error: Option<String>,
}

#[derive(Deserialize)]
struct IpCalculatorInput {
    ip_address: String,
    network_bits: String,
}

#[derive(Serialize)]
struct NetworkInfo {
    address: String,
    netmask: String,
    wildcard: String,
    network: String,
    broadcast: String,
    hostmin: String,
    hostmax: String,
    hosts: u32,
    ip_class: String,
    is_private: bool,
}

#[derive(Serialize)]
struct IpCalculatorResult {
    info: Option<NetworkInfo>,
    error: Option<String>,
}

#[derive(Serialize)]
pub struct SubnetMaskReference {
    cidr: String,
    total_hosts: u32,
    usable_hosts: u32,
    subnet_mask: String,
}

#[derive(Deserialize)]
struct VlsmInput {
    base_network: String,
    base_cidr: u32,
    host_requirements: Vec<u32>,
}

#[derive(Serialize, Clone)]
struct VlsmSubnet {
    network: String,
    cidr: u32,
    subnet_mask: String,
    first_host: String,
    last_host: String,
    broadcast: String,
    required_hosts: u32,
    usable_hosts: u32,
}

#[derive(Serialize)]
struct VlsmResult {
    subnets: Vec<VlsmSubnet>,
    error: Option<String>,
}

#[derive(Deserialize)]
struct VlanInput {
    base_network: String,
    base_cidr: u32,
    vlan_configs: Vec<VlanConfig>,
}

#[derive(Deserialize, Clone)]
struct VlanConfig {
    vlan_id: u32,
    vlan_name: String,
    required_hosts: u32,
}

#[derive(Serialize, Clone)]
struct VlanAllocation {
    vlan_id: u32,
    vlan_name: String,
    network: String,
    cidr: u32,
    subnet_mask: String,
    gateway: String,
    first_host: String,
    last_host: String,
    broadcast: String,
    usable_hosts: u32,
}

#[derive(Serialize)]
struct VlanResult {
    allocations: Vec<VlanAllocation>,
    cisco_commands: Option<String>,
    error: Option<String>,
}

#[tauri::command]
fn generate_subnet_references() -> Vec<SubnetMaskReference> {
    let mut references = Vec::new();

    for prefix in (16..=31).rev() {
        let total_hosts = 1u32 << (32 - prefix);
        let usable_hosts = if prefix >= 31 { total_hosts } else { total_hosts - 2 };

        let mask = !((1u32 << (32 - prefix)) - 1);
        let subnet_mask = format!("{}.{}.{}.{}",
            (mask >> 24) & 255,
            (mask >> 16) & 255,
            (mask >> 8) & 255,
            mask & 255
        );

        references.push(SubnetMaskReference {
            cidr: format!("/{}", prefix),
            total_hosts,
            usable_hosts,
            subnet_mask,
        });
    }

    references
}

#[tauri::command]
fn calculate_ip_range(input: IpInput) -> IpResult {
    match calculate_ips(&input.ip_address, &input.subnet_mask) {
        Ok(ips) => IpResult {
            valid_ips: ips,
            error: None,
        },
        Err(e) => IpResult {
            valid_ips: vec![],
            error: Some(e.to_string()),
        },
    }
}

fn calculate_ips(ip_address: &str, subnet_mask: &str) -> Result<Vec<String>, String> {
    let mask_bits: u32 = subnet_mask.parse().map_err(|_| "Invalid subnet mask")?;

    if mask_bits > 32 {
        return Err("Subnet mask must be between 0 and 32".to_string());
    }

    let ip_parts: Vec<&str> = ip_address.split('.').collect();
    if ip_parts.len() != 4 {
        return Err("Invalid IP address".to_string());
    }

    let mut ip_nums = [0u32; 4];
    for (i, part) in ip_parts.iter().enumerate() {
        if part.is_empty() {
            ip_nums[i] = 0;
        } else {
            ip_nums[i] = part.parse()
                .map_err(|_| "Invalid IP address number")?;
            if ip_nums[i] > 255 {
                return Err("IP address numbers must be between 0 and 255".into());
            }
        }
    }

    let ip_as_int = (ip_nums[0] << 24) | (ip_nums[1] << 16) | (ip_nums[2] << 8) | ip_nums[3];
    let host_bits = 32 - mask_bits;
    let subnet_size = 1u32 << host_bits;
    let network_address = ip_as_int & !(subnet_size - 1);
    let broadcast_address = network_address | (subnet_size - 1);

    let mut valid_ips = Vec::new();
    for ip in (network_address + 1)..broadcast_address {
        valid_ips.push(format!("{}.{}.{}.{}",
            (ip >> 24) & 255,
            (ip >> 16) & 255,
            (ip >> 8) & 255,
            ip & 255
        ));
    }

    Ok(valid_ips)
}

#[tauri::command]
fn calculate_network_info(input: IpCalculatorInput) -> IpCalculatorResult {
    match calculate_ip_info(&input.ip_address, &input.network_bits) {
        Ok(info) => IpCalculatorResult {
            info: Some(info),
            error: None,
        },
        Err(e) => IpCalculatorResult {
            info: None,
            error: Some(e),
        },
    }
}

fn calculate_ip_info(ip: &str, bits: &str) -> Result<NetworkInfo, String> {
    let mask_bits: u32 = bits.parse()
        .map_err(|_| "Invalid network bits")?;
    if mask_bits > 32 {
        return Err("Network bits must be between 0 and 32".to_string());
    }

    let ip_parts: Vec<&str> = ip.split('.').collect();
    if ip_parts.len() != 4 {
        return Err("Invalid IP address format".to_string());
    }

    let mut ip_nums = [0u32; 4];
    for (i, part) in ip_parts.iter().enumerate() {
        ip_nums[i] = part.parse()
            .map_err(|_| "Invalid IP address number")?;
        if ip_nums[i] > 255 {
            return Err("IP address numbers must be between 0 and 255".to_string());
        }
    }

    let ip_int = (ip_nums[0] << 24) | (ip_nums[1] << 16) | (ip_nums[2] << 8) | ip_nums[3];
    let netmask = !((1u32 << (32 - mask_bits)) - 1);
    let wildcard = !netmask;
    let network = ip_int & netmask;
    let broadcast = network | wildcard;
    let hostmin = network + 1;
    let hostmax = broadcast - 1;
    let hosts = if mask_bits > 30 { 0 } else { 2u32.pow(32 - mask_bits) - 2 };

    let ip_class = match ip_nums[0] {
        0..=127 => "A",
        128..=191 => "B",
        192..=223 => "C",
        224..=239 => "D",
        _ => "E",
    }.to_string();

    let is_private = (ip_nums[0] == 10) ||
                    (ip_nums[0] == 172 && ip_nums[1] >= 16 && ip_nums[1] <= 31) ||
                    (ip_nums[0] == 192 && ip_nums[1] == 168);

    Ok(NetworkInfo {
        address: format!("{}.{}.{}.{}", ip_nums[0], ip_nums[1], ip_nums[2], ip_nums[3]),
        netmask: format!("{}.{}.{}.{}",
            (netmask >> 24) & 255,
            (netmask >> 16) & 255,
            (netmask >> 8) & 255,
            netmask & 255
        ),
        wildcard: format!("{}.{}.{}.{}",
            (wildcard >> 24) & 255,
            (wildcard >> 16) & 255,
            (wildcard >> 8) & 255,
            wildcard & 255
        ),
        network: format!("{}.{}.{}.{}",
            (network >> 24) & 255,
            (network >> 16) & 255,
            (network >> 8) & 255,
            network & 255
        ),
        broadcast: format!("{}.{}.{}.{}",
            (broadcast >> 24) & 255,
            (broadcast >> 16) & 255,
            (broadcast >> 8) & 255,
            broadcast & 255
        ),
        hostmin: format!("{}.{}.{}.{}",
            (hostmin >> 24) & 255,
            (hostmin >> 16) & 255,
            (hostmin >> 8) & 255,
            hostmin & 255
        ),
        hostmax: format!("{}.{}.{}.{}",
            (hostmax >> 24) & 255,
            (hostmax >> 16) & 255,
            (hostmax >> 8) & 255,
            hostmax & 255
        ),
        hosts,
        ip_class,
        is_private,
    })
}

#[tauri::command]
fn calculate_vlsm(input: VlsmInput) -> VlsmResult {
    match calculate_vlsm_subnets(&input.base_network, input.base_cidr, &input.host_requirements) {
        Ok(subnets) => VlsmResult {
            subnets,
            error: None,
        },
        Err(e) => VlsmResult {
            subnets: vec![],
            error: Some(e),
        },
    }
}

fn calculate_vlsm_subnets(base_network: &str, base_cidr: u32, host_requirements: &[u32]) -> Result<Vec<VlsmSubnet>, String> {
    if base_cidr > 32 {
        return Err("Base CIDR must be between 0 and 32".to_string());
    }

    let ip_parts: Vec<&str> = base_network.split('.').collect();
    if ip_parts.len() != 4 {
        return Err("Invalid base network address format".to_string());
    }

    let mut ip_nums = [0u32; 4];
    for (i, part) in ip_parts.iter().enumerate() {
        ip_nums[i] = part.parse()
            .map_err(|_| "Invalid IP address number")?;
        if ip_nums[i] > 255 {
            return Err("IP address numbers must be between 0 and 255".to_string());
        }
    }

    let base_ip_int = (ip_nums[0] << 24) | (ip_nums[1] << 16) | (ip_nums[2] << 8) | ip_nums[3];
    
    // Sort requirements in descending order (largest to smallest)
    let mut sorted_requirements: Vec<u32> = host_requirements.to_vec();
    sorted_requirements.sort_by(|a, b| b.cmp(a));

    let mut subnets = Vec::new();
    let mut current_ip = base_ip_int;

    for required_hosts in sorted_requirements {
        // Calculate the required subnet size (need to account for network and broadcast)
        let total_needed = required_hosts + 2;
        
        // Find the smallest power of 2 that can accommodate the hosts
        let mut subnet_size = 4u32; // Minimum /30 (4 addresses)
        while subnet_size < total_needed {
            subnet_size *= 2;
        }

        // Calculate CIDR from subnet size
        let host_bits = (subnet_size as f64).log2() as u32;
        let subnet_cidr = 32 - host_bits;

        if subnet_cidr < base_cidr {
            return Err(format!("Cannot allocate subnet for {} hosts within /{} network", required_hosts, base_cidr));
        }

        // Calculate subnet details
        let netmask = !((1u32 << host_bits) - 1);
        // Ensure current_ip is properly aligned to subnet boundary
        let network = current_ip & netmask;
        let broadcast = network | !netmask;
        let first_host = network + 1;
        let last_host = broadcast - 1;
        let usable_hosts = subnet_size - 2;

        let subnet_mask = format!("{}.{}.{}.{}",
            (netmask >> 24) & 255,
            (netmask >> 16) & 255,
            (netmask >> 8) & 255,
            netmask & 255
        );

        subnets.push(VlsmSubnet {
            network: format!("{}.{}.{}.{}",
                (network >> 24) & 255,
                (network >> 16) & 255,
                (network >> 8) & 255,
                network & 255
            ),
            cidr: subnet_cidr,
            subnet_mask,
            first_host: format!("{}.{}.{}.{}",
                (first_host >> 24) & 255,
                (first_host >> 16) & 255,
                (first_host >> 8) & 255,
                first_host & 255
            ),
            last_host: format!("{}.{}.{}.{}",
                (last_host >> 24) & 255,
                (last_host >> 16) & 255,
                (last_host >> 8) & 255,
                last_host & 255
            ),
            broadcast: format!("{}.{}.{}.{}",
                (broadcast >> 24) & 255,
                (broadcast >> 16) & 255,
                (broadcast >> 8) & 255,
                broadcast & 255
            ),
            required_hosts,
            usable_hosts,
        });

        // Move to next available network address
        current_ip = network + subnet_size;
    }

    Ok(subnets)
}

#[tauri::command]
fn calculate_vlan_allocation(input: VlanInput) -> VlanResult {
    match calculate_vlans(&input.base_network, input.base_cidr, &input.vlan_configs) {
        Ok((allocations, commands)) => VlanResult {
            allocations,
            cisco_commands: Some(commands),
            error: None,
        },
        Err(e) => VlanResult {
            allocations: vec![],
            cisco_commands: None,
            error: Some(e),
        },
    }
}

fn calculate_vlans(base_network: &str, base_cidr: u32, vlan_configs: &[VlanConfig]) -> Result<(Vec<VlanAllocation>, String), String> {
    if base_cidr > 32 {
        return Err("Base CIDR must be between 0 and 32".to_string());
    }

    let ip_parts: Vec<&str> = base_network.split('.').collect();
    if ip_parts.len() != 4 {
        return Err("Invalid base network address format".to_string());
    }

    let mut ip_nums = [0u32; 4];
    for (i, part) in ip_parts.iter().enumerate() {
        ip_nums[i] = part.parse()
            .map_err(|_| "Invalid IP address number")?;
        if ip_nums[i] > 255 {
            return Err("IP address numbers must be between 0 and 255".to_string());
        }
    }

    let base_ip_int = (ip_nums[0] << 24) | (ip_nums[1] << 16) | (ip_nums[2] << 8) | ip_nums[3];
    
    // Sort VLAN configs by required hosts (descending order)
    let mut sorted_configs = vlan_configs.to_vec();
    sorted_configs.sort_by(|a, b| b.required_hosts.cmp(&a.required_hosts));

    let mut allocations = Vec::new();
    let mut current_ip = base_ip_int;
    let mut cisco_commands = String::new();

    for config in sorted_configs {
        // Calculate the required subnet size
        let total_needed = config.required_hosts + 2;
        
        let mut subnet_size = 4u32;
        while subnet_size < total_needed {
            subnet_size *= 2;
        }

        let host_bits = (subnet_size as f64).log2() as u32;
        let subnet_cidr = 32 - host_bits;

        if subnet_cidr < base_cidr {
            return Err(format!("Cannot allocate subnet for VLAN {} with {} hosts within /{} network", 
                config.vlan_id, config.required_hosts, base_cidr));
        }

        let netmask = !((1u32 << host_bits) - 1);
        let network = current_ip & netmask;
        let broadcast = network | !netmask;
        let gateway = network + 1; // First usable IP as gateway
        let first_host = network + 2; // Second usable IP
        let last_host = broadcast - 1;
        let usable_hosts = subnet_size - 2;

        let subnet_mask = format!("{}.{}.{}.{}",
            (netmask >> 24) & 255,
            (netmask >> 16) & 255,
            (netmask >> 8) & 255,
            netmask & 255
        );

        let gateway_ip = format!("{}.{}.{}.{}",
            (gateway >> 24) & 255,
            (gateway >> 16) & 255,
            (gateway >> 8) & 255,
            gateway & 255
        );

        allocations.push(VlanAllocation {
            vlan_id: config.vlan_id,
            vlan_name: config.vlan_name.clone(),
            network: format!("{}.{}.{}.{}",
                (network >> 24) & 255,
                (network >> 16) & 255,
                (network >> 8) & 255,
                network & 255
            ),
            cidr: subnet_cidr,
            subnet_mask: subnet_mask.clone(),
            gateway: gateway_ip.clone(),
            first_host: format!("{}.{}.{}.{}",
                (first_host >> 24) & 255,
                (first_host >> 16) & 255,
                (first_host >> 8) & 255,
                first_host & 255
            ),
            last_host: format!("{}.{}.{}.{}",
                (last_host >> 24) & 255,
                (last_host >> 16) & 255,
                (last_host >> 8) & 255,
                last_host & 255
            ),
            broadcast: format!("{}.{}.{}.{}",
                (broadcast >> 24) & 255,
                (broadcast >> 16) & 255,
                (broadcast >> 8) & 255,
                broadcast & 255
            ),
            usable_hosts,
        });

        // Generate Cisco Packet Tracer commands
        cisco_commands.push_str(&format!("! Configuration for VLAN {} - {}\n", config.vlan_id, config.vlan_name));
        cisco_commands.push_str("enable\n");
        cisco_commands.push_str("configure terminal\n");
        cisco_commands.push_str(&format!("vlan {}\n", config.vlan_id));
        cisco_commands.push_str(&format!("name {}\n", config.vlan_name));
        cisco_commands.push_str("exit\n");
        cisco_commands.push_str(&format!("interface vlan {}\n", config.vlan_id));
        cisco_commands.push_str(&format!("ip address {} {}\n", gateway_ip, subnet_mask));
        cisco_commands.push_str("no shutdown\n");
        cisco_commands.push_str("exit\n");
        cisco_commands.push_str("exit\n");
        cisco_commands.push_str("\n");

        current_ip = network + subnet_size;
    }

    Ok((allocations, cisco_commands))
}

#[tauri::command]
fn exit_app() {
    std::process::exit(0x0);
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            calculate_ip_range, 
            calculate_network_info, 
            generate_subnet_references, 
            calculate_vlsm,
            calculate_vlan_allocation,
            exit_app
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
