use serde::{Deserialize, Serialize};
use uuid::Uuid;

#[derive(Debug, Deserialize, Serialize, Clone)]
pub struct IDMessage {
  id: Uuid
}

impl IDMessage {
  pub fn new(id: Uuid) -> Self {
    IDMessage { id }
  }
}