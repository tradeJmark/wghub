//All of these wrapper classes will be able to go away once wasm-bindgen
//merges in https://github.com/rustwasm/wasm-bindgen/pull/3554 to allow
//Vecs of Strings and bound custom types.

use wasm_bindgen::prelude::*;
use js_sys::JsString;
use wghub_rust::model::config::{SpokeData, HubConfig, HubData, SpokeCommonData, SpokeConfig};

use crate::utils::AllInto;

#[wasm_bindgen(js_name = "HubConfig")]
#[derive(Clone)]
pub struct HubConfigWrapper(HubConfig);
#[wasm_bindgen(js_class = "HubConfig")]
impl HubConfigWrapper {
  #[wasm_bindgen(constructor)]
  pub fn new(name: String, hub: HubData, spoke_ip_addresses: Vec<JsString>, spoke_public_keys: Vec<JsString>) -> HubConfigWrapper {
    HubConfigWrapper(HubConfig::new(name, hub, Self::zip_spoke_data(spoke_ip_addresses, spoke_public_keys)))
  }

  fn zip_spoke_data(spoke_ip_addresses: Vec<JsString>, spoke_public_keys: Vec<JsString>) -> Vec<SpokeData> {
    spoke_ip_addresses.into_iter()
      .zip(spoke_public_keys.into_iter())
      .map(|(ip_address, public_key)| SpokeData::new(ip_address.into(), public_key.into()))
      .collect()
  }
}

impl Into<HubConfig> for HubConfigWrapper {
  fn into(self) -> HubConfig {
    self.0
  }
}

#[derive(Clone)]
#[wasm_bindgen(js_name = "SpokeCommonData")]
pub struct SpokeCommonDataWrapper(SpokeCommonData);
#[wasm_bindgen(js_class = "SpokeCommonData")]
impl SpokeCommonDataWrapper {
  #[wasm_bindgen(constructor)]
  pub fn new(dns_servers: Vec<JsString>, search_domains: Vec<JsString>, allowed_ips: Vec<JsString>) -> SpokeCommonDataWrapper {
    SpokeCommonDataWrapper(SpokeCommonData {dns_servers: dns_servers.all_into(), search_domains: search_domains.all_into(), allowed_ips: allowed_ips.all_into()})
  }
}

#[wasm_bindgen(js_name = "SpokeConfig")]
#[derive(Clone)]
pub struct SpokeConfigWrapper(SpokeConfig);
#[wasm_bindgen(js_class = "SpokeConfig")]
impl SpokeConfigWrapper {
  #[wasm_bindgen(constructor)]
  pub fn new(hub: HubData, spoke: SpokeData, common: SpokeCommonDataWrapper) -> SpokeConfigWrapper {
    SpokeConfigWrapper(SpokeConfig { hub, spoke, common: common.0 })
  }
}

impl Into<SpokeConfig> for SpokeConfigWrapper {
  fn into(self) -> SpokeConfig {
    self.0
  }
}
