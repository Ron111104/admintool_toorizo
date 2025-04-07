import { NextResponse } from "next/server"
import { dbConnect } from "@/lib/db"

export async function GET() {
  try {
    const { db } = await dbConnect()
    let quotations = await db.collection("quotations").find({}).toArray()

    // Convert _id to string for serialization
    quotations = quotations.map((quotation) => {
      quotation._id = quotation._id.toString()
      return quotation
    })

    return NextResponse.json({ quotations })
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch quotations" }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const { db } = await dbConnect()
    const data = await request.json()

    const result = await db.collection("quotations").insertOne(data)

    return NextResponse.json({
      success: true,
      _id: result.insertedId.toString(),
    })
  } catch (error) {
    return NextResponse.json({ error: "Failed to add quotation" }, { status: 500 })
  }
}

