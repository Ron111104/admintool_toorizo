import { dbConnect } from "./db"
import type { Quotation } from "./models/quotation"
import { ObjectId } from "mongodb"
import { cache } from "react"

// Get all quotations
export const getQuotations = cache(async () => {
  const { db } = await dbConnect()

  const timestamp = new Date().getTime()
  console.log(`Fetching quotations at ${timestamp}`)

  let quotations = await db.collection("quotations").find({}).toArray()

  // Convert _id to string for serialization
  quotations = quotations.map((quotation) => {
    quotation._id = quotation._id.toString()
    return quotation
  })

  return quotations as Quotation[]
})

// Get a single quotation by ID
export async function getQuotationById(id: string) {
  const { db } = await dbConnect()

  const quotation = await db.collection("quotations").findOne({
    _id: new ObjectId(id),
  })

  if (!quotation) return null

  quotation._id = quotation._id.toString()

  return quotation as Quotation
}

// Get the next quotation ID
export async function getNextQuotationId() {
  const { db } = await dbConnect()

  const lastQuotation = await db.collection("quotations").find({}).sort({ quotationId: -1 }).limit(1).toArray()

  if (lastQuotation.length === 0) {
    return "36100" // Starting ID
  }

  const lastId = Number.parseInt(lastQuotation[0].quotationId)
  return (lastId + 1).toString()
}

