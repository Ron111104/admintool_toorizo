"use server"

import { dbConnect } from "./db"
import type { Quotation } from "./models/quotation"
import { ObjectId } from "mongodb"
import { revalidatePath } from "next/cache"
import { getNextQuotationId } from "./quotation-data"

// Add a new quotation
export async function addQuotation(quotation: Omit<Quotation, "_id" | "quotationId">) {
  const { db } = await dbConnect()

  // Get the next quotation ID
  const quotationId = await getNextQuotationId()

  const newQuotation = {
    ...quotation,
    quotationId,
    createdDate: quotation.createdDate || new Date().toISOString().split("T")[0],
  }

  const result = await db.collection("quotations").insertOne(newQuotation)

  if (!result.insertedId) {
    throw new Error("Failed to add quotation")
  }

  revalidatePath("/quotations")

  return {
    success: true,
    _id: result.insertedId.toString(),
    quotationId,
  }
}

// Update an existing quotation
export async function updateQuotation(quotation: Quotation) {
  const { db } = await dbConnect()

  const { _id, ...updateData } = quotation

  const result = await db.collection("quotations").updateOne({ _id: new ObjectId(_id) }, { $set: updateData })

  if (result.modifiedCount === 0) {
    throw new Error("Failed to update quotation")
  }

  revalidatePath("/quotations")

  return { success: true }
}

// Delete a quotation
export async function deleteQuotation(id: string) {
  const { db } = await dbConnect()

  const result = await db.collection("quotations").deleteOne({
    _id: new ObjectId(id),
  })

  if (result.deletedCount === 0) {
    throw new Error("Failed to delete quotation")
  }

  revalidatePath("/quotations")

  return { success: true }
}

