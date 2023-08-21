pub mod model;

use model::{HubData, HubConfig, SpokeData, SpokeCommonData, SpokeConfig};

static PRIV: &str = "privprivprivprivprivprivprivprivprivpriv000=";

pub fn create_hub_config_file(config: &HubConfig) -> String {
  let interface = generate_hub_interface(&config.hub);
  let peers = config.spokes.iter()
      .map(generate_spoke_peer)
      .collect::<Vec<String>>()
      .join("\n\n");
  join_non_empty(vec![interface, peers], "\n\n") + "\n"
}

pub fn create_spoke_config_file(config: &SpokeConfig) -> String {
  let interface = generate_spoke_interface(&config.spoke, &config.common);
  let peer = generate_hub_peer(&config.hub, &config.common);
  join_non_empty(vec![interface, peer], "\n\n") + "\n"
}

fn generate_hub_interface(data: &HubData) -> String {
  let lines = [
    "[Interface]".to_string(),
    format!("Address = {}/24", data.ip_address),
    format!("PrivateKey = {PRIV}"),
    format!("ListenPort = {}", data.endpoint_port)
  ];
  lines.join("\n")
}

fn generate_spoke_interface(data: &SpokeData, common: &SpokeCommonData) -> String {
  let dns_servers = common.dns_servers.join(",");
  let search_domains = common.search_domains.join(",");
  let dns_string = join_non_empty(vec![dns_servers, search_domains], ",");
  let mut  lines = vec![
    "[Interface]".to_string(),
    format!("Address = {}/32", data.ip_address),
    format!("PrivateKey = {PRIV}")
  ];
  if dns_string.len() > 0 {
    lines.push(format!("DNS = {dns_string}"));
  }
  lines.join("\n")
}

fn generate_spoke_peer(data: &SpokeData) -> String {
  let lines = [
    "[Peer]".to_string(),
    format!("PublicKey = {}", &data.public_key),
    format!("AllowedIPs = {}/32", &data.ip_address)
  ];
  lines.join("\n")
}

fn generate_hub_peer(data: &HubData, common: &SpokeCommonData) -> String {
  let mut lines = vec![
    "[Peer]".to_string(),
    format!("PublicKey = {}", data.public_key),
    format!("Endpoint = {}:{}", data.endpoint_address, data.endpoint_port)
  ];
  if common.allowed_ips.len() > 0 {
    lines.push(format!("AllowedIPs = {}", common.allowed_ips.join(",")))
  }
  lines.join("\n")
}

fn join_non_empty(vec: Vec<String>, separator: &str) -> String {
  let filtered: Vec<String> = vec.into_iter().filter(|str| !str.is_empty()).collect();
  filtered.join(separator)
}