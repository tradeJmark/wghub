mod hubs;
pub mod util;
mod spokes;

use axum::Router;
use crate::app_state::AppState;

pub fn build_router() -> Router<AppState> {
  Router::new()
    .nest("/hubs", hubs::build_router())
}