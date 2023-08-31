use std::{sync::{Arc, Mutex}, collections::HashMap};

use axum::{routing::get, Router, extract::{WebSocketUpgrade, ws::{WebSocket, Message}, State}, response::Response};
use wghub_rust::model::{message::{WGHubMessage, ClientMessage, ServerMessage}, Hub, Spoke, SpokeID};

#[derive(Clone)]
struct AppState {
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

async fn handle_socket(mut socket: WebSocket, state: AppState) {
  while let Some(msg) = socket.recv().await {
    if let Ok(msg) = msg {
      if let Message::Text(msg) = msg {
        ws_text_msg(msg, &mut socket, state.clone()).await;
      }
      else if let Message::Binary(msg) = msg {
        ws_bin_msg(msg, &mut socket).await;
      }
    }
  }
}

async fn ws_text_msg(msg: String, socket: &mut WebSocket, state: AppState) {
  let outgoing = if let Ok(msg) = msg.try_into() {
    match msg {
      WGHubMessage::ClientMessage(msg) => match msg {
        ClientMessage::RequestDataMessage => {
          let hubs = state.hubs.lock().unwrap();
          let spokes = state.spokes.lock().unwrap();
          Some(ServerMessage::DataMessage {
            hubs: hubs.values().cloned().collect(),
            spokes: spokes.values().cloned().collect()
          })
        }
        ClientMessage::UpsertHubMessage(hub) => {
          let mut hubs = state.hubs.lock().unwrap();
          hubs.insert(hub.name.clone(), hub);
          None
        },
        ClientMessage::DeleteHubMessage(hub_name) => {
          let mut hubs = state.hubs.lock().unwrap();
          hubs.remove(&hub_name);
          None
        }
        ClientMessage::UpsertSpokeMessage(spoke) => {
          let mut spokes = state.spokes.lock().unwrap();
          spokes.insert(spoke.id.clone(), spoke);
          None
        }
        ClientMessage::DeleteSpokeMessage(id) => {
          let mut spokes = state.spokes.lock().unwrap();
          spokes.remove(&id);
          None
        }
        ClientMessage::ToggleDisableSpokeMessage(id) => {
          let mut spokes = state.spokes.lock().unwrap();
          if let Some(spoke) = spokes.get_mut(&id) {
            spoke.disabled = !spoke.disabled;
          }
          None
        }
        ClientMessage::ClientError(e) => {
          print_client_error(e);
          None
        }
      }
      _ => Some(ServerMessage::ServerError("Did not receive client message.".to_string()))
    }
  }
  else {
    Some(ServerMessage::ServerError("Could not parse message.".to_string()))
  };
  if let Some(outgoing) = outgoing {
    try_send(outgoing, socket).await;
  }
}

async fn ws_bin_msg(_: Vec<u8>, socket: &mut WebSocket) {
  let message = ServerMessage::ServerError("Binary messages not supported.".to_string());
  try_send(message, socket).await;
}

async fn try_send(outgoing: ServerMessage, socket: &mut WebSocket) {
  match outgoing.try_into() {
    Ok(outgoing) => if let Err(e) = socket.send(outgoing).await {
      print_send_error(e.to_string())
    }
    Err(msg) => print_generation_error(msg)
  }
}

fn print_generation_error(msg: String) {
  eprintln!("Error generating outgoing message: {msg}");
}

fn print_send_error(msg: String) {
  eprintln!("Error sending message: {msg}");
}

fn print_client_error(msg: String) {
  eprintln!("Client reported error: {msg}");
}