use std::{convert::TryInto, sync::Arc};
use js_sys::JsString;
use wasm_bindgen::prelude::*;
use wasm_bindgen_futures::spawn_local;
use web_sys::{window, console::error_1};
use ws_stream_wasm::{WsMeta, WsStream, WsMessage};
use futures_util::{SinkExt, StreamExt, stream::SplitSink, lock::Mutex};
use wghub_rust::model::{message::{ClientMessage, ServerMessage, WGHubMessage}, SpokeID};

use crate::utils::AllInto;

#[wasm_bindgen(module = "redux")]
extern "C" {
  type AnyAction;
}

#[wasm_bindgen(raw_module = "../../../src/app/store")]
extern "C" {
  pub type StoreType;
  #[wasm_bindgen(method)]
  fn dispatch(this: &StoreType, action: AnyAction);
  #[wasm_bindgen(js_name = "store")]
  static STORE: StoreType;
}

#[wasm_bindgen(raw_module = "../../../src/model/Hub")]
extern "C" {
  pub type Hub;
  #[wasm_bindgen(method, getter)]
  fn name(this: &Hub) -> String;
  #[wasm_bindgen(method, getter)]
  fn description(this: &Hub) -> Option<String>;
  #[wasm_bindgen(method, getter = publicKey)]
  fn public_key(this: &Hub) -> Option<String>;
  #[wasm_bindgen(method, getter)]
  fn endpoint(this: &Hub) -> Option<String>;
  #[wasm_bindgen(method, getter = ipAddress)]
  fn ip_address(this: &Hub) -> Option<String>;
  #[wasm_bindgen(method, getter = dnsServers)]
  fn dns_servers(this: &Hub) -> Vec<JsString>;
  #[wasm_bindgen(method, getter = searchDomains)]
  fn search_domains(this: &Hub) -> Vec<JsString>;
  #[wasm_bindgen(method, getter = allowedIPs)]
  fn allowed_ips(this: &Hub) -> Vec<JsString>;
  #[wasm_bindgen(js_name = "newHub")]
  fn new_hub(name: String, description: Option<String>) -> Hub;
  #[wasm_bindgen(js_name = "createHub")]
  fn create_hub(
    name: String,
    description: Option<String>,
    publicKey: Option<String>,
    endpoint: Option<String>,
    ipAddress: Option<String>,
    dnsServers: Option<Vec<JsString>>,
    searchDomains: Option<Vec<JsString>>,
    allowedIPs: Option<Vec<JsString>>
  ) -> Hub;
}

impl Into<wghub_rust::model::Hub> for Hub {
  fn into(self) -> wghub_rust::model::Hub {
    let dns_servers = Some(self.dns_servers().all_into());
    let search_domains = Some(self.search_domains().all_into());
    let allowed_ips = Some(self.allowed_ips().all_into());
    wghub_rust::model::Hub::new(self.name(), self.description(), self.public_key(), self.endpoint(), self.ip_address(), dns_servers, search_domains, allowed_ips)
  }
}

impl From<wghub_rust::model::Hub> for Hub {
  fn from(value: wghub_rust::model::Hub) -> Self {
    let dns_servers = Some(value.dns_servers.all_into());
    let search_domains = Some(value.search_domains.all_into());
    let allowed_ips = Some(value.allowed_ips.all_into());
    create_hub(
      value.name,
      value.description,
      value.public_key,
      value.endpoint,
      value.ip_address,
      dns_servers,
      search_domains,
      allowed_ips
    )
  }
}

#[wasm_bindgen(raw_module = "../../../src/model/Spoke")]
extern "C" {
  pub type Spoke;
  #[wasm_bindgen(method, getter)]
  fn name(this: &Spoke) -> String;
  #[wasm_bindgen(method, getter)]
  fn hub(this: &Spoke) -> String;
  #[wasm_bindgen(method, getter = ipAddress)]
  fn ip_address(this: &Spoke) -> String;
  #[wasm_bindgen(method, getter = publicKey)]
  fn public_key(this: &Spoke) -> Option<String>;
  #[wasm_bindgen(method, getter)]
  fn disabled(this: &Spoke) -> bool;
  #[wasm_bindgen(js_name = "newSpoke")]
  fn new_spoke(hub: String, name: String, ip_address: String, public_key: Option<String>, disabled: Option<bool>) -> Spoke;
}

impl Into<wghub_rust::model::Spoke> for Spoke {
  fn into(self) -> wghub_rust::model::Spoke {
    wghub_rust::model::Spoke::new(self.hub(), self.name(), self.ip_address(), self.public_key(), Some(self.disabled()))
  }
}

impl From<wghub_rust::model::Spoke> for Spoke {
  fn from(value: wghub_rust::model::Spoke) -> Self {
    new_spoke(value.id.hub_name, value.id.name, value.ip_address, value.public_key, Some(value.disabled))
  }
}

