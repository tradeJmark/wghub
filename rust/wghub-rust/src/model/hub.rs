use serde::{Serialize, Deserialize};
use uuid::Uuid;

#[derive(Serialize, Deserialize, Clone)]
pub struct Hub {
  #[serde(rename = "_id")]
  pub id: Uuid,
  pub name: String,
  pub description: Option<String>,
  #[serde(rename = "publicKey")]
  pub public_key: Option<String>,
  pub endpoint: Option<String>,
  #[serde(rename = "ipAddress")]
  pub ip_address: Option<String>,
  #[serde(rename = "dnsServers")]
  pub dns_servers: Vec<String>,
  #[serde(rename = "searchDomains")]
  pub search_domains: Vec<String>,
  #[serde(rename = "allowedIPs")]
  pub allowed_ips: Vec<String>
}

impl Hub {
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

  pub fn new_bare(name: String, description: Option<String>) -> Hub {
    Self::new(name, description, None, None, None, None, None, None)
  }
}

impl Into<AnonymousHub> for Hub {
  fn into(self) -> AnonymousHub {
    AnonymousHub {
      name: self.name,
      description: self.description,
      public_key: self.public_key,
      endpoint: self.endpoint,
      ip_address: self.ip_address,
      dns_servers: self.dns_servers,
      search_domains: self.search_domains,
      allowed_ips: self.allowed_ips
    }
  }
}

#[derive(Serialize, Deserialize, Clone)]
pub struct AnonymousHub {
  pub name: String,
  pub description: Option<String>,
  #[serde(rename = "publicKey")]
  pub public_key: Option<String>,
  pub endpoint: Option<String>,
  #[serde(rename = "ipAddress")]
  pub ip_address: Option<String>,
  #[serde(rename = "dnsServers")]
  pub dns_servers: Vec<String>,
  #[serde(rename = "searchDomains")]
  pub search_domains: Vec<String>,
  #[serde(rename = "allowedIPs")]
  pub allowed_ips: Vec<String>
}

impl AnonymousHub {
  pub fn to_hub(self, id: Option<Uuid>) -> Hub {
    Hub {
      id: id.unwrap_or(Uuid::new_v4()),
      name: self.name,
      description: self.description,
      public_key: self.public_key,
      endpoint: self.endpoint,
      ip_address: self.ip_address,
      dns_servers: self.dns_servers,
      search_domains: self.search_domains,
      allowed_ips: self.allowed_ips
    }
  }
}