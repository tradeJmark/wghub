use super::{HubData, SpokeData, SpokeCommonData};

pub struct SpokeConfig {
  pub hub: HubData,
  pub spoke: SpokeData,
  pub common: SpokeCommonData
}

impl SpokeConfig {
  pub fn new(hub: HubData, spoke: SpokeData, common: SpokeCommonData) -> SpokeConfig {
    SpokeConfig { hub, spoke, common }
  }
}