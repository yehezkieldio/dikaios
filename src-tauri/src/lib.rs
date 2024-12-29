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
fn exit_app() {
    std::process::exit(0x0);
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![calculate_ip_range, calculate_network_info, generate_subnet_references, exit_app])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
