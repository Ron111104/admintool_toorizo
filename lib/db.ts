import { MongoClient, Db } from "mongodb"

let cachedClient: MongoClient | null = null
let cachedDb: Db | null = null

export async function dbConnect() {
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb }
  }

  const uri = process.env.MONGODB_URI
  if (!uri) {
    throw new Error("Please define the MONGODB_URI environment variable")
  }

  const client = await MongoClient.connect(uri) // ⬅️ no options needed

  const db = client.db() // Uses default DB from URI
  cachedClient = client
  cachedDb = db

  return { client, db }
}
