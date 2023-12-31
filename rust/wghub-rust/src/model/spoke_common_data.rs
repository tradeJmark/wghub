pub struct SpokeCommonData {
  pub dns_servers: Vec<String>,
  pub search_domains: Vec<String>,
  pub allowed_ips: Vec<String>
}

impl SpokeCommonData {
  pub fn new(dns_servers: Vec<String>, search_domains: Vec<String>, allowed_ips: Vec<String>) -> SpokeCommonData {
    SpokeCommonData {dns_servers, search_domains, allowed_ips}
  }
}