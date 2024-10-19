use std::collections::HashMap;
use async_trait::async_trait;
use uuid::Uuid;
use wghub_rust::model::{Hub, Spoke};

use super::Persist;

pub struct InMemPersist {
  hubs: HashMap<Uuid, Hub>,
  spokes: HashMap<Uuid, Spoke>
}

impl InMemPersist {
  pub fn new() -> InMemPersist {
    InMemPersist { hubs: HashMap::default(), spokes: HashMap::default() }
  }
}

#[async_trait]
impl Persist for InMemPersist {
  async fn get_hubs(&mut self) -> Result<Vec<Hub>, super::Error> {
    Ok(self.hubs.values().cloned().collect())
  }
  async fn get_spokes_for_hub(&mut self, hub_id: Uuid) -> Result<Vec<Spoke>, super::Error> {
    let spokes = self.spokes.iter()
      .filter(|(id, _)| **id == hub_id)
      .map(|(_, spoke)| spoke);
    Ok(spokes.cloned().collect())
  }
  async fn get_all_spokes(&mut self) -> Result<Vec<Spoke>, super::Error> {
    Ok(self.spokes.values().cloned().collect())
  }
  async fn upsert_hub(&mut self, hub: Hub) -> Result<Uuid, super::Error> {
    let id = hub.id().clone();
    self.hubs.insert(id.clone(), hub);
    Ok(id)
  }
  async fn delete_hub(&mut self, hub_id: Uuid) -> Result<(), super::Error> {
    self.hubs.remove(&hub_id);
    Ok(())
  }
  async fn upsert_spoke(&mut self, spoke: Spoke) -> Result<Uuid, super::Error> {
    let id = spoke.id.clone();
    self.spokes.insert(id.clone(), spoke);
    Ok(id)
  }
  async fn delete_spoke(&mut self, id: Uuid) -> Result<(), super::Error> {
    self.spokes.remove(&id);
    Ok(())
  }
  async fn toggle_spoke_disabled(&mut self, id: Uuid) -> Result<(), super::Error> {
    let spoke = self.spokes.get_mut(&id);
    if let Some(spoke) = spoke {
      spoke.disabled = !spoke.disabled;
    }
    Ok(())
  }
}