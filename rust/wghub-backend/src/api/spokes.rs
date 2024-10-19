use axum::{extract::{Path, State}, response::IntoResponse, routing::{delete, get, post}, Json, Router};
use http::StatusCode;
use uuid::Uuid;
use wghub_rust::model::Spoke;

use crate::AppState;

use super::util::to_server_error;

pub fn build_router() -> Router<AppState> {
  Router::new()
    .route("/", get(get_spokes_for_hub))
    .route("/upsert", post(upsert_spoke))
    .nest("/:spoke_id", build_per_hub_router())
}

fn build_per_hub_router() -> Router<AppState> {
  Router::new()
    .route("/", delete(delete_spoke))
    .route("/toggle-disabled", post(toggle_spoke_disabled))
}

async fn get_spokes_for_hub(
  State(state): State<AppState>,
  Path(hub_id): Path<Uuid>
) -> Result<Json<Vec<Spoke>>, impl IntoResponse> {
  let mut repo = state.repo.lock().await;
  repo.get_spokes_for_hub(hub_id).await
    .map(Json)
    .map_err(to_server_error)
}

async fn upsert_spoke(
  State(state): State<AppState>,
  Path(hub_id): Path<Uuid>,
  Json(mut spoke): Json<Spoke>
) -> Result<StatusCode, impl IntoResponse> {
  if spoke.is_unbound() {
    spoke.set_hub_id(hub_id);
  }
  let mut repo = state.repo.lock().await;
  repo.upsert_spoke(spoke).await
    .map(|_| StatusCode::NO_CONTENT)
    .map_err(to_server_error)
}

async fn delete_spoke(
  State(state): State<AppState>,
  Path((_, spoke_id)): Path<(Uuid, Uuid)>
) -> Result<StatusCode, impl IntoResponse> {
  let mut repo = state.repo.lock().await;
  repo.delete_spoke(spoke_id).await
    .map(|_| StatusCode::NO_CONTENT)
    .map_err(to_server_error)
}

async fn toggle_spoke_disabled(
  State(state): State<AppState>,
  Path((_, spoke_id)): Path<(Uuid, Uuid)>
) -> Result<StatusCode, impl IntoResponse> {
  let mut repo = state.repo.lock().await;
  repo.toggle_spoke_disabled(spoke_id).await
    .map(|_| StatusCode::NO_CONTENT)
    .map_err(to_server_error)
}