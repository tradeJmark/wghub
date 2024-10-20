mod utils;
use utils::Blobbable;
use wasm_bindgen::prelude::*;
use web_sys::Blob;
use wghub_shared::{create_hub_config_file, create_spoke_config_file, model::config::{HubConfig, SpokeConfig}};
pub use utils::set_panic_hook;

#[wasm_bindgen(js_name = "generateHubConfigFile")]
pub fn generate_hub_config_file(config: &HubConfig) -> Blob {
  create_hub_config_file(&config.clone().into()).blobbify()
}

#[wasm_bindgen(js_name = "generateSpokeConfigFile")]
pub fn generate_spoke_config_file(config: &SpokeConfig) -> Blob {
  create_spoke_config_file(&config.clone().into()).blobbify()
}

#[wasm_bindgen(start)]
fn start() {
  set_panic_hook();
}