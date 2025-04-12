"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { FileDown, Edit, ArrowLeft, Loader2 } from "lucide-react"
import type { Quotation } from "@/lib/models/quotation"
import { generateBasicPDF } from "@/lib/basic-pdf-generator"
import { useToast } from "@/components/ui/use-toast"

export default function ViewQuotation({ quotation }: { quotation: Quotation }) {
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const handleDownloadPDF = () => {
    try {
      setIsGeneratingPDF(true)
      // Use the basic PDF generator that doesn't rely on autoTable
      const success = generateBasicPDF(quotation)

      if (success) {
        toast({
          title: "PDF Generated",
          description: `Quotation downloaded as PDF`,
        })
      } else {
        throw new Error("PDF generation failed")
      }
    } catch (error) {
      console.error("Failed to generate PDF:", error)
      toast({
        title: "PDF Generation Failed",
        description: "Could not generate the PDF file. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsGeneratingPDF(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold">Quotation #{quotation.quotationId}</h1>
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline" className="w-full sm:w-auto">
            <Link href="/quotations">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to List
            </Link>
          </Button>
          <Button asChild className="w-full sm:w-auto">
            <Link href={`/quotations/${quotation._id}/edit`}>
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Link>
          </Button>
          <Button variant="outline" onClick={handleDownloadPDF} disabled={isGeneratingPDF} className="w-full sm:w-auto">
            {isGeneratingPDF ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <FileDown className="h-4 w-4 mr-2" />
                Download PDF
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="bg-gray-50">
            <CardTitle>Contact Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 pt-4">
            <div className="grid grid-cols-2">
              <div className="font-semibold text-gray-700">Client Name:</div>
              <div>{quotation.clientName || "N/A"}</div>
            </div>
            <div className="grid grid-cols-2">
              <div className="font-semibold text-gray-700">Contact Number:</div>
              <div>{quotation.contactNumber || "N/A"}</div>
            </div>
            <div className="grid grid-cols-2">
              <div className="font-semibold text-gray-700">Quotation Type:</div>
              <div>{quotation.quotationType || "N/A"}</div>
            </div>
            <div className="grid grid-cols-2">
              <div className="font-semibold text-gray-700">Created Date:</div>
              <div>{quotation.createdDate || "N/A"}</div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="bg-gray-50">
            <CardTitle>Trip Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 pt-4">
            <div className="grid grid-cols-2">
              <div className="font-semibold text-gray-700">Adults:</div>
              <div>{quotation.tripDetails?.adults || 0}</div>
            </div>
            <div className="grid grid-cols-2">
              <div className="font-semibold text-gray-700">Children:</div>
              <div>{quotation.tripDetails?.children || 0}</div>
            </div>
            <div className="grid grid-cols-2">
              <div className="font-semibold text-gray-700">Manual:</div>
              <div>{quotation.tripDetails?.manual ? "Yes" : "No"}</div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="bg-gray-50">
            <CardTitle>Transport Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 pt-4">
            <div className="grid grid-cols-2">
              <div className="font-semibold text-gray-700">Vehicle:</div>
              <div>{quotation.transportDetails?.vehicle || "N/A"}</div>
            </div>
            <div className="grid grid-cols-2">
              <div className="font-semibold text-gray-700">Start Location:</div>
              <div>{quotation.transportDetails?.startLocation || "N/A"}</div>
            </div>
            <div className="grid grid-cols-2">
              <div className="font-semibold text-gray-700">End Location:</div>
              <div>{quotation.transportDetails?.endLocation || "N/A"}</div>
            </div>
            <div className="grid grid-cols-2">
              <div className="font-semibold text-gray-700">Transport Cost:</div>
              <div>{quotation.transportCost || 0}</div>
            </div>
            <div className="grid grid-cols-2">
              <div className="font-semibold text-gray-700">Extra Transport Cost:</div>
              <div>{quotation.extraTransportCost || 0}</div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="bg-gray-50">
            <CardTitle>Pricing</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 pt-4">
            <div className="grid grid-cols-2">
              <div className="font-semibold text-gray-700">Basic:</div>
              <div>{quotation.basicCost || 0}</div>
            </div>
            <div className="grid grid-cols-2">
              <div className="font-semibold text-gray-700">Comfort:</div>
              <div>{quotation.comfortCost || 0}</div>
            </div>
            <div className="grid grid-cols-2">
              <div className="font-semibold text-gray-700">Premium:</div>
              <div>{quotation.premiumCost || 0}</div>
            </div>
          </CardContent>
        </Card>

        {quotation.bookingDetails?.checkinDate && (
          <Card className="md:col-span-2 shadow-md hover:shadow-lg transition-shadow">
            <CardHeader className="bg-gray-50">
              <CardTitle>Booking Details</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
              <div className="space-y-2">
                <div className="font-semibold text-gray-700">Check-in Date:</div>
                <div>{quotation.bookingDetails.checkinDate}</div>
              </div>
              <div className="space-y-2">
                <div className="font-semibold text-gray-700">Check-out Date:</div>
                <div>{quotation.bookingDetails.checkoutDate || "N/A"}</div>
              </div>
              <div className="space-y-2">
                <div className="font-semibold text-gray-700">Nights:</div>
                <div>
                  {quotation.bookingDetails.nights || 0} Nights/{(quotation.bookingDetails.nights || 0) + 1} Days
                </div>
              </div>
              <div className="space-y-2">
                <div className="font-semibold text-gray-700">Location:</div>
                <div>{quotation.bookingDetails.location || "N/A"}</div>
              </div>
              <div className="space-y-2">
                <div className="font-semibold text-gray-700">Breakfast:</div>
                <div>{quotation.bookingDetails.breakfast ? "Yes" : "No"}</div>
              </div>
              <div className="space-y-2">
                <div className="font-semibold text-gray-700">Dinner:</div>
                <div>{quotation.bookingDetails.dinner ? "Yes" : "No"}</div>
              </div>
            </CardContent>
          </Card>
        )}

        {quotation.itinerary && (
          <Card className="md:col-span-2 shadow-md hover:shadow-lg transition-shadow">
            <CardHeader className="bg-gray-50">
              <CardTitle>Itinerary</CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <p className="whitespace-pre-line">{quotation.itinerary}</p>
            </CardContent>
          </Card>
        )}

        {quotation.terms && (
          <Card className="md:col-span-2 shadow-md hover:shadow-lg transition-shadow">
            <CardHeader className="bg-gray-50">
              <CardTitle>Terms & Conditions</CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <p className="whitespace-pre-line">{quotation.terms}</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
