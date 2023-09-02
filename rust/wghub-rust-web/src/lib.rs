pub mod ws;
mod wrapper;
mod utils;


use utils::Blobbable;
use wasm_bindgen::prelude::*;
use web_sys::Blob;
use wghub_rust::{create_hub_config_file, create_spoke_config_file};
use wrapper::HubConfigWrapper;
pub use utils::set_panic_hook;

use crate::wrapper::SpokeConfigWrapper;

#[wasm_bindgen(js_name = "generateHubConfigFile")]
pub fn generate_hub_config_file(config: &HubConfigWrapper) -> Blob {
  create_hub_config_file(&config.clone().into()).blobbify()
}

#[wasm_bindgen(js_name = "generateSpokeConfigFile")]
pub fn generate_spoke_config_file(config: &SpokeConfigWrapper) -> Blob {
  create_spoke_config_file(&config.clone().into()).blobbify()
}