use super::{SpokeData, HubData};
use serde::{Deserialize, Serialize};
#[cfg(feature = "frontend")]
use wasm_bindgen::prelude::*;

#[cfg_attr(feature = "frontend", wasm_bindgen(getter_with_clone))]
#[derive(Debug, Clone, Serialize, Deserialize)]
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