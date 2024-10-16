mod hubs;
mod spokes;
pub mod util;

use axum::Router;
use crate::app_state::AppState;

pub fn build_router() -> Router<AppState> {
  Router::new()
    .nest("/hubs", hubs::build_router())
    .nest("/spokes", spokes::build_router())
}