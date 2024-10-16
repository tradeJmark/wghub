use axum::{Router, Server};
use wghub_backend::{api, AppState};
use std::{env, error::Error};

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
    .nest("/api", api::build_router())
    .with_state(state);
  
  Server::bind(&"0.0.0.0:8080".parse().unwrap())
    .serve(app.into_make_service())
    .await
    .unwrap();  
  Ok(())
}