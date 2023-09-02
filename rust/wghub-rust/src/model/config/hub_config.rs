use super::{SpokeData, HubData};

#[derive(Clone)]
pub struct HubConfig {
  pub name: String,
  pub hub: HubData,
  pub spokes: Vec<SpokeData>
}

impl HubConfig {
  pub fn new(name: String, hub: HubData, spokes: Vec<SpokeData>) -> HubConfig {
    HubConfig { name, hub, spokes }
  }
}