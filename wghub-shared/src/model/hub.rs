use serde::{Serialize, Deserialize};
use uuid::Uuid;
#[cfg(feature = "frontend")]
use wasm_bindgen::prelude::*;
#[cfg(feature = "frontend")]
use serde_wasm_bindgen::{from_value, to_value};
#[cfg(feature = "frontend")]
use js_sys::JsString;

#[derive(Serialize, Deserialize, Clone, Debug)]
#[cfg_attr(feature = "frontend", wasm_bindgen(getter_with_clone))]
pub struct Hub {
  #[serde(rename = "_id")]
  id: Uuid,
  pub name: String,
  pub description: Option<String>,
  pub public_key: Option<String>,
  pub endpoint: Option<String>,
  pub ip_address: Option<String>,
  pub dns_servers: Vec<String>,
  pub search_domains: Vec<String>,
  pub allowed_ips: Vec<String>
}

impl PartialEq for Hub {
  fn eq(&self, other: &Self) -> bool {
    self.id == other.id
  }
}
impl Eq for Hub {}

impl Hub {
  pub fn id(&self) -> Uuid {
    self.id.clone()
  }
}

#[cfg_attr(feature = "frontend", wasm_bindgen)]
impl Hub {
  #[cfg_attr(feature = "frontend", wasm_bindgen(constructor))]
  pub fn new(
    name: String,
    description: Option<String>,
    public_key: Option<String>,
    endpoint: Option<String>,
    ip_address: Option<String>,
    dns_servers: Option<Vec<String>>,
    search_domains: Option<Vec<String>>,
    allowed_ips: Option<Vec<String>>
  ) -> Hub {
    Hub {
      id: Uuid::new_v4(),
      name,
      description,
      public_key,
      endpoint,
      ip_address,
      dns_servers: dns_servers.unwrap_or(Vec::default()),
      search_domains: search_domains.unwrap_or(Vec::default()),
      allowed_ips: allowed_ips.unwrap_or(Vec::default())
    }
  }

  #[cfg_attr(feature = "frontend", wasm_bindgen)]
  pub fn new_bare(name: String, description: Option<String>) -> Hub {
    Self::new(name, description, None, None, None, None, None, None)
  }
}

#[cfg(feature = "frontend")]
#[wasm_bindgen]
impl Hub {
  #[wasm_bindgen(js_name = toJSON)]
  pub fn to_json(&self) -> JsValue {
    to_value(self).unwrap()
  }

  #[wasm_bindgen(js_name = fromJSON)]
  pub fn from_json(value: &JsValue) -> Hub {
    from_value(value.clone()).unwrap()
  }

  #[wasm_bindgen(getter = id)]
  pub fn js_id(&self) -> JsString {
    self.id.to_string().into()
  }
}