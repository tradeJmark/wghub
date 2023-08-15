use js_sys::{JsString, Array};
use wasm_bindgen::prelude::*;
use web_sys::Blob;
use wghub_rust::{model::{HubConfig, SpokeData, HubData}, create_hub_config_file};

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

#[wasm_bindgen(js_name = "generateHubConfigFile")]
pub fn generate_hub_config_file(config: &HubConfigWrapper) -> Blob {
  let string = create_hub_config_file(&config.0);
  let array = Array::of1(&string.into());
  Blob::new_with_str_sequence(&array).unwrap()
}
