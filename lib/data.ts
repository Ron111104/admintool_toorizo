import { dbConnect } from "./db"
import { cache } from "react"

// Using cache() with a unique argument ensures fresh data each time
export const getRecords = cache(async () => {
  const { db } = await dbConnect()

  // Add timestamp to ensure we're not getting cached results
  const timestamp = new Date().getTime()
  console.log(`Fetching records at ${timestamp}`)

  let records = await db.collection("contacts").find({}).toArray()

  // Convert _id and createdAt to string formats for serialization
  records = records.map((record) => {
    record._id = record._id.toString()
    record.createdAt = record.createdAt ? new Date(record.createdAt).toLocaleString() : ""
    // Ensure customerAttended is a boolean
    record.customerAttended = record.customerAttended === true
    return record
  })

  return records
})

