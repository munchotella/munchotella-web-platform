import { MongoClient, Db } from "mongodb";

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI && process.env.NODE_ENV === "production") {
  console.error("CRITICAL: MONGODB_URI is not set in environment variables.");
}

let cachedClient: MongoClient | null = null;
let cachedDb: Db | null = null;

export async function connectToDatabase(): Promise<{ client: MongoClient; db: Db }> {
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb };
  }

  if (!MONGODB_URI) {
    throw new Error("Configurare lipsă: MONGODB_URI nu este definit în variabilele de mediu.");
  }

  const client = new MongoClient(MONGODB_URI);
  await client.connect();
  const db = client.db("munchotella");

  cachedClient = client;
  cachedDb = db;

  return { client, db };
}
