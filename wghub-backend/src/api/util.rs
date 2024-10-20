use axum::{http::StatusCode, response::IntoResponse};

use crate::persist;

pub fn to_server_error(e: persist::Error) -> impl IntoResponse {
  (StatusCode::INTERNAL_SERVER_ERROR, e.to_string())
}