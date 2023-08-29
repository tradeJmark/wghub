#[cfg(feature = "axum")]
use axum::extract::ws::Message;

use serde::{Serialize, Deserialize};
use serde_json::from_str;
use super::{Hub, Spoke};

#[derive(Serialize, Deserialize)]
pub enum ServerMessage {
  HubsMessage { hubs: Vec<Hub> },
  SpokesMessage { spokes: Vec<Spoke> },
  ServerError { message: String }
}

#[derive(Serialize, Deserialize)]
pub enum ClientMessage {
  RequestHubsMessage,
  RequestSpokesMessage
}

#[derive(Serialize, Deserialize)]
pub enum WGHubMessage {
  ServerMessage(ServerMessage),
  ClientMessage(ClientMessage)
}

impl TryInto<String> for WGHubMessage {
  fn try_into(self) -> Result<String, Self::Error> {
    serde_json::to_string(&self).map_err(|err| err.to_string())
  }
  type Error = String;
}

impl TryFrom<String> for WGHubMessage {
  fn try_from(value: String) -> Result<Self, Self::Error> {
    from_str(&value).map_err(|err| err.to_string())
  }
  type Error = String;
}

#[cfg(feature = "axum")]
impl TryFrom<Message> for ClientMessage {
  fn try_from(value: Message) -> Result<Self, Self::Error> {
    if let Message::Text(msg) = value {
      WGHubMessage::try_from(msg).and_then(|msg| {
        if let WGHubMessage::ClientMessage(msg) = msg {
          Ok(msg)
        }
        else {
          Err("Not a client message.".to_string())
        }
      })
    }
    else {
      Err("Not a textual message.".to_string())
    }
  }
  type Error = String;
}

#[cfg(feature = "axum")]
impl TryInto<Message> for ServerMessage {
  fn try_into(self) -> Result<Message, Self::Error> {
    WGHubMessage::ServerMessage(self).try_into().map(|str| Message::Text(str))
  }
  type Error = String;
}