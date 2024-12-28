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

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![calculate_ip_range])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
