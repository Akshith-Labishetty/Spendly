import { MongoClient, Db } from "mongodb";

const globalForMongo = globalThis as unknown as {
  client: MongoClient | undefined;
  db: Db | undefined;
};

async function connectDB(): Promise<Db> {
  if (globalForMongo.db) return globalForMongo.db;

  const client = new MongoClient(process.env.DATABASE_URL!);
  await client.connect();
  const db = client.db();

  globalForMongo.client = client;
  globalForMongo.db = db;

  return db;
}

export async function getCollection<T extends Document>(name: string) {
  const db = await connectDB();
  return db.collection<T>(name);
}

export { connectDB };
