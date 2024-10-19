use serde::{Serialize, Deserialize};
use uuid::Uuid;
#[cfg(feature = "frontend")]
use wasm_bindgen::prelude::*;
#[cfg(feature = "frontend")]
use serde_wasm_bindgen::{from_value, to_value};
#[cfg(feature = "frontend")]
use js_sys::JsString;

#[cfg_attr(feature = "frontend", wasm_bindgen(getter_with_clone))]
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Spoke {
  #[serde(rename = "_id")]
  id: Uuid, 
  hub_id: Uuid,
  pub name: String,
  pub ip_address: String,
  pub public_key: Option<String>,
  pub disabled: bool
}

impl PartialEq for Spoke {
  fn eq(&self, other: &Self) -> bool {
    self.id == other.id && self.hub_id == other.hub_id
  }
}

impl Eq for Spoke {}

impl Spoke {
  pub fn new(hub_id: Uuid, name: String, ip_address: String, public_key: Option<String>, disabled: Option<bool>) -> Spoke {
    Spoke { id: Uuid::new_v4(), hub_id, name, ip_address, public_key, disabled: disabled.unwrap_or(false) }
  }

  //No reason this wouldn't be wasm-bindgen-ed, but it throws an error if I do, seemingly from a bug in wasm-bindgen, but whatever. I don't actually need it in JS.
  pub fn is_unbound(&self) -> bool {
    self.hub_id.is_nil()
  }
}

#[cfg_attr(feature = "frontend", wasm_bindgen)]
impl Spoke {
  #[cfg_attr(feature = "frontend", wasm_bindgen(js_name = newUnbound))]
  pub fn new_unbound(name: String, ip_address: String, public_key: Option<String>, disabled: Option<bool>) -> Spoke {
    Spoke::new(Uuid::nil(), name, ip_address, public_key, disabled)
  }

  pub fn generable(&self) -> bool {
    !self.disabled && !self.public_key.as_ref().map(String::is_empty).unwrap_or(true)
  }
}

#[cfg(not(feature = "frontend"))]
impl Spoke {
  pub fn id(&self) -> Uuid {  
    self.id.clone()
  }

  pub fn hub_id(&self) -> Uuid {
    self.hub_id.clone()
  }

  pub fn set_hub_id(&mut self, hub_id: Uuid) {
    self.hub_id = hub_id;
  }
}

#[cfg(feature = "frontend")]
#[wasm_bindgen]
impl Spoke {
  #[wasm_bindgen(js_name = toJSON)]
  pub fn to_json(&self) -> JsValue {
    to_value(self).unwrap()
  }

  #[wasm_bindgen(js_name = fromJSON)]
  pub fn from_json(value: &JsValue) -> Spoke {
    from_value(value.clone()).unwrap()
  }

  #[wasm_bindgen(getter)]
  pub fn id(&self) -> JsString {
    self.id.to_string().into()
  }

  #[wasm_bindgen(getter)]
  pub fn hub_id(&self) -> JsString {
    self.hub_id.to_string().into()
  }
}