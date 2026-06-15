import { MongoClient } from "mongodb";
import { PRODUCTS } from "./src/lib/mockData";
import { MOCK_RESPAWNED } from "./src/app/api/respawned/route";
import { MOCK_HEALTHCARDS } from "./src/app/api/healthcards/route";

const uri = "mongodb+srv://admin:admin@cluster0.4oylpn6.mongodb.net/?appName=Cluster0";

async function run() {
  console.log("Connecting to Cloud MongoDB Cluster...");
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db(); 
    
    // Seed Products
    const productsCollection = db.collection("products");
    console.log("Clearing any existing products...");
    await productsCollection.deleteMany({});
    const formattedProducts = PRODUCTS.map((p) => ({ ...p, _id: undefined }));
    await productsCollection.insertMany(formattedProducts);
    console.log(`Successfully seeded ${PRODUCTS.length} products to the Cloud MongoDB!`);

    // Seed Respawned Items
    const respawnedCollection = db.collection("respawned");
    console.log("Clearing any existing respawned items...");
    await respawnedCollection.deleteMany({});
    const formattedRespawned = MOCK_RESPAWNED.map((r) => ({ ...r, _id: r.id })); // use fixed ID to avoid duplication
    if (formattedRespawned.length > 0) {
      await respawnedCollection.insertMany(formattedRespawned);
      console.log(`Successfully seeded ${MOCK_RESPAWNED.length} respawned items to the Cloud MongoDB!`);
    }

    // Seed Health Cards
    const healthCardsCollection = db.collection("healthcards");
    console.log("Clearing any existing health cards...");
    await healthCardsCollection.deleteMany({});
    const formattedHealthCards = MOCK_HEALTHCARDS.map((hc) => ({ ...hc, _id: hc.id }));
    if (formattedHealthCards.length > 0) {
      await healthCardsCollection.insertMany(formattedHealthCards);
      console.log(`Successfully seeded ${MOCK_HEALTHCARDS.length} health cards to the Cloud MongoDB!`);
    }

  } catch (err) {
    console.error("Error seeding Cloud MongoDB:", err);
  } finally {
    await client.close();
  }
}

run();
