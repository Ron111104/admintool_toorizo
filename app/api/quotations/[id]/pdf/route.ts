import { NextResponse } from "next/server"
import { getQuotationById } from "@/lib/quotation-data"
import { jsPDF } from "jspdf"
import "jspdf-autotable"

declare module "jspdf" {
  interface jsPDF {
    autoTable: (options: any) => jsPDF
  }
}

export async function GET(request, { params }) {
  try {
    const quotation = await getQuotationById(params.id)

    if (!quotation) {
      return NextResponse.json({ error: "Quotation not found" }, { status: 404 })
    }

    // Create PDF document
    const doc = new jsPDF()

    // Add title
    doc.setFontSize(20)
    doc.text("Transport Quotation", 105, 15, { align: "center" })

    // Add quotation details
    doc.setFontSize(12)
    doc.text(`Quotation ID: ${quotation.quotationId}`, 14, 30)
    doc.text(`Date: ${quotation.createdDate}`, 14, 40)
    doc.text(`Client: ${quotation.clientName}`, 14, 50)
    doc.text(`Contact: ${quotation.contactNumber}`, 14, 60)

    // Add transport details
    doc.setFontSize(16)
    doc.text("Transport Details", 14, 80)

    doc.setFontSize(12)
    doc.text(`Vehicle: ${quotation.transportDetails.vehicle}`, 14, 90)
    doc.text(`From: ${quotation.transportDetails.startLocation}`, 14, 100)
    doc.text(`To: ${quotation.transportDetails.endLocation}`, 14, 110)
    doc.text(`Transport Cost: ${quotation.transportCost}`, 14, 120)
    doc.text(`Extra Transport Cost: ${quotation.extraTransportCost}`, 14, 130)

    // Add pricing table
    doc.setFontSize(16)
    doc.text("Pricing Details", 14, 150)

    doc.autoTable({
      startY: 160,
      head: [["Package", "Price"]],
      body: [
        ["Basic", quotation.basicCost.toString()],
        ["Comfort", quotation.comfortCost.toString()],
        ["Premium", quotation.premiumCost.toString()],
      ],
    })

    // Add trip details
    const tableEndY = (doc as any).lastAutoTable.finalY + 10

    doc.setFontSize(16)
    doc.text("Trip Details", 14, tableEndY)

    doc.setFontSize(12)
    doc.text(`Adults: ${quotation.tripDetails.adults}`, 14, tableEndY + 10)
    doc.text(`Children: ${quotation.tripDetails.children}`, 14, tableEndY + 20)

    // Add booking details if available
    if (quotation.bookingDetails.checkinDate) {
      doc.setFontSize(16)
      doc.text("Booking Details", 14, tableEndY + 40)

      doc.setFontSize(12)
      doc.text(`Check-in: ${quotation.bookingDetails.checkinDate}`, 14, tableEndY + 50)
      doc.text(`Check-out: ${quotation.bookingDetails.checkoutDate}`, 14, tableEndY + 60)
      doc.text(`Nights: ${quotation.bookingDetails.nights}`, 14, tableEndY + 70)
      doc.text(`Location: ${quotation.bookingDetails.location}`, 14, tableEndY + 80)
    }

    // Add itinerary if available
    if (quotation.itinerary) {
      doc.addPage()
      doc.setFontSize(16)
      doc.text("Itinerary", 14, 20)

      doc.setFontSize(12)
      const itineraryLines = doc.splitTextToSize(quotation.itinerary, 180)
      doc.text(itineraryLines, 14, 30)
    }

    // Add terms if available
    if (quotation.terms) {
      doc.addPage()
      doc.setFontSize(16)
      doc.text("Terms & Conditions", 14, 20)

      doc.setFontSize(12)
      const termsLines = doc.splitTextToSize(quotation.terms, 180)
      doc.text(termsLines, 14, 30)
    }

    // Convert PDF to buffer
    const pdfBuffer = Buffer.from(doc.output("arraybuffer"))

    // Return PDF as response
    return new Response(pdfBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="quotation-${quotation.quotationId}.pdf"`,
      },
    })
  } catch (error) {
    console.error("Error generating PDF:", error)
    return NextResponse.json({ error: "Failed to generate PDF" }, { status: 500 })
  }
}

