#[cfg(feature = "axum")]
use axum::extract::ws::Message;

#[cfg(feature = "wasm")]
use ws_stream_wasm::WsMessage;

use serde::{Serialize, Deserialize};
use serde_json::from_str;
use super::{Hub, Spoke, SpokeID};

#[derive(Serialize, Deserialize)]
pub enum ServerMessage {
  DataMessage {hubs: Vec<Hub>, spokes: Vec<Spoke>},
  ServerError(String)
}

#[derive(Serialize, Deserialize)]
pub enum ClientMessage {
  RequestDataMessage,
  UpsertHubMessage(Hub),
  DeleteHubMessage(String),
  UpsertSpokeMessage(Spoke),
  DeleteSpokeMessage(SpokeID),
  ToggleDisableSpokeMessage(SpokeID),
  ClientError(String),
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

#[cfg(feature = "wasm")]
impl TryFrom<WsMessage> for ServerMessage {
  fn try_from(value: WsMessage) -> Result<Self, Self::Error> {
    if let WsMessage::Text(msg) = value {
      WGHubMessage::try_from(msg).and_then(|msg| {
        if let WGHubMessage::ServerMessage(msg) = msg {
          Ok(msg)
        }
        else {
          Err("Not a server message.".to_string())
        }
      })
    }
    else {
      Err("Not a textual message.".to_string())
    }
  }
  type Error = String;
}

#[cfg(feature = "wasm")]
impl TryInto<WsMessage> for ClientMessage {
  fn try_into(self) -> Result<WsMessage, Self::Error> {
    WGHubMessage::ClientMessage(self).try_into().map(|str| WsMessage::Text(str))
  }
  type Error = String;
}