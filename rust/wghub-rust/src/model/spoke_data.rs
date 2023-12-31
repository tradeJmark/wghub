#[cfg(feature = "wasm")]
use wasm_bindgen::prelude::*;

#[cfg_attr(feature = "wasm", wasm_bindgen(getter_with_clone))]
pub struct SpokeData {
  pub ip_address: String,
  pub public_key: String
}

#[cfg_attr(feature = "wasm", wasm_bindgen)]
impl SpokeData {
  #[cfg_attr(feature = "wasm", wasm_bindgen(constructor))]
  pub fn new(ip_address: String, public_key: String) -> SpokeData {
    SpokeData { ip_address: ip_address, public_key: public_key}
  }
}