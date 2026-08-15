import { MongoClient, Db } from "mongodb";

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://Munchotella_db_user:A6dn0m0iBM2Z9v3w@ac-d76ybty-shard-00-00.a7mevdd.mongodb.net:27017,ac-d76ybty-shard-00-01.a7mevdd.mongodb.net:27017,ac-d76ybty-shard-00-02.a7mevdd.mongodb.net:27017/munchotella?ssl=true&authSource=admin&retryWrites=true&w=majority";

let cachedClient: MongoClient | null = null;
let cachedDb: Db | null = null;

export async function connectToDatabase(): Promise<{ client: MongoClient; db: Db }> {
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb };
  }

  const client = new MongoClient(MONGODB_URI);
  await client.connect();
  const db = client.db("munchotella");

  cachedClient = client;
  cachedDb = db;

  return { client, db };
}
