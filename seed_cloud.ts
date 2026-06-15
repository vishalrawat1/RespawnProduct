import { MongoClient } from "mongodb";
import { PRODUCTS } from "./src/lib/mockData.ts";

const uri = "mongodb+srv://admin:admin@cluster0.4oylpn6.mongodb.net/?appName=Cluster0";

async function run() {
  console.log("Connecting to Cloud MongoDB Cluster...");
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db(); 
    const productsCollection = db.collection("products");
    
    console.log("Clearing any existing products...");
    await productsCollection.deleteMany({});
    
    const formattedProducts = PRODUCTS.map((p) => ({
      ...p,
      _id: undefined, // Let MongoDB generate unique ObjectIds
    }));
    
    await productsCollection.insertMany(formattedProducts);
    console.log(`Successfully seeded ${PRODUCTS.length} products to the Cloud MongoDB!`);
  } catch (err) {
    console.error("Error seeding Cloud MongoDB:", err);
  } finally {
    await client.close();
  }
}

run();
