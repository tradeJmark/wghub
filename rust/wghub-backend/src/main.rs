mod ws_session;

use std::{sync::{Arc, Mutex}, collections::HashMap};

use axum::{routing::get, Router, extract::{WebSocketUpgrade, ws::WebSocket, State}, response::Response};
use wghub_rust::model::{Hub, Spoke, SpokeID};
use ws_session::WsSession;

#[derive(Clone)]
pub struct AppState {
  hubs: Arc<Mutex<HashMap<String, Hub>>>,
  spokes: Arc<Mutex<HashMap<SpokeID, Spoke>>>
}

impl AppState {
  fn new() -> AppState {
    AppState { hubs: Arc::new(Mutex::new(HashMap::default())), spokes: Arc::new(Mutex::new(HashMap::default())) }
  }
}

#[tokio::main]
async fn main() {
  let app = Router::new()
    .route("/ws", get(handle_ws_connection))
    .with_state(AppState::new());
  
  axum::Server::bind(&"0.0.0.0:8080".parse().unwrap())
    .serve(app.into_make_service())
    .await
    .unwrap();
}

async fn handle_ws_connection(wsu: WebSocketUpgrade, State(state): State<AppState>) -> Response {
  wsu.on_upgrade(|socket| handle_socket(socket, state))
}

async fn handle_socket(socket: WebSocket, state: AppState) {
  let mut session = WsSession::new(state, socket);
  session.launch().await;
}