use std::sync::Arc;
use tokio::sync::Mutex;
use crate::persist::{Persist,in_mem::InMemPersist, mongo::MongoPersist};

#[derive(Clone)]
pub struct AppState {
  pub repo: Arc<Mutex<dyn Persist>>
}

impl AppState {
  pub fn new() -> Self {
    AppState { repo: Arc::new(Mutex::new(InMemPersist::new())) }
  }

  pub async fn new_from_mongo(connection_string: String, db_name: String) -> Result<Self, mongodb::error::Error> {
    let mongo = MongoPersist::new(connection_string, db_name).await?;
    Ok(AppState { repo: Arc::new(Mutex::new(mongo)) })
  }
}