#[wasm_bindgen(raw_module = "../../../src/features/hubs/hubsSlice")]
extern "C" {
  #[wasm_bindgen(js_name = "importHubs")]
  fn import_hubs(hubs: Vec<Hub>) -> AnyAction;
}

#[wasm_bindgen(raw_module = "../../../src/features/spokes/spokesSlice")]
extern "C" {
  #[wasm_bindgen(js_name = "importSpokes")]
  fn import_spokes(hubs: Vec<Spoke>) -> AnyAction;
}

fn get_websocket_url() -> String {
  if cfg!(debug_assertions) {
    env!("WGHUB_DEV_BACKEND").to_string()
  }
  else {
    let location = window().unwrap().location();
    let proto = if location.protocol().unwrap() == "https:" {
      "wss"
    }
    else {
      "ws"
    };
    format!("{proto}://{}/ws", location.host().unwrap())
  }
}

#[wasm_bindgen]
#[derive(Clone)]
pub struct ServerContext {
  ws: Arc<Mutex<SplitSink<WsStream, WsMessage>>>
}

impl ServerContext {
  fn new(tx: SplitSink<WsStream, WsMessage>) -> ServerContext {
    ServerContext { ws: Arc::new(Mutex::new(tx)) }
  }
}

#[wasm_bindgen]
impl ServerContext {
  #[wasm_bindgen(js_name = "upsertHub")]
  pub async fn upsert_hub(&self, hub: Hub) {
    let msg = ClientMessage::UpsertHubMessage(hub.into());
    self.try_send(msg).await;
  }

  #[wasm_bindgen(js_name = "deleteHub")]
  pub async fn delete_hub(&self, hub_name: String) {
    let msg = ClientMessage::DeleteHubMessage(hub_name);
    self.try_send(msg).await;
  }

  #[wasm_bindgen(js_name = "upsertSpoke")]
  pub async fn upsert_spoke(&self, spoke: Spoke) {
    let msg = ClientMessage::UpsertSpokeMessage(spoke.into());
    self.try_send(msg).await;
  }

  #[wasm_bindgen(js_name = "deleteSpoke")]
  pub async fn delete_spoke(&self, hub_name: String, spoke_name: String) {
    let msg = ClientMessage::DeleteSpokeMessage(SpokeID::new(hub_name, spoke_name));
    self.try_send(msg).await;
  }

  #[wasm_bindgen(js_name = "toggleSpokeDisabled")]
  pub async fn toggle_spoke_disabled(&self, hub_name: String, spoke_name: String) {
    let msg = ClientMessage::ToggleDisableSpokeMessage(SpokeID::new(hub_name, spoke_name));
    self.try_send(msg).await;
  }

  #[wasm_bindgen(js_name = "requestData")]
  pub async fn request_data(&self) {
    let msg = ClientMessage::RequestDataMessage;
    self.try_send(msg).await;
  }

  async fn try_send(&self, outgoing: ClientMessage) {
    let mut ws = self.ws.lock().await;
    match outgoing.try_into() {
      Ok(outgoing) => if let Err(e) = ws.send(outgoing).await {
        print_send_error(e.to_string())
      }
      Err(msg) => print_generation_error(msg)
    }
  }

  async fn try_send_error(&self, msg: String) {
    let msg = ClientMessage::ClientError(msg);
    self.try_send(msg).await;
  }
}

fn print_generation_error(msg: String) {
  error_1(&format!("Error generating outgoing message: {msg}").into());
}

fn print_send_error(msg: String) {
  error_1(&format!("Error sending message: {msg}").into());
}

fn print_server_error(msg: String) {
  error_1(&format!("Received error from server: {msg}").into());
}

#[wasm_bindgen(js_name = "startWebSocket")]
pub async fn start_web_socket() -> ServerContext {
  let url = get_websocket_url();
  let (_, ws_stream) = WsMeta::connect(url, None).await.expect_throw("Cannot reach WGHub server.");
  let (tx, mut rx) = ws_stream.split();
  let ctx = ServerContext::new(tx);
  let local_ctx = ctx.clone();
  let read_msgs = async move {
    while let Some(msg) = rx.next().await {
      match msg {
        WsMessage::Text(msg) => {
          if let Ok(msg) = msg.try_into() {
            match msg {
              WGHubMessage::ServerMessage(msg) => match msg {
                ServerMessage::DataMessage{ hubs, spokes } => {
                  let hubs = hubs.into_iter().map(|hub| hub.into()).collect();
                  STORE.dispatch(import_hubs(hubs));
                  let spokes = spokes.into_iter().map(|spoke| spoke.into()).collect();
                  STORE.dispatch(import_spokes(spokes));
                }
                ServerMessage::ServerError(e) => print_server_error(e),
              }
              _ => local_ctx.try_send_error("Did not receive server message.".to_string()).await
            }
          }
          else {
            local_ctx.try_send_error("Could not parse message.".to_string()).await;
          }
        }
        WsMessage::Binary(_) => local_ctx.try_send_error("Cannot accept binary message.".to_string()).await
      }
    }
  };
  spawn_local(read_msgs);
  ctx
} 