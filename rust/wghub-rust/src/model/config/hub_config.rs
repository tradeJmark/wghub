use super::{SpokeData, HubData};
#[cfg(feature = "frontend")]
use wasm_bindgen::prelude::*;

#[cfg_attr(feature = "frontend", wasm_bindgen(getter_with_clone))]
#[derive(Clone)]
pub struct HubConfig {
  pub name: String,
  pub hub: HubData,
  pub spokes: Vec<SpokeData>
}

#[cfg_attr(feature = "frontend", wasm_bindgen)]
impl HubConfig {
  #[cfg_attr(feature = "frontend", wasm_bindgen(constructor))]
  pub fn new(name: String, hub: HubData, spokes: Vec<SpokeData>) -> HubConfig {
    HubConfig { name, hub, spokes }
  }
}