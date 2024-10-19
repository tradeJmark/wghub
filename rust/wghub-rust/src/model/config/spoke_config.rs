use super::{HubData, SpokeData, SpokeCommonData};
use serde::{Deserialize, Serialize};
#[cfg(feature = "frontend")]
use wasm_bindgen::prelude::*;

#[cfg_attr(feature = "frontend", wasm_bindgen(getter_with_clone))]
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SpokeConfig {
  pub hub: HubData,
  pub spoke: SpokeData,
  pub common: SpokeCommonData
}

#[cfg_attr(feature = "frontend", wasm_bindgen)]
impl SpokeConfig {
  #[cfg_attr(feature = "frontend", wasm_bindgen(constructor))]
  pub fn new(hub: HubData, spoke: SpokeData, common: SpokeCommonData) -> SpokeConfig {
    SpokeConfig { hub, spoke, common }
  }
}