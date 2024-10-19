use async_trait::async_trait;
use mongodb::{bson::{doc, from_bson, to_bson}, options::{ClientOptions, UpdateModifications}, Client, Database};
use wghub_rust::model::{Hub, Spoke};
use futures_util::stream::TryStreamExt;
use super::Persist;
use uuid::Uuid;

pub struct MongoPersist {
  db: Database
}

impl From<mongodb::error::Error> for super::Error {
  fn from(value: mongodb::error::Error) -> Self {
    super::Error::SourceError(value.to_string())
  }
}

impl From<mongodb::bson::ser::Error> for super::Error {
  fn from(value: mongodb::bson::ser::Error) -> Self {
    super::Error::SourceError(value.to_string())
  }
}

impl MongoPersist {
  pub async fn new(connection_string: String, db_name: String) -> Result<MongoPersist, mongodb::error::Error> {
    let mut options = ClientOptions::parse(connection_string).await?;
    options.app_name = Some("WGHub".to_string());
    let client = Client::with_options(options);
    let database = client.map(|c| c.database(&db_name));
    database.map(|db| MongoPersist { db })
  }
}

#[async_trait]
impl Persist for MongoPersist {
  async fn get_hubs(&mut self) -> Result<Vec<Hub>, super::Error> {
    let collection = self.db.collection("hubs");
    let cursor = collection.find(doc! {}).await?;
    cursor.try_collect().await.map_err(Into::into)
  }
  async fn get_all_spokes(&mut self) -> Result<Vec<Spoke>, super::Error> {
    let collection = self.db.collection("spokes");
    let cursor = collection.find(doc! {}).await?;
    cursor.try_collect().await.map_err(Into::into)
  }
  async fn get_spokes_for_hub(&mut self, hub_id: Uuid) -> Result<Vec<Spoke>, super::Error> {
    let collection = self.db.collection("spokes");
    let query = doc! { "hub": to_bson(&hub_id)? };
    let cursor = collection.find(query).await?;
    cursor.try_collect().await.map_err(Into::into)
  }
  async fn upsert_hub(&mut self, hub: Hub) -> Result<Uuid, super::Error>{
    let collection = self.db.collection("hubs");
    let query = doc! { "_id": to_bson(&hub.id())? };
    collection.replace_one(query, hub).upsert(true).await
      .map_err(Into::into)
      .and_then(|res| res.upserted_id.ok_or(missing_id_error()))
      .and_then(|id| from_bson(id).map_err(|_| unparseable_id_error()))
  }
  async fn delete_hub(&mut self, id: Uuid) -> Result<(), super::Error> {
    let collection = self.db.collection::<Hub>("hubs");
    let query = doc! { "_id": to_bson(&id)? };
    collection.delete_one(query).await.map(|_| ()).map_err(|e|e.into())
  }
  async fn upsert_spoke(&mut self, spoke: Spoke) -> Result<Uuid, super::Error> {
    let collection = self.db.collection("spokes");
    let query = doc! { "_id": to_bson(&spoke.id)? };
    collection.replace_one(query, spoke).upsert(true).await
      .map_err(Into::into)
      .and_then(|res| res.upserted_id.ok_or(missing_id_error()))
      .and_then(|id| from_bson(id).map_err(|_| unparseable_id_error()))
  }
  async fn delete_spoke(&mut self, id: Uuid) -> Result<(), super::Error> {
    let collection = self.db.collection::<Spoke>("spokes");
    let query = doc! { "_id": to_bson(&id)? };
    collection.delete_one(query).await.map(|_| ()).map_err(Into::into)
  }
  async fn toggle_spoke_disabled(&mut self, id: Uuid) -> Result<(), super::Error> {
    let collection = self.db.collection::<Spoke>("spokes");
    let query = doc! { "_id": to_bson(&id)? };
    let operations = vec![
      doc! { "$set": {"disabled": {"$not": "$disabled"}} }
    ];
    let update = UpdateModifications::Pipeline(operations);
    collection.update_one(query, update).await.map(|_| ()).map_err(Into::into)
  }
}

fn missing_id_error() -> super::Error {
  super::Error::SourceError("The data was updated, but the provider failed to return an ID.".to_owned())
}

fn unparseable_id_error() -> super::Error {
  super::Error::SourceError("The data was updated, but the provider returned an unparseable ID.".to_owned())
}