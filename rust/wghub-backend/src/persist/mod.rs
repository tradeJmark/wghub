pub mod mongo;
pub mod in_mem;

use async_trait::async_trait;
use uuid::Uuid;
use wghub_rust::model::{Hub, Spoke};

#[async_trait]
pub trait Persist: Send + Sync {
  async fn get_hubs(&mut self) -> Result<Vec<Hub>, Error>;
  async fn get_spokes_for_hub(&mut self, hub_id: Uuid) -> Result<Vec<Spoke>, Error>;
  async fn upsert_hub(&mut self, hub: Hub) -> Result<Uuid, Error>;
  async fn delete_hub(&mut self, id: Uuid) -> Result<(), Error>;
  async fn upsert_spoke(&mut self, spoke: Spoke) -> Result<Uuid, Error>;
  async fn delete_spoke(&mut self, id: Uuid) -> Result<(), Error>;
  async fn toggle_spoke_disabled(&mut self, id: Uuid) -> Result<(), Error>;
}

#[derive(Debug)]
pub enum Error{
  SourceError(String)
}

impl std::fmt::Display for Error {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
          Self::SourceError(str) => f.write_str(str)
        }
    }
}

impl std::error::Error for Error {}