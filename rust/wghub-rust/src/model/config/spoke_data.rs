#[cfg(feature = "frontend")]
use wasm_bindgen::prelude::*;

#[cfg_attr(feature = "frontend", wasm_bindgen(getter_with_clone))]
#[derive(Clone)]
pub struct SpokeData {
  pub ip_address: String,
  pub public_key: String
}

#[cfg_attr(feature = "frontend", wasm_bindgen)]
impl SpokeData {
  #[cfg_attr(feature = "frontend", wasm_bindgen(constructor))]
  pub fn new(ip_address: String, public_key: String) -> SpokeData {
    SpokeData { ip_address: ip_address, public_key: public_key}
  }
}