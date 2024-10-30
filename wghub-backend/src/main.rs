use axum::{serve, Router};
use glob_match::glob_match;
use http::header::CONTENT_TYPE;
use std::{env, error::Error};
use tokio::net::TcpListener;
use tower_http::cors::{AllowOrigin, Any, CorsLayer};
use tower_http::services::ServeDir;
use wghub_backend::{api, AppState};

#[tokio::main]
async fn main() -> Result<(), Box<dyn Error>> {
  let state = if let Ok(conn_str) = env::var("WGHUB_MONGO_CONNECTION_STRING") {
    let db_name = env::var("WGHUB_MONGO_DATABASE_NAME")?;
    AppState::new_from_mongo(conn_str, db_name).await?
  }
  else {
    AppState::new()
  };

  let frontend = get_frontend_service();
  let cors = get_cors_layer();

  let mut stateless_app = Router::new()
    .nest("/api", api::build_router());
  if let Some(frontend) = frontend {
    stateless_app = stateless_app.nest_service("/", frontend);
  }
  if let Some(cors) = cors {
    stateless_app = stateless_app.layer(cors);
  }
  let app = stateless_app.with_state(state);

  let address = get_address();

  let listener = TcpListener::bind(address).await?;
  serve(listener, app)
    .await
    .unwrap();  
  Ok(())
}

fn get_frontend_service() -> Option<ServeDir> {
  env::var("WGHUB_FRONTEND_PATH")
      .ok()
      .map(|path| ServeDir::new(path))
}

fn get_cors_layer() -> Option<CorsLayer> {
  let origins = env::var("WGHUB_CORS_ORIGINS").ok()?;

  let mut cors_layer = CorsLayer::new();
  cors_layer = match origins.as_str() {
    "any" => cors_layer.allow_origin(Any),
    list => {
      let origins = list.split(",").map(|o| o.to_owned()).collect::<Vec<_>>();
      cors_layer.allow_origin(AllowOrigin::predicate(move |header, _| {
        let origin = if let Ok(o) = header.to_str() {
          o
        }
        else {
          return false;
        };
        origins.iter().any(|o| glob_match(o, origin))
      }))
    }
  };

  if let Some(methods) = env::var("WGHUB_CORS_METHODS").ok() {
    let parsed_methods = methods.split(",").flat_map(|m| m.parse().ok()).collect::<Vec<_>>();
    cors_layer = cors_layer.allow_methods(parsed_methods);
  }

  cors_layer = cors_layer.allow_headers([CONTENT_TYPE]);

  Some(cors_layer)
}

fn get_address() -> String {
  let ip_address = env::var("WGHUB_IP_ADDRESS").unwrap_or("0.0.0.0".into());
  let port = env::var("WGHUB_PORT").unwrap_or("8080".into());
  format!("{}:{}", ip_address, port)
}