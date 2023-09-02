pub mod ws;

use js_sys::{JsString, Array};
use wasm_bindgen::prelude::*;
use web_sys::Blob;
use wghub_rust::{model::config::{HubConfig, SpokeData, HubData, SpokeConfig, SpokeCommonData}, create_hub_config_file, create_spoke_config_file};

//All of these wrapper classes will be able to go away once wasm-bindgen
//merges in https://github.com/rustwasm/wasm-bindgen/pull/3554 to allow
//Vecs of Strings and bound custom types.

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
  create_hub_config_file(&config.0).blobbify()
}

#[wasm_bindgen(js_name = "SpokeCommonData")]
pub struct SpokeCommonDataWrapper(SpokeCommonData);
#[wasm_bindgen(js_class = "SpokeCommonData")]
impl SpokeCommonDataWrapper {
  #[wasm_bindgen(constructor)]
  pub fn new(dns_servers: Vec<JsString>, search_domains: Vec<JsString>, allowed_ips: Vec<JsString>) -> SpokeCommonDataWrapper {
    SpokeCommonDataWrapper(SpokeCommonData {dns_servers: dns_servers.unwrap_all(), search_domains: search_domains.unwrap_all(), allowed_ips: allowed_ips.unwrap_all()})
  }
}

#[wasm_bindgen(js_name = "SpokeConfig")]
pub struct SpokeConfigWrapper(SpokeConfig);
#[wasm_bindgen(js_class = "SpokeConfig")]
impl SpokeConfigWrapper {
  #[wasm_bindgen(constructor)]
  pub fn new(hub: HubData, spoke: SpokeData, common: SpokeCommonDataWrapper) -> SpokeConfigWrapper {
    SpokeConfigWrapper(SpokeConfig { hub, spoke, common: common.0 })
  }
}

#[wasm_bindgen(js_name = "generateSpokeConfigFile")]
pub fn generate_spoke_config_file(config: &SpokeConfigWrapper) -> Blob {
  create_spoke_config_file(&config.0).blobbify()
}

trait JsStringCollection {
  fn unwrap_all(self) -> Vec<String>;
}

impl JsStringCollection for Vec<JsString> {
  fn unwrap_all(self) -> Vec<String> {
    self.iter().map(|s| s.into()).collect()
  }
}

trait JsStringableCollection {
  fn wrap_all(self) -> Vec<JsString>;
}

impl JsStringableCollection for Vec<String> {
  fn wrap_all(self) -> Vec<JsString> {
    self.into_iter().map(|s| s.into()).collect()
  }
}

trait Blobbable {
  fn blobbify(self) -> Blob;
}

impl Blobbable for String {
  fn blobbify(self) -> Blob {
    let array = Array::of1(&self.into());
    Blob::new_with_str_sequence(&array).unwrap()
  }
}