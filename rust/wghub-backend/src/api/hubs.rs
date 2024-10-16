use axum::{extract::{Path, State}, response::IntoResponse, routing::post, Json};
use uuid::Uuid;
use wghub_rust::model::{message::IDMessage, AnonymousHub, AnonymousSpoke, Hub, Spoke};
use axum::{routing::{get, put}, Router};
use crate::AppState;
use super::util::to_server_error;

pub fn build_router() -> Router<AppState> {
  Router::new()
    .route("/", get(get_hubs))
    .route("new", post(create_hub))
    .nest("/:hub_id", build_per_hub_router())
}

fn build_per_hub_router() -> Router<AppState> {
  Router::new()
    .route("/", put(update_hub).delete(delete_hub))
    .route("/spokes", get(get_spokes_for_hub))
    .route("new-spoke", post(create_spoke))
    .route("/:spoke_id", put(update_spoke).delete(delete_spoke))
}

async fn get_hubs(State(state): State<AppState>) -> Result<Json<Vec<Hub>>, impl IntoResponse> {
  let mut repo = state.repo.lock().await;
  repo.get_hubs().await
    .map(Json)
    .map_err(to_server_error)
}

async fn create_hub(
  State(state): State<AppState>,
  Json(anon_hub): Json<AnonymousHub>
) -> Result<Json<IDMessage>, impl IntoResponse> {
  let mut repo = state.repo.lock().await;
  repo.upsert_hub(anon_hub.to_hub(None)).await
    .map(IDMessage::new)
    .map(Json)
    .map_err(to_server_error)
}

async fn update_hub(
  State(state): State<AppState>,
  Path(hub_id): Path<Uuid>,
  Json(anon_hub): Json<AnonymousHub>
) -> Result<Json<IDMessage>, impl IntoResponse> {
  let mut repo = state.repo.lock().await;
  repo.upsert_hub(anon_hub.to_hub(Some(hub_id))).await
    .map(IDMessage::new)
    .map(Json)
    .map_err(to_server_error)
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

async fn delete_hub(
  State(state): State<AppState>,
  Path(hub_id): Path<Uuid>
) -> Result<(), impl IntoResponse> {
  let mut repo = state.repo.lock().await;
  repo.delete_hub(hub_id).await
    .map_err(to_server_error)
}

async fn create_spoke(
  State(state): State<AppState>,
  Path(hub_id): Path<Uuid>,
  Json(anon_spoke): Json<AnonymousSpoke>
) -> Result<Json<IDMessage>, impl IntoResponse> {
  let mut repo = state.repo.lock().await;
  repo.upsert_spoke(anon_spoke.to_spoke(hub_id, None)).await
    .map(IDMessage::new)
    .map(Json)
    .map_err(to_server_error)
}

async fn update_spoke(
  State(state): State<AppState>,
  Path(hub_id): Path<Uuid>,
  Path(spoke_id): Path<Uuid>,
  Json(anon_spoke): Json<AnonymousSpoke>
) -> Result<Json<IDMessage>, impl IntoResponse> {
  let mut repo = state.repo.lock().await;
  repo.upsert_spoke(anon_spoke.to_spoke(hub_id, Some(spoke_id))).await
    .map(IDMessage::new)
    .map(Json)
    .map_err(to_server_error)
}

async fn delete_spoke(
  State(state): State<AppState>,
  Path(spoke_id): Path<Uuid>
) -> Result<(), impl IntoResponse> {
  let mut repo = state.repo.lock().await;
  repo.delete_spoke(spoke_id).await
    .map_err(to_server_error)
}