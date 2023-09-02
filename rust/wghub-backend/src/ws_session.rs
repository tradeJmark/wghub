use axum::extract::ws::{WebSocket, Message};
use wghub_rust::model::message::{WGHubMessage, ClientMessage, ServerMessage};

use crate::AppState;

pub struct WsSession {
  state: AppState,
  socket: WebSocket
}

impl WsSession {
  pub fn new(state: AppState, socket: WebSocket) -> WsSession {
    WsSession { state, socket }
  }

  pub async fn launch(&mut self) {
    while let Some(msg) = self.socket.recv().await {
      if let Ok(msg) = msg {
        if let Message::Text(msg) = msg {
          self.ws_text_msg(msg).await;
        }
        else if let Message::Binary(msg) = msg {
          self.ws_bin_msg(msg).await;
        }
      }
    }
  }

  async fn ws_text_msg(&mut self, msg: String) {
    let outgoing = if let Ok(msg) = msg.try_into() {
      match msg {
        WGHubMessage::ClientMessage(msg) => match msg {
          ClientMessage::RequestDataMessage => {
            let hubs = self.state.hubs.lock().unwrap();
            let spokes = self.state.spokes.lock().unwrap();
            Some(ServerMessage::DataMessage {
              hubs: hubs.values().cloned().collect(),
              spokes: spokes.values().cloned().collect()
            })
          }
          ClientMessage::UpsertHubMessage(hub) => {
            let mut hubs = self.state.hubs.lock().unwrap();
            hubs.insert(hub.name.clone(), hub);
            None
          },
          ClientMessage::DeleteHubMessage(hub_name) => {
            let mut hubs = self.state.hubs.lock().unwrap();
            hubs.remove(&hub_name);
            None
          }
          ClientMessage::UpsertSpokeMessage(spoke) => {
            let mut spokes = self.state.spokes.lock().unwrap();
            spokes.insert(spoke.id.clone(), spoke);
            None
          }
          ClientMessage::DeleteSpokeMessage(id) => {
            let mut spokes = self.state.spokes.lock().unwrap();
            spokes.remove(&id);
            None
          }
          ClientMessage::ToggleDisableSpokeMessage(id) => {
            let mut spokes = self.state.spokes.lock().unwrap();
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
      self.try_send(outgoing).await;
    }
  }
  
  async fn ws_bin_msg(&mut self, _: Vec<u8>) {
    let message = ServerMessage::ServerError("Binary messages not supported.".to_string());
    self.try_send(message).await;
  }
  
  async fn try_send(&mut self, outgoing: ServerMessage) {
    match outgoing.try_into() {
      Ok(outgoing) => if let Err(e) = self.socket.send(outgoing).await {
        print_send_error(e.to_string())
      }
      Err(msg) => print_generation_error(msg)
    }
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