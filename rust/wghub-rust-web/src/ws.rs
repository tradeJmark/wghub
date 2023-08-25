use wasm_bindgen::prelude::*;
use wasm_bindgen_futures::spawn_local;
use web_sys::window;
use ws_stream_wasm::{WsMeta, WsMessage};
use futures_util::{SinkExt, StreamExt};

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
  type Hub;
  #[wasm_bindgen(js_name = "newHub")]
  fn create_hub(name: String, description: Option<String>) -> Hub;
}

#[wasm_bindgen(raw_module = "../../../src/features/hubs/hubsSlice")]
extern "C" {
  #[wasm_bindgen(js_name = "newHub")]
  fn add_hub(hub: Hub) -> AnyAction;
}

#[wasm_bindgen(raw_module = "../../../src/App")]
extern "C" {
  #[wasm_bindgen(js_name = "backend")]
  static BACKEND: Option<String>;
}

fn get_websocket_url() -> String {
  BACKEND.clone().unwrap_or_else(|| {
    let location = window().unwrap().location();
    let proto = if location.protocol().unwrap() == "https:" {
      "wss"
    }
    else {
      "ws"
    };
    format!("{proto}://{}/ws", location.host().unwrap())
  }).to_string()
}

#[wasm_bindgen(js_name = "startWebSocket")]
pub fn start_web_socket() {
  let program = async {
    let url = get_websocket_url();
    let (_, mut ws_stream) = WsMeta::connect(url, None).await.expect_throw("Cannot reach WGHub server.");
    ws_stream.send(WsMessage::Text("test".to_string())).await.expect_throw("Failed to contact WGHub server.");
    while let Some(msg) = ws_stream.next().await {
      if let WsMessage::Text(msg) = msg {
        let hub = create_hub(msg, None);
        STORE.dispatch(add_hub(hub));
      }
    }
  };

  spawn_local(program);
} 