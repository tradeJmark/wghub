use axum::{extract::{Path, State}, http::StatusCode, response::IntoResponse, routing::{delete, get, post}, Json, Router};
use uuid::Uuid;
use wghub_rust::model::Hub;
use crate::AppState;
use super::util::to_server_error;
use super::spokes;

pub fn build_router() -> Router<AppState> {
  Router::new()
    .route("/", get(get_hubs))
    .route("/upsert", post(upsert_hub))
    .nest("/:hub_id", build_per_hub_router())
}

fn build_per_hub_router() -> Router<AppState> {
  Router::new()
    .route("/", delete(delete_hub))
    .nest("/spokes", spokes::build_router())
}

async fn get_hubs(State(state): State<AppState>) -> Result<Json<Vec<Hub>>, impl IntoResponse> {
  let mut repo = state.repo.lock().await;
  repo.get_hubs().await
    .map(Json)
    .map_err(to_server_error)
}

async fn upsert_hub(
  State(state): State<AppState>,
  Json(hub): Json<Hub>
) -> Result<StatusCode, impl IntoResponse> {
  let mut repo = state.repo.lock().await;
  repo.upsert_hub(hub).await
    .map(|_| StatusCode::NO_CONTENT)
    .map_err(to_server_error)
}

async fn delete_hub(
  State(state): State<AppState>,
  Path(hub_id): Path<Uuid>
) -> Result<StatusCode, impl IntoResponse> {
  let mut repo = state.repo.lock().await;
  repo.delete_hub(hub_id).await
    .map(|_| StatusCode::NO_CONTENT)
    .map_err(to_server_error)
}