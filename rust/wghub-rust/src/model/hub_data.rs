#[cfg(feature = "wasm")]
use wasm_bindgen::prelude::*;

#[cfg_attr(feature = "wasm", wasm_bindgen(getter_with_clone))]
pub struct HubData {
  pub ip_address: String,
  pub endpoint_port: String
}

#[cfg_attr(feature = "wasm", wasm_bindgen)]
impl HubData {
  #[cfg_attr(feature = "wasm", wasm_bindgen(constructor))]
  pub fn new(ip_address: String, endpoint_port: String) -> HubData {
    HubData { ip_address, endpoint_port }
  }
}