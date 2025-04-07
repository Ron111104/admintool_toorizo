import { NextResponse } from "next/server"
import { dbConnect } from "@/lib/db"
import { ObjectId } from "mongodb"

export async function GET(request, { params }) {
  try {
    const { db } = await dbConnect()
    const { id } = params

    const record = await db.collection("contacts").findOne({
      _id: new ObjectId(id),
    })

    if (!record) {
      return NextResponse.json({ error: "Record not found" }, { status: 404 })
    }

    // Convert _id and createdAt to string formats for serialization
    record._id = record._id.toString()
    record.createdAt = record.createdAt ? new Date(record.createdAt).toLocaleString() : ""

    return NextResponse.json(record)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch record" }, { status: 500 })
  }
}

export async function PUT(request, { params }) {
  try {
    const { db } = await dbConnect()
    const { id } = params
    const data = await request.json()

    // Remove _id from update data if present
    const { _id, ...updateData } = data

    const result = await db.collection("contacts").updateOne({ _id: new ObjectId(id) }, { $set: updateData })

    if (result.modifiedCount === 0) {
      return NextResponse.json({ error: "Failed to update record" }, { status: 400 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: "Failed to update record" }, { status: 500 })
  }
}

export async function DELETE(request, { params }) {
  try {
    const { db } = await dbConnect()
    const { id } = params

    const result = await db.collection("contacts").deleteOne({
      _id: new ObjectId(id),
    })

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "Failed to delete record" }, { status: 400 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete record" }, { status: 500 })
  }
}

