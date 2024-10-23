use axum::{serve, Router};
use tokio::net::TcpListener;
use wghub_backend::{api, AppState};
use std::{env, error::Error};
use tower_http::services::ServeDir;

#[tokio::main]
async fn main() -> Result<(), Box<dyn Error>> {
  let state = if let Ok(conn_str) = env::var("WGHUB_MONGO_CONNECTION_STRING") {
    let db_name = env::var("WGHUB_MONGO_DATABASE_NAME")?;
    AppState::new_from_mongo(conn_str, db_name).await?
  }
  else {
    AppState::new()
  };

  let frontend = serve_frontend();

  let mut stateless_app = Router::new()
    .nest("/api", api::build_router());
  if let Some(frontend) = frontend {
    stateless_app = stateless_app.nest_service("/", frontend);
  }
  let app = stateless_app.with_state(state);

  let address = get_address();

  let listener = TcpListener::bind(address).await?;
  serve(listener, app)
    .await
    .unwrap();  
  Ok(())
}

fn serve_frontend() -> Option<ServeDir> {
  env::var("WGHUB_FRONTEND_PATH")
      .ok()
      .map(|path| ServeDir::new(path))
}

fn get_address() -> String {
  let ip_address = env::var("WGHUB_IP_ADDRESS").unwrap_or("0.0.0.0".into());
  let port = env::var("WGHUB_PORT").unwrap_or("8080".into());
  format!("{}:{}", ip_address, port)
}