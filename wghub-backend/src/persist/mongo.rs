use super::Persist;
use async_trait::async_trait;
use futures_util::stream::TryStreamExt;
use mongodb::bson::serde_helpers::serialize_uuid_1_as_binary;
use mongodb::bson::{to_document, Bson, Serializer};
use mongodb::{bson::doc, options::{ClientOptions, UpdateModifications}, Client, Database};
use uuid::Uuid;
use wghub_shared::model::{Hub, Spoke};

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
  async fn get_spokes_for_hub(&mut self, hub_id: Uuid) -> Result<Vec<Spoke>, super::Error> {
    let collection = self.db.collection("spokes");
    let hub_id_bson = uuid_to_bson(hub_id)?;
    let query = doc! { "hub_id": hub_id_bson };
    let cursor = collection.find(query).await?;
    cursor.try_collect().await.map_err(Into::into)
  }
  async fn upsert_hub(&mut self, hub: Hub) -> Result<Uuid, super::Error>{
    let collection = self.db.collection("hubs");
    let mut hub_upsert = to_document(&hub)?;
    let id = hub_upsert.remove("_id").unwrap()  ;
    let query = doc! { "_id": id };
    collection.replace_one(query, hub_upsert).upsert(true).await
        .map(|_| hub.id())
      .map_err(Into::into)
  }
  async fn delete_hub(&mut self, id: Uuid) -> Result<(), super::Error> {
    let collection = self.db.collection::<Hub>("hubs");
    let id_bson = uuid_to_bson(id)?;
    let query = doc! { "_id": id_bson };
    collection.delete_one(query).await.map(|_| ()).map_err(Into::into)
  }
  async fn upsert_spoke(&mut self, spoke: Spoke) -> Result<Uuid, super::Error> {
    let collection = self.db.collection("spokes");
    let mut spoke_upsert = to_document(&spoke)?;
    let id = spoke_upsert.remove("_id").unwrap();
    let query = doc! { "_id": id };
    collection.replace_one(query, spoke_upsert).upsert(true).await
        .map(|_| spoke.id())
      .map_err(Into::into)
  }
  async fn delete_spoke(&mut self, id: Uuid) -> Result<(), super::Error> {
    let collection = self.db.collection::<Spoke>("spokes");
    let id_bson = uuid_to_bson(id)?;
    let query = doc! { "_id": id_bson };
    collection.delete_one(query).await.map(|_| ()).map_err(Into::into)
  }
  async fn toggle_spoke_disabled(&mut self, id: Uuid) -> Result<(), super::Error> {
    let collection = self.db.collection::<Spoke>("spokes");
    let id_bson = uuid_to_bson(id)?;
    let query = doc! { "_id": id_bson };
    let operations = vec![
      doc! { "$set": {"disabled": {"$not": "$disabled"}} }
    ];
    let update = UpdateModifications::Pipeline(operations);
    collection.update_one(query, update).await.map(|_| ()).map_err(Into::into)
  }
}

fn uuid_to_bson(id: Uuid) -> Result<Bson, mongodb::bson::ser::Error> {
  let ser = Serializer::new();
  serialize_uuid_1_as_binary(&id, ser)
}