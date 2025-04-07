export interface Quotation {
  _id?: string
  quotationId: string
  createdDate: string
  quotationType: string
  clientName: string
  labelName: string
  transportCost: number
  extraTransportCost: number
  basicCost: number
  comfortCost: number
  premiumCost: number
  contactNumber: string
  tripDetails: {
    adults: number
    children: number
    manual: boolean
  }
  transportDetails: {
    startLocation: string
    endLocation: string
    roomType: string
    vehicle: string
    roomCount: number
    roomFilled: boolean
  }
  bookingDetails: {
    checkinDate: string
    checkoutDate: string
    location: string
    nights: number
    breakfast: boolean
    dinner: boolean
  }
  otherActivities: string[]
  itinerary: string
  terms: string
}

export const emptyQuotation: Quotation = {
  quotationId: "",
  createdDate: new Date().toISOString().split("T")[0],
  quotationType: "Transport only",
  clientName: "",
  labelName: "",
  transportCost: 0,
  extraTransportCost: 0,
  basicCost: 0,
  comfortCost: 0,
  premiumCost: 0,
  contactNumber: "",
  tripDetails: {
    adults: 0,
    children: 0,
    manual: false,
  },
  transportDetails: {
    startLocation: "",
    endLocation: "",
    roomType: "",
    vehicle: "",
    roomCount: 0,
    roomFilled: false,
  },
  bookingDetails: {
    checkinDate: "",
    checkoutDate: "",
    location: "",
    nights: 0,
    breakfast: false,
    dinner: false,
  },
  otherActivities: [],
  itinerary: "",
  terms: "",
}

