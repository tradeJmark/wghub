use super::{HubData, SpokeData, SpokeCommonData};
#[cfg(feature = "frontend")]
use wasm_bindgen::prelude::*;

#[cfg_attr(feature = "frontend", wasm_bindgen(getter_with_clone))]
#[derive(Clone)]
pub struct SpokeConfig {
  pub hub: HubData,
  pub spoke: SpokeData,
  pub common: SpokeCommonData
}

impl SpokeConfig {
  pub fn new(hub: HubData, spoke: SpokeData, common: SpokeCommonData) -> SpokeConfig {
    SpokeConfig { hub, spoke, common }
  }
}