use axum::{serve, Router};
use tokio::net::TcpListener;
use tower_http::cors::{Any, CorsLayer};
use wghub_backend::{api, AppState};
use std::{env, error::Error};
use http::{header::CONTENT_TYPE, Method};
use tower_http::services::ServeDir;

#[tokio::main]
async fn main() -> Result<(), Box<dyn Error>> {
  let state = if let Ok(conn_str) = env::var("MONGO_CONNECTION_STRING") {
    let db_name = env::var("MONGO_DATABASE_NAME")?;
    AppState::new_from_mongo(conn_str, db_name).await?
  }
  else {
    AppState::new()
  };

  let frontend = serve_frontend()?;

  let app = Router::new()
    .nest("/api", api::build_router())
    .nest_service("/", frontend)
    .with_state(state);
  
  let listener = TcpListener::bind(&"0.0.0.0:8080").await?;
  serve(listener, app)
    .await
    .unwrap();  
  Ok(())
}

fn serve_frontend() -> Result<ServeDir, Box<dyn Error>> {
  let frontend_path = env::var("FRONTEND_PATH")?;
  Ok(ServeDir::new(frontend_path))
}