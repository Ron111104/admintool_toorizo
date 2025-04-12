"use client"

import { jsPDF } from "jspdf"
import type { Quotation } from "./models/quotation"

export function generateBasicPDF(quotation: Quotation) {
  try {
    // Create new document
    const doc = new jsPDF()

    // Add title
    doc.setFontSize(20)
    doc.text("Transport Quotation", 105, 15, { align: "center" })

    // Add quotation details
    doc.setFontSize(12)
    doc.text(`Quotation ID: ${quotation.quotationId}`, 14, 30)
    doc.text(`Date: ${quotation.createdDate}`, 14, 40)
    doc.text(`Client: ${quotation.clientName}`, 14, 50)
    doc.text(`Contact: ${quotation.contactNumber || "N/A"}`, 14, 60)

    // Add transport details
    doc.setFontSize(16)
    doc.text("Transport Details", 14, 80)

    doc.setFontSize(12)
    doc.text(`Vehicle: ${quotation.transportDetails?.vehicle || "N/A"}`, 14, 90)
    doc.text(`From: ${quotation.transportDetails?.startLocation || "N/A"}`, 14, 100)
    doc.text(`To: ${quotation.transportDetails?.endLocation || "N/A"}`, 14, 110)
    doc.text(`Transport Cost: ${quotation.transportCost || 0}`, 14, 120)
    doc.text(`Extra Transport Cost: ${quotation.extraTransportCost || 0}`, 14, 130)

    // Add pricing details - manually create a simple table
    doc.setFontSize(16)
    doc.text("Pricing Details", 14, 150)

    // Draw table header
    doc.setFillColor(220, 220, 220)
    doc.rect(14, 160, 80, 10, "F")
    doc.rect(94, 160, 80, 10, "F")

    // Draw table header text
    doc.setFontSize(12)
    doc.text("Package", 20, 167)
    doc.text("Price", 100, 167)

    // Draw table rows
    doc.rect(14, 170, 80, 10)
    doc.rect(94, 170, 80, 10)
    doc.text("Basic", 20, 177)
    doc.text(`${quotation.basicCost || 0}`, 100, 177)

    doc.rect(14, 180, 80, 10)
    doc.rect(94, 180, 80, 10)
    doc.text("Comfort", 20, 187)
    doc.text(`${quotation.comfortCost || 0}`, 100, 187)

    doc.rect(14, 190, 80, 10)
    doc.rect(94, 190, 80, 10)
    doc.text("Premium", 20, 197)
    doc.text(`${quotation.premiumCost || 0}`, 100, 197)

    // Add trip details
    doc.setFontSize(16)
    doc.text("Trip Details", 14, 210)

    doc.setFontSize(12)
    doc.text(`Adults: ${quotation.tripDetails?.adults || 0}`, 14, 220)
    doc.text(`Children: ${quotation.tripDetails?.children || 0}`, 14, 230)

    // Add booking details if available
    if (quotation.bookingDetails?.checkinDate) {
      doc.addPage()
      doc.setFontSize(16)
      doc.text("Booking Details", 14, 20)

      doc.setFontSize(12)
      doc.text(`Check-in: ${quotation.bookingDetails.checkinDate}`, 14, 30)
      doc.text(`Check-out: ${quotation.bookingDetails.checkoutDate || "N/A"}`, 14, 40)
      doc.text(`Nights: ${quotation.bookingDetails.nights || 0}`, 14, 50)
      doc.text(`Location: ${quotation.bookingDetails.location || "N/A"}`, 14, 60)
      doc.text(`Breakfast: ${quotation.bookingDetails.breakfast ? "Yes" : "No"}`, 14, 70)
      doc.text(`Dinner: ${quotation.bookingDetails.dinner ? "Yes" : "No"}`, 14, 80)
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

    // Save the PDF with a specific name
    doc.save(`quotation-${quotation.quotationId || "new"}.pdf`)

    return true
  } catch (error) {
    console.error("Error generating PDF:", error)
    return false
  }
}
