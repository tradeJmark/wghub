use axum::{extract::State, response::IntoResponse, routing::get, Json, Router};
use wghub_rust::model::Spoke;

use crate::AppState;

use super::util::to_server_error;

pub fn build_router() -> Router<AppState> {
  Router::new()
    .route("/", get(get_spokes))
}

pub async fn get_spokes(State(state): State<AppState>) -> Result<Json<Vec<Spoke>>, impl IntoResponse> {
  let mut repo = state.repo.lock().await;
  repo.get_all_spokes().await
    .map(Json)
    .map_err(to_server_error)
}