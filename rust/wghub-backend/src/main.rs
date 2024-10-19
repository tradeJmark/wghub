use axum::{serve, Router};
use tokio::net::TcpListener;
use tower_http::cors::{Any, CorsLayer};
use wghub_backend::{api, AppState};
use std::{env, error::Error};
use http::{header::CONTENT_TYPE, Method};

#[tokio::main]
async fn main() -> Result<(), Box<dyn Error>> {
  let state = if let Ok(conn_str) = env::var("MONGO_CONNECTION_STRING") {
    let db_name = env::var("MONGO_DATABASE_NAME")?;
    AppState::new_from_mongo(conn_str, db_name).await?
  }
  else {
    AppState::new()
  };

  let cors = CorsLayer::new()
   .allow_methods([Method::GET, Method::POST, Method::DELETE])
   .allow_origin(Any)
   .allow_headers([CONTENT_TYPE]);

  let app = Router::new()
    .nest("/api", api::build_router())
    .with_state(state)
    .layer(cors);
  
  let listener = TcpListener::bind(&"0.0.0.0:8080").await?;
  serve(listener, app)
    .await
    .unwrap();  
  Ok(())
}