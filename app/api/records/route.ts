import { NextResponse } from "next/server"
import { dbConnect } from "@/lib/db"

export async function GET() {
  try {
    const { db } = await dbConnect()
    let records = await db.collection("contacts").find({}).toArray()

    // Convert _id and createdAt to string formats for serialization
    records = records.map((record) => {
      record._id = record._id.toString()
      record.createdAt = record.createdAt ? new Date(record.createdAt).toLocaleString() : ""
      return record
    })

    return NextResponse.json({ records })
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch records" }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const { db } = await dbConnect()
    const data = await request.json()

    // Add createdAt timestamp if not present
    if (!data.createdAt) {
      data.createdAt = new Date()
    }

    const result = await db.collection("contacts").insertOne(data)

    return NextResponse.json({
      success: true,
      _id: result.insertedId.toString(),
    })
  } catch (error) {
    return NextResponse.json({ error: "Failed to add record" }, { status: 500 })
  }
}

