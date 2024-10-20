use serde::{Deserialize, Serialize};
#[cfg(feature = "frontend")]
use wasm_bindgen::prelude::*;

#[cfg_attr(feature = "frontend", wasm_bindgen(getter_with_clone))]
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SpokeCommonData {
  pub dns_servers: Vec<String>,
  pub search_domains: Vec<String>,
  pub allowed_ips: Vec<String>
}

#[cfg_attr(feature = "frontend", wasm_bindgen)]
impl SpokeCommonData {
  #[cfg_attr(feature = "frontend", wasm_bindgen(constructor))]
  pub fn new(dns_servers: Vec<String>, search_domains: Vec<String>, allowed_ips: Vec<String>) -> SpokeCommonData {
    SpokeCommonData {dns_servers, search_domains, allowed_ips}
  }
}