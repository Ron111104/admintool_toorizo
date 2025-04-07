"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"
import { type Quotation, emptyQuotation } from "@/lib/models/quotation"
import { addQuotation, updateQuotation } from "@/lib/quotation-actions"
import { generateQuotationPDF } from "@/lib/pdf-generator"
import { Loader2, Save, FileDown, ArrowLeft } from "lucide-react"

interface QuotationFormProps {
  initialData?: Quotation
  isEditing?: boolean
}

export default function QuotationForm({ initialData = emptyQuotation, isEditing = false }: QuotationFormProps) {
  const [formData, setFormData] = useState<Quotation>(initialData)
  const [activeTab, setActiveTab] = useState("contact")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleNestedChange = (section, field, value) => {
    setFormData((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }))
  }

  const handleCheckboxChange = (section, field, checked) => {
    setFormData((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: checked,
      },
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      setIsSubmitting(true)

      if (isEditing) {
        await updateQuotation(formData)
        toast({
          title: "Quotation updated",
          description: "The quotation has been successfully updated",
        })
      } else {
        const result = await addQuotation(formData)
        toast({
          title: "Quotation created",
          description: `New quotation #${result.quotationId} has been created`,
        })
      }

      router.push("/quotations")
    } catch (error) {
      console.error("Failed to save quotation:", error)
      toast({
        title: "Save failed",
        description: "Could not save the quotation",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDownloadPDF = () => {
    try {
      setIsGeneratingPDF(true)
      const success = generateQuotationPDF(formData)

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
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold">{isEditing ? "Edit Quotation" : "New Quotation"}</h2>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/quotations")}
            className="w-full sm:w-auto"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto">
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Quotation
              </>
            )}
          </Button>
          {isEditing && (
            <Button
              type="button"
              variant="outline"
              onClick={handleDownloadPDF}
              disabled={isGeneratingPDF}
              className="w-full sm:w-auto"
            >
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
          )}
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-2 sm:grid-cols-4 w-full sm:w-[600px]">
          <TabsTrigger value="contact">Contact</TabsTrigger>
          <TabsTrigger value="transport">Transport</TabsTrigger>
          <TabsTrigger value="booking">Booking</TabsTrigger>
          <TabsTrigger value="details">Details</TabsTrigger>
        </TabsList>

        <TabsContent value="contact" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Contact Person</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="quotationType">Quotation Type</Label>
                  <RadioGroup
                    value={formData.quotationType}
                    onValueChange={(value) => handleChange({ target: { name: "quotationType", value } })}
                    className="flex flex-wrap gap-4"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="Transport only" id="transport-only" />
                      <Label htmlFor="transport-only">Transport only</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="Rooms only" id="rooms-only" />
                      <Label htmlFor="rooms-only">Rooms only</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="All" id="all" />
                      <Label htmlFor="all">All</Label>
                    </div>
                  </RadioGroup>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="clientName">Client Name</Label>
                  <Input
                    id="clientName"
                    name="clientName"
                    value={formData.clientName}
                    onChange={handleChange}
                    required
                    className="w-full"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contactNumber">Contact Number</Label>
                  <Input
                    id="contactNumber"
                    name="contactNumber"
                    value={formData.contactNumber}
                    onChange={handleChange}
                    required
                    className="w-full"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Trip Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="tripDetails.adults">No of Adults</Label>
                  <Input
                    id="tripDetails.adults"
                    type="number"
                    min="0"
                    value={formData.tripDetails.adults}
                    onChange={(e) => handleNestedChange("tripDetails", "adults", Number.parseInt(e.target.value) || 0)}
                    className="w-full"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tripDetails.children">No of Children</Label>
                  <Input
                    id="tripDetails.children"
                    type="number"
                    min="0"
                    value={formData.tripDetails.children}
                    onChange={(e) =>
                      handleNestedChange("tripDetails", "children", Number.parseInt(e.target.value) || 0)
                    }
                    className="w-full"
                  />
                </div>

                <div className="flex items-center space-x-2 pt-8">
                  <Checkbox
                    id="tripDetails.manual"
                    checked={formData.tripDetails.manual}
                    onCheckedChange={(checked) => handleCheckboxChange("tripDetails", "manual", checked)}
                  />
                  <Label htmlFor="tripDetails.manual">Manual</Label>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transport" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Transportation Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="transportDetails.startLocation">Start Location</Label>
                  <Select
                    value={formData.transportDetails.startLocation}
                    onValueChange={(value) => handleNestedChange("transportDetails", "startLocation", value)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Bangalore">Bangalore</SelectItem>
                      <SelectItem value="Mysore">Mysore</SelectItem>
                      <SelectItem value="Coorg">Coorg</SelectItem>
                      <SelectItem value="Ooty">Ooty</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="transportDetails.endLocation">Return Location</Label>
                  <Select
                    value={formData.transportDetails.endLocation}
                    onValueChange={(value) => handleNestedChange("transportDetails", "endLocation", value)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Bangalore">Bangalore</SelectItem>
                      <SelectItem value="Mysore">Mysore</SelectItem>
                      <SelectItem value="Coorg">Coorg</SelectItem>
                      <SelectItem value="Ooty">Ooty</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="transportDetails.vehicle">Vehicle</Label>
                  <Select
                    value={formData.transportDetails.vehicle}
                    onValueChange={(value) => handleNestedChange("transportDetails", "vehicle", value)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Sedan">Sedan</SelectItem>
                      <SelectItem value="SUV">SUV</SelectItem>
                      <SelectItem value="Tempo Traveller">Tempo Traveller</SelectItem>
                      <SelectItem value="Bus">Bus</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="transportDetails.roomType">Room Type</Label>
                  <Select
                    value={formData.transportDetails.roomType}
                    onValueChange={(value) => handleNestedChange("transportDetails", "roomType", value)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Standard">Standard</SelectItem>
                      <SelectItem value="Deluxe">Deluxe</SelectItem>
                      <SelectItem value="Premium">Premium</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="transportCost">Transport Cost</Label>
                  <Input
                    id="transportCost"
                    name="transportCost"
                    type="number"
                    value={formData.transportCost}
                    onChange={(e) =>
                      handleChange({ target: { name: "transportCost", value: Number.parseInt(e.target.value) || 0 } })
                    }
                    className="w-full"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="extraTransportCost">Extra Transport Cost</Label>
                  <Input
                    id="extraTransportCost"
                    name="extraTransportCost"
                    type="number"
                    value={formData.extraTransportCost}
                    onChange={(e) =>
                      handleChange({
                        target: { name: "extraTransportCost", value: Number.parseInt(e.target.value) || 0 },
                      })
                    }
                    className="w-full"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="transportDetails.roomCount">Room Count</Label>
                  <Input
                    id="transportDetails.roomCount"
                    type="number"
                    min="0"
                    value={formData.transportDetails.roomCount}
                    onChange={(e) =>
                      handleNestedChange("transportDetails", "roomCount", Number.parseInt(e.target.value) || 0)
                    }
                    className="w-full"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="transportDetails.roomFilled"
                  checked={formData.transportDetails.roomFilled}
                  onCheckedChange={(checked) => handleCheckboxChange("transportDetails", "roomFilled", checked)}
                />
                <Label htmlFor="transportDetails.roomFilled">Room Filled</Label>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="booking" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Booking Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="bookingDetails.checkinDate">Check-in Date</Label>
                  <Input
                    id="bookingDetails.checkinDate"
                    type="date"
                    value={formData.bookingDetails.checkinDate}
                    onChange={(e) => handleNestedChange("bookingDetails", "checkinDate", e.target.value)}
                    className="w-full"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bookingDetails.checkoutDate">Check-out Date</Label>
                  <Input
                    id="bookingDetails.checkoutDate"
                    type="date"
                    value={formData.bookingDetails.checkoutDate}
                    onChange={(e) => handleNestedChange("bookingDetails", "checkoutDate", e.target.value)}
                    className="w-full"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="bookingDetails.location">Location</Label>
                  <Select
                    value={formData.bookingDetails.location}
                    onValueChange={(value) => handleNestedChange("bookingDetails", "location", value)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Bangalore">Bangalore</SelectItem>
                      <SelectItem value="Mysore">Mysore</SelectItem>
                      <SelectItem value="Coorg">Coorg</SelectItem>
                      <SelectItem value="Ooty">Ooty</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bookingDetails.nights">Nights</Label>
                  <Select
                    value={formData.bookingDetails.nights?.toString() || "0"}
                    onValueChange={(value) => handleNestedChange("bookingDetails", "nights", Number.parseInt(value))}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 Night/2 Days</SelectItem>
                      <SelectItem value="2">2 Nights/3 Days</SelectItem>
                      <SelectItem value="3">3 Nights/4 Days</SelectItem>
                      <SelectItem value="4">4 Nights/5 Days</SelectItem>
                      <SelectItem value="5">5 Nights/6 Days</SelectItem>
                      <SelectItem value="6">6 Nights/7 Days</SelectItem>
                      <SelectItem value="7">7 Nights/8 Days</SelectItem>
                      <SelectItem value="8">8 Nights/9 Days</SelectItem>
                      <SelectItem value="9">9 Nights/10 Days</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="bookingDetails.breakfast"
                    checked={formData.bookingDetails.breakfast}
                    onCheckedChange={(checked) => handleCheckboxChange("bookingDetails", "breakfast", checked)}
                  />
                  <Label htmlFor="bookingDetails.breakfast">Breakfast</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="bookingDetails.dinner"
                    checked={formData.bookingDetails.dinner}
                    onCheckedChange={(checked) => handleCheckboxChange("bookingDetails", "dinner", checked)}
                  />
                  <Label htmlFor="bookingDetails.dinner">Dinner</Label>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="details" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Pricing Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="basicCost">Basic Cost</Label>
                  <Input
                    id="basicCost"
                    name="basicCost"
                    type="number"
                    value={formData.basicCost}
                    onChange={(e) =>
                      handleChange({ target: { name: "basicCost", value: Number.parseInt(e.target.value) || 0 } })
                    }
                    className="w-full"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="comfortCost">Comfort Cost</Label>
                  <Input
                    id="comfortCost"
                    name="comfortCost"
                    type="number"
                    value={formData.comfortCost}
                    onChange={(e) =>
                      handleChange({ target: { name: "comfortCost", value: Number.parseInt(e.target.value) || 0 } })
                    }
                    className="w-full"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="premiumCost">Premium Cost</Label>
                  <Input
                    id="premiumCost"
                    name="premiumCost"
                    type="number"
                    value={formData.premiumCost}
                    onChange={(e) =>
                      handleChange({ target: { name: "premiumCost", value: Number.parseInt(e.target.value) || 0 } })
                    }
                    className="w-full"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Itinerary</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                id="itinerary"
                name="itinerary"
                value={formData.itinerary}
                onChange={handleChange}
                rows={5}
                placeholder="Enter itinerary details here..."
                className="w-full"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Terms & Conditions</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                id="terms"
                name="terms"
                value={formData.terms}
                onChange={handleChange}
                rows={5}
                placeholder="Enter terms and conditions here..."
                className="w-full"
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex flex-col sm:flex-row justify-end gap-2">
        <Button type="button" variant="outline" onClick={() => router.push("/quotations")} className="w-full sm:w-auto">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto">
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Save Quotation
            </>
          )}
        </Button>
      </div>
    </form>
  )
}

