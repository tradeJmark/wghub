mod utils;
use utils::Blobbable;
use wasm_bindgen::prelude::*;
use web_sys::{window, Blob};
use wghub_rust::{create_hub_config_file, create_spoke_config_file};
pub use utils::set_panic_hook;
use wghub_rust::model::config::{HubConfig, SpokeConfig};

#[wasm_bindgen(js_name = getApiUrl)]
pub fn get_api_url() -> String {
  if cfg!(debug_assertions) {
    env!("WGHUB_DEV_BACKEND").to_string()
  }
  else {
    let location = window().unwrap().location();
    let proto = location.protocol().unwrap();
    format!("{proto}://{}/api", location.host().unwrap())
  }
}

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