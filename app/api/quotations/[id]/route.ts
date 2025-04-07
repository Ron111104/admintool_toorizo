import { NextResponse } from "next/server"
import { dbConnect } from "@/lib/db"
import { ObjectId } from "mongodb"

export async function GET(request, { params }) {
  try {
    const { db } = await dbConnect()
    const { id } = params

    const quotation = await db.collection("quotations").findOne({
      _id: new ObjectId(id),
    })

    if (!quotation) {
      return NextResponse.json({ error: "Quotation not found" }, { status: 404 })
    }

    // Convert _id to string for serialization
    quotation._id = quotation._id.toString()

    return NextResponse.json(quotation)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch quotation" }, { status: 500 })
  }
}

export async function PUT(request, { params }) {
  try {
    const { db } = await dbConnect()
    const { id } = params
    const data = await request.json()

    // Remove _id from update data if present
    const { _id, ...updateData } = data

    const result = await db.collection("quotations").updateOne({ _id: new ObjectId(id) }, { $set: updateData })

    if (result.modifiedCount === 0) {
      return NextResponse.json({ error: "Failed to update quotation" }, { status: 400 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: "Failed to update quotation" }, { status: 500 })
  }
}

export async function DELETE(request, { params }) {
  try {
    const { db } = await dbConnect()
    const { id } = params

    const result = await db.collection("quotations").deleteOne({
      _id: new ObjectId(id),
    })

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "Failed to delete quotation" }, { status: 400 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete quotation" }, { status: 500 })
  }
}

