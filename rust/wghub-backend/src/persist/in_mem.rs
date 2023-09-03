use std::collections::HashMap;
use async_trait::async_trait;
use wghub_rust::model::{Hub, Spoke, SpokeID};

use super::Persist;

pub struct InMemPersist {
  hubs: HashMap<String, Hub>,
  spokes: HashMap<SpokeID, Spoke>
}

impl InMemPersist {
  pub fn new() -> InMemPersist {
    InMemPersist { hubs: HashMap::default(), spokes: HashMap::default() }
  }
}

#[async_trait]
impl Persist for InMemPersist {
  async fn get_hubs(&mut self) -> Result<Vec<Hub>, Box<dyn std::error::Error>> {
    Ok(self.hubs.values().cloned().collect())
  }
  async fn get_spokes(&mut self) -> Result<Vec<Spoke>, Box<dyn std::error::Error>> {
    Ok(self.spokes.values().cloned().collect())
  }
  async fn upsert_hub(&mut self, hub: Hub) -> Result<(), Box<dyn std::error::Error>> {
    self.hubs.insert(hub.name.clone(), hub);
    Ok(())
  }
  async fn delete_hub(&mut self, hub_name: String) -> Result<(), Box<dyn std::error::Error>> {
    self.hubs.remove(&hub_name);
    Ok(())
  }
  async fn upsert_spoke(&mut self, spoke: Spoke) -> Result<(), Box<dyn std::error::Error>> {
    self.spokes.insert(spoke.id.clone(), spoke);
    Ok(())
  }
  async fn delete_spoke(&mut self, id: SpokeID) -> Result<(), Box<dyn std::error::Error>> {
    self.spokes.remove(&id);
    Ok(())
  }
  async fn toggle_spoke_disabled(&mut self, id: SpokeID) -> Result<(), Box<dyn std::error::Error>> {
    let spoke = self.spokes.get_mut(&id);
    if let Some(spoke) = spoke {
      spoke.disabled = !spoke.disabled;
    }
    Ok(())
  }
}