use axum::extract::ws::{WebSocket, Message};
use wghub_rust::model::message::{WGHubMessage, ClientMessage, ServerMessage};

use crate::AppState;

pub struct WsSession {
  state: AppState,
  socket: WebSocket
}

impl WsSession {
  pub fn new(state: AppState, socket: WebSocket) -> Self {
    WsSession { state, socket }
  }

  pub async fn launch(&mut self) {
    while let Some(msg) = self.socket.recv().await {
      if let Ok(msg) = msg {
        if let Message::Text(msg) = msg {
          if let Err(e) = self.ws_text_msg(msg).await {
            print_persist_error(e.to_string())
          }
        }
        else if let Message::Binary(msg) = msg {
          self.ws_bin_msg(msg).await;
        }
      }
    }
  }

  async fn ws_text_msg(&mut self, msg: String) -> Result<(), Box<dyn std::error::Error>>{
    let outgoing = if let Ok(msg) = msg.try_into() {
      match msg {
        WGHubMessage::ClientMessage(msg) => match msg {
          ClientMessage::RequestDataMessage => {
            let mut persist = self.state.persist.lock().await;
            let hubs = persist.get_hubs().await?;
            let spokes = persist.get_spokes().await?;
            Some(ServerMessage::DataMessage { hubs, spokes })
          }
          ClientMessage::UpsertHubMessage(hub) => {
            let mut persist = self.state.persist.lock().await;
            persist.upsert_hub(hub).await?;
            None
          },
          ClientMessage::DeleteHubMessage(hub_name) => {
            let mut persist = self.state.persist.lock().await;
            persist.delete_hub(hub_name).await?;
            None
          }
          ClientMessage::UpsertSpokeMessage(spoke) => {
            let mut persist = self.state.persist.lock().await;
            persist.upsert_spoke(spoke).await?;
            None
          }
          ClientMessage::DeleteSpokeMessage(id) => {
            let mut persist = self.state.persist.lock().await;
            persist.delete_spoke(id).await?;
            None
          }
          ClientMessage::ToggleDisableSpokeMessage(id) => {
            let mut persist = self.state.persist.lock().await;
            persist.toggle_spoke_disabled(id).await?;
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
    Ok(())
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

fn print_persist_error(msg: String) {
  eprintln!("Error persisting to storage: {msg}");
}