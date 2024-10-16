use serde::{Serialize, Deserialize};
use uuid::Uuid;

#[derive(Serialize, Deserialize, Clone)]
pub struct Spoke {
  #[serde(rename = "_id")]
  pub id: Uuid,
  pub hub: Uuid,
  pub name: String,
  #[serde(rename = "ipAddress")]
  pub ip_address: String,
  #[serde(rename = "publicKey")]
  pub public_key: Option<String>,
  pub disabled: bool
}

impl Spoke {
  pub fn new(hub: Uuid, name: String, ip_address: String, public_key: Option<String>, disabled: Option<bool>) -> Spoke {
    Spoke { id: Uuid::new_v4(), hub, name, ip_address, public_key, disabled: disabled.unwrap_or(false) }
  }
}

impl Into<AnonymousSpoke> for Spoke {
  fn into(self) -> AnonymousSpoke {
    AnonymousSpoke {
      name: self.name,
      ip_address: self.ip_address,
      public_key: self.public_key,
      disabled: self.disabled
    }
  }
}

#[derive(Serialize, Deserialize, Clone)]
pub struct AnonymousSpoke {
  pub name: String,
  #[serde(rename = "ipAddress")]
  pub ip_address: String,
  #[serde(rename = "publicKey")]
  pub public_key: Option<String>,
  pub disabled: bool
}

impl AnonymousSpoke {
  pub fn to_spoke(self, hub: Uuid, id: Option<Uuid>) -> Spoke {
    Spoke {
      id: id.unwrap_or(Uuid::new_v4()),
      hub,
      name: self.name,
      ip_address: self.ip_address,
      public_key: self.public_key,
      disabled: self.disabled
    }
  }
}