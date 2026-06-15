const { MongoClient } = require("mongodb");

const uri = "mongodb+srv://admin:admin@cluster0.4oylpn6.mongodb.net/?appName=Cluster0";

async function check() {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db("test"); // Using 'test' which is default for some Next.js unless specified in URI
    const countTest = await db.collection("products").countDocuments();
    
    const dbAmazon = client.db("amazon_clone");
    const countAmazon = await dbAmazon.collection("products").countDocuments();

    console.log(`Cloud DB 'test' products count: ${countTest}`);
    console.log(`Cloud DB 'amazon_clone' products count: ${countAmazon}`);
  } catch (err) {
    console.error("Error connecting to cloud DB:", err);
  } finally {
    await client.close();
  }
}

check();
