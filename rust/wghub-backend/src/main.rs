mod ws_session;
mod persist;

use std::{env, error::Error, sync::Arc};
use axum::{routing::get, Router, extract::{WebSocketUpgrade, ws::WebSocket, State}, response::Response};
use persist::{Persist, mongo::MongoPersist, in_mem::InMemPersist};
use tokio::sync::Mutex;
use ws_session::WsSession;

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
    .route("/ws", get(handle_ws_connection))
    .with_state(state);
  
  axum::Server::bind(&"0.0.0.0:8080".parse().unwrap())
    .serve(app.into_make_service())
    .await
    .unwrap();
  Ok(())
}

async fn handle_ws_connection(wsu: WebSocketUpgrade, State(state): State<AppState>) -> Response {
  wsu.on_upgrade(|socket| handle_socket(socket, state))
}

async fn handle_socket(socket: WebSocket, state: AppState) {
  let mut session = WsSession::new(state, socket);
  session.launch().await;
}