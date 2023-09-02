#[cfg(feature = "wasm")]
use wasm_bindgen::prelude::*;

#[cfg_attr(feature = "wasm", wasm_bindgen(getter_with_clone))]
#[derive(Clone)]
pub struct HubData {
  pub public_key: String,
  pub ip_address: String,
  pub endpoint_address: String,
  pub endpoint_port: String
}

#[cfg_attr(feature = "wasm", wasm_bindgen)]
impl HubData {
  #[cfg_attr(feature = "wasm", wasm_bindgen(constructor))]
  pub fn new(public_key: String, ip_address: String, endpoint_address: String, endpoint_port: String) -> HubData {
    HubData { public_key, ip_address, endpoint_address, endpoint_port }
  }
}