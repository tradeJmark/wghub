mod persist;

use axum::Router;
use persist::{in_mem::InMemPersist, mongo::MongoPersist, Persist};
use std::{env, error::Error, sync::Arc};
use tokio::sync::Mutex;

#[derive(Clone)]
pub struct AppState {
  persist: Arc<Mutex<dyn Persist>>
}

impl AppState {
  fn new() -> Self {
    AppState { persist: Arc::new(Mutex::new(InMemPersist::new())) }
  }

  async fn new_from_mongo(connection_string: String, db_name: String) -> Result<Self, mongodb::error::Error> {
    let mongo = MongoPersist::new(connection_string, db_name).await?;
    Ok(AppState { persist: Arc::new(Mutex::new(mongo)) })
  }
}

#[tokio::main]
async fn main() -> Result<(), Box<dyn Error>> {
  let state = if let Ok(conn_str) = env::var("MONGO_CONNECTION_STRING") {
    let db_name = env::var("MONGO_DATABASE_NAME")?;
    AppState::new_from_mongo(conn_str, db_name).await?
  }
  else {
    AppState::new()
  };
  let app = Router::new()
    .with_state(state);
  
  axum::Server::bind(&"0.0.0.0:8080".parse().unwrap())
    .serve(app.into_make_service())
    .await
    .unwrap();
  Ok(())
}