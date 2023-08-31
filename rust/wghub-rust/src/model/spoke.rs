use serde::{Serialize, Deserialize};

#[derive(Serialize, Deserialize, Clone, Hash, PartialEq, Eq)]
pub struct SpokeID {
  #[serde(rename = "hubName")]
  pub hub_name: String,
  pub name: String
}

impl SpokeID {
  pub fn new(hub_name: String, name: String) -> SpokeID {
    SpokeID { hub_name, name }
  }
}

#[derive(Serialize, Deserialize, Clone)]
pub struct Spoke {
  #[serde(rename = "_id")]
  pub id: SpokeID,
  #[serde(rename = "ipAddress")]
  pub ip_address: String,
  #[serde(rename = "publicKey")]
  pub public_key: Option<String>,
  pub disabled: bool
}

impl Spoke {
  pub fn new(hub_name: String, name: String, ip_address: String, public_key: Option<String>, disabled: Option<bool>) -> Spoke {
    Spoke { id: SpokeID::new(hub_name, name), ip_address, public_key, disabled: disabled.unwrap_or(false) }
  }
}