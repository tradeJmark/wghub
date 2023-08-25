use axum::{routing::get, Router, extract::{WebSocketUpgrade, ws::{WebSocket, Message}}, response::Response};

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
    let msg = if let Ok(msg) = msg {
      if let Message::Text(msg) = msg {
        msg
      }
      else {
        "not text".to_string()
      }
    }
    else {
      "not ok".to_string()
    };

    if socket.send(Message::Text(msg)).await.is_err() {
      return;
    }
  }
}