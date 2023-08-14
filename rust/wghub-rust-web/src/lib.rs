use js_sys::JsString;
use wasm_bindgen::prelude::*;
use wghub_rust::{model::{HubConfig, SpokeData, HubData}, create_hub_config_file};

#[wasm_bindgen]
extern "C" {
  fn alert(s: &str);
}

pub fn zip_spoke_data(spoke_ip_addresses: Vec<JsString>, spoke_public_keys: Vec<JsString>) -> Vec<SpokeData> {
  spoke_ip_addresses.iter()
    .zip(spoke_public_keys.iter())
    .map(|(ip_address, public_key)| SpokeData::new(ip_address.into(), public_key.into()))
    .collect()
}

#[wasm_bindgen(js_name = "HubConfig")]
pub struct HubConfigWrapper(HubConfig);
#[wasm_bindgen(js_class = "HubConfig")]
impl HubConfigWrapper {
  #[wasm_bindgen(constructor)]
  pub fn new(name: String, hub: HubData, spoke_ip_addresses: Vec<JsString>, spoke_public_keys: Vec<JsString>) -> HubConfigWrapper {
    HubConfigWrapper(HubConfig::new(name, hub, zip_spoke_data(spoke_ip_addresses, spoke_public_keys)))
  }
}

#[wasm_bindgen(js_name = "presentHubConfigFile")]
pub fn present_hub_config_file(config: &HubConfigWrapper) {
  let file = create_hub_config_file(&config.0);
  alert(&file);
}
