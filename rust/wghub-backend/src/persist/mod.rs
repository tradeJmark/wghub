pub mod mongo;
pub mod in_mem;

use async_trait::async_trait;
use wghub_rust::model::{Hub, Spoke, SpokeID};

#[async_trait]
pub trait Persist: Send + Sync {
  async fn get_hubs(&mut self) -> Result<Vec<Hub>, Box<dyn std::error::Error>>;
  async fn get_spokes(&mut self) -> Result<Vec<Spoke>, Box<dyn std::error::Error>>;
  async fn upsert_hub(&mut self, hub: Hub) -> Result<(), Box<dyn std::error::Error>>;
  async fn delete_hub(&mut self, name: String) -> Result<(), Box<dyn std::error::Error>>;
  async fn upsert_spoke(&mut self, spoke: Spoke) -> Result<(), Box<dyn std::error::Error>>;
  async fn delete_spoke(&mut self, id: SpokeID) -> Result<(), Box<dyn std::error::Error>>;
  async fn toggle_spoke_disabled(&mut self, id: SpokeID) -> Result<(), Box<dyn std::error::Error>>;
}