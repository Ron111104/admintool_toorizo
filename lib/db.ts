import { MongoClient } from "mongodb"

let cachedClient = null
let cachedDb = null

export async function dbConnect() {
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb }
  }

  const client = await MongoClient.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })

  const db = client.db() // Uses the default DB specified in the URI
  cachedClient = client
  cachedDb = db

  return { client, db }
}

