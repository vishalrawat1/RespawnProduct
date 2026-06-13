import { MongoClient, Db } from "mongodb";
import dotenv from "dotenv";
import path from "path";

// Load backend .env file
dotenv.config({ path: path.join(__dirname, "../.env") });

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
  if (isMockMode) {
    return { client: null, db: null, isMock: true };
  }

  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb, isMock: false };
  }

  try {
    const client = new MongoClient(uri, {
      connectTimeoutMS: 2000,
      serverSelectionTimeoutMS: 2000,
    });

    await client.connect();
    const db = client.db();

    cachedClient = client;
    cachedDb = db;
    isMockMode = false;

    console.log("Backend successfully connected to MongoDB at:", uri);
    return { client, db, isMock: false };
  } catch (error) {
    console.warn("Backend database connection failed. Falling back to local MOCK MODE. Error:", error);
    isMockMode = true;
    return { client: null, db: null, isMock: true };
  }
}
