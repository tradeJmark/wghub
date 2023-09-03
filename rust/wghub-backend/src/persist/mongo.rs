use async_trait::async_trait;
use mongodb::{Database, options::{ClientOptions, ReplaceOptions, UpdateModifications}, Client, bson::{doc, to_bson}};
use wghub_rust::model::{Hub, Spoke, SpokeID};
use futures_util::stream::TryStreamExt;
use super::Persist;

pub struct MongoPersist {
  db: Database
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
  async fn get_hubs(&mut self) -> Result<Vec<Hub>, Box<dyn std::error::Error>> {
    let collection = self.db.collection("hubs");
    let cursor = collection.find(None, None).await?;
    cursor.try_collect().await.map_err(|e| e.into())
  }
  async fn get_spokes(&mut self) -> Result<Vec<Spoke>, Box<dyn std::error::Error>> {
    let collection = self.db.collection("spokes");
    let cursor = collection.find(None, None).await?;
    cursor.try_collect().await.map_err(|e| e.into())
  }
  async fn upsert_hub(&mut self, hub: Hub) -> Result<(), Box<dyn std::error::Error>>{
    let collection = self.db.collection("hubs");
    let query = doc! { "_id": hub.name.clone() };
    let options = ReplaceOptions::builder().upsert(Some(true)).build();
    collection.replace_one(query, hub, options).await.map(|_| ()).map_err(|e| e.into())
  }
  async fn delete_hub(&mut self, name: String) -> Result<(), Box<dyn std::error::Error>> {
    let collection = self.db.collection::<Hub>("hubs");
    let query = doc! { "_id": name };
    collection.delete_one(query, None).await.map(|_| ()).map_err(|e|e.into())
  }
  async fn upsert_spoke(&mut self, spoke: Spoke) -> Result<(), Box<dyn std::error::Error>> {
    let collection = self.db.collection("spokes");
    let query = doc! { "_id": to_bson(&spoke.id).map_err(|e| Box::new(e))? };
    let options = ReplaceOptions::builder().upsert(Some(true)).build();
    collection.replace_one(query, spoke, options).await.map(|_| ()).map_err(|e| e.into())
  }
  async fn delete_spoke(&mut self, id: SpokeID) -> Result<(), Box<dyn std::error::Error>> {
    let collection = self.db.collection::<Spoke>("spokes");
    let query = doc! { "_id": to_bson(&id).map_err(|e| Box::new(e))? };
    collection.delete_one(query, None).await.map(|_| ()).map_err(|e| e.into())
  }
  async fn toggle_spoke_disabled(&mut self, id: SpokeID) -> Result<(), Box<dyn std::error::Error>> {
    let collection = self.db.collection::<Spoke>("spokes");
    let query = doc! { "_id": to_bson(&id).map_err(|e| Box::new(e))? };
    let operations = vec![
      doc! { "$set": {"disabled": {"$not": "$disabled"}} }
    ];
    let update = UpdateModifications::Pipeline(operations);
    collection.update_one(query, update, None).await.map(|_| ()).map_err(|e| e.into())
  }
}