use serde::{Serialize, Deserialize};

#[derive(Serialize, Deserialize)]
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

#[derive(Serialize, Deserialize)]
pub struct Spoke {
  #[serde(rename = "_id")]
  pub id: SpokeID,
  #[serde(rename = "ipAddress")]
  pub ip_address: String,
  #[serde(rename = "publicKey")]
  pub public_key: Option<String>
}

impl Spoke {
  pub fn new(hub_name: String, name: String, ip_address: String, public_key: Option<String>) -> Spoke {
    Spoke { id: SpokeID::new(hub_name, name), ip_address, public_key }
  }
}