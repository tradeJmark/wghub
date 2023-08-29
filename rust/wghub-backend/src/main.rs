use axum::{routing::get, Router, extract::{WebSocketUpgrade, ws::{WebSocket, Message}}, response::Response};
use wghub_rust::model::message::{WGHubMessage, ClientMessage, ServerMessage};

#[tokio::main]
async fn main() {
  let app = Router::new().route("/ws", get(handle_ws_connection));
  
  axum::Server::bind(&"0.0.0.0:8080".parse().unwrap())
    .serve(app.into_make_service())
    .await
    .unwrap();
}

async fn handle_ws_connection(wsu: WebSocketUpgrade) -> Response {
  wsu.on_upgrade(handle_socket)
}

async fn handle_socket(mut socket: WebSocket) {
  while let Some(msg) = socket.recv().await {
    if let Ok(msg) = msg {
      if let Message::Text(msg) = msg {
        ws_text_msg(msg, &mut socket).await;
      }
      else if let Message::Binary(msg) = msg {
        ws_bin_msg(msg, &mut socket).await;
      }
    }
  }
}

async fn ws_text_msg(msg: String, socket: &mut WebSocket) {
  let incoming = WGHubMessage::try_from(msg);
  let outgoing = if let Ok(msg) = incoming {
    match msg {
      WGHubMessage::ClientMessage(msg) => match msg {
        ClientMessage::RequestHubsMessage => ServerMessage::HubsMessage { hubs: Vec::default() },
        ClientMessage::RequestSpokesMessage => ServerMessage::SpokesMessage { spokes: Vec::default() }
      }
      _ => ServerMessage::ServerError { message: "Did not receive client message.".to_string() }
    }
  }
  else {
    ServerMessage::ServerError { message: "Could not parse message.".to_string() }
  };
  try_send(outgoing, socket).await;
}

async fn ws_bin_msg(_: Vec<u8>, socket: &mut WebSocket) {
  let message = ServerMessage::ServerError { message: "Binary messages not supported.".to_string() };
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