"use server"

import { dbConnect } from "./db"
import { ObjectId } from "mongodb"
import { revalidatePath } from "next/cache"

export async function updateRecord(record) {
  const { db } = await dbConnect()

  // Create a copy of the record without _id for the update operation
  const { _id, ...updateData } = record

  // Update the record in MongoDB
  const result = await db.collection("contacts").updateOne({ _id: new ObjectId(_id) }, { $set: updateData })

  if (result.modifiedCount === 0) {
    throw new Error("Failed to update record")
  }

  // Revalidate the page to ensure fresh data
  revalidatePath("/")

  return { success: true }
}

export async function addRecord(record) {
  const { db } = await dbConnect()

  // Add createdAt timestamp if not present
  if (!record.createdAt) {
    record.createdAt = new Date()
  }

  const result = await db.collection("contacts").insertOne(record)

  if (!result.insertedId) {
    throw new Error("Failed to add record")
  }

  // Revalidate the page to ensure fresh data
  revalidatePath("/")

  return {
    success: true,
    _id: result.insertedId.toString(),
  }
}

export async function deleteRecord(id) {
  const { db } = await dbConnect()

  const result = await db.collection("contacts").deleteOne({
    _id: new ObjectId(id),
  })

  if (result.deletedCount === 0) {
    throw new Error("Failed to delete record")
  }

  // Revalidate the page to ensure fresh data
  revalidatePath("/")

  return { success: true }
}

