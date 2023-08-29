use serde::{Serialize, Deserialize};

#[derive(Serialize, Deserialize)]
pub struct Hub {
  pub name: String,
  pub description: Option<String>,
  pub endpoint: Option<String>,
  pub ip_address: Option<String>,
  pub dns_servers: Vec<String>,
  pub search_domains: Vec<String>,
  pub allowed_ips: Vec<String>
}

impl Hub {
  pub fn new(
    name: String,
    description: Option<String>,
    endpoint: Option<String>,
    ip_address: Option<String>,
    dns_servers: Option<Vec<String>>,
    search_domains: Option<Vec<String>>,
    allowed_ips: Option<Vec<String>>
  ) -> Hub {
    Hub {
      name,
      description,
      endpoint,
      ip_address,
      dns_servers: dns_servers.unwrap_or(Vec::default()),
      search_domains: search_domains.unwrap_or(Vec::default()),
      allowed_ips: allowed_ips.unwrap_or(Vec::default())
    }
  }
  pub fn new_bare(name: String, description: Option<String>) -> Hub {
    Self::new(name, description, None, None, None, None, None)
  }
}