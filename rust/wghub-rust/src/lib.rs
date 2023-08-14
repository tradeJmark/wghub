pub mod model;

use model::{HubData, HubConfig, SpokeData};

pub fn create_hub_config_file(config: &HubConfig) -> String {
  let interface = generate_interface(&config.hub);
  let peers = config.spokes.iter()
    .map(generate_peer)
    .map(|peer| peer + "\n\n")
    .collect::<String>()
    .trim_end().to_string();
  format!("{interface}\n\n{peers}")
}

fn generate_interface(data: &HubData) -> String {
  let address = &data.ip_address;
  let port = &data.endpoint_port;
  let lines = [
    "[Interface]".to_string(),
    format!("Address = {address}"),
    "PrivateKey = #!priv!".to_string(),
    format!("ListenPort = {port}")
  ];
  lines.join("\n")
}

fn generate_peer(data: &SpokeData) -> String {
  let public_key = &data.public_key;
  let ip_address = &data.ip_address;
  let lines = [
    "[Peer]".to_string(),
    format!("PublicKey = {public_key}"),
    format!("AllowedIPs = {ip_address}/32")
  ];
  lines.join("\n")
}