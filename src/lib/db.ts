import { MongoClient, Db } from "mongodb";

const uri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/amazon_clone";

let cachedClient: MongoClient | null = null;
let cachedDb: Db | null = null;
let isMockMode = false;

export interface DatabaseConnection {
  client: MongoClient | null;
  db: Db | null;
  isMock: boolean;
}

export async function connectToDatabase(): Promise<DatabaseConnection> {
  // If we already know we are in mock mode, return early
  if (isMockMode) {
    return { client: null, db: null, isMock: true };
  }

  // If we have a cached connection, return it
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb, isMock: false };
  }

  try {
    // Attempt connecting with a short timeout (e.g., 2 seconds) so it doesn't block server routes
    const client = new MongoClient(uri, {
      connectTimeoutMS: 2000,
      serverSelectionTimeoutMS: 2000,
    });

    await client.connect();
    const db = client.db();
    
    cachedClient = client;
    cachedDb = db;
    isMockMode = false;
    
    console.log("Successfully connected to MongoDB");
    return { client, db, isMock: false };
  } catch (error) {
    console.warn("Could not connect to MongoDB, falling back to local MOCK MODE. Error:", error);
    isMockMode = true;
    return { client: null, db: null, isMock: true };
  }
}
