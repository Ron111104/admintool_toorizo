import QuotationForm from "@/components/quotation-form"
import { getQuotationById } from "@/lib/quotation-data"
import { notFound } from "next/navigation"

export const dynamic = "force-dynamic"
export const revalidate = 0

export default async function EditQuotationPage({ params }) {
  const quotation = await getQuotationById(params.id)

  if (!quotation) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-10 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white shadow-xl rounded-xl overflow-hidden p-6 sm:p-8">
          <QuotationForm initialData={quotation} isEditing={true} />
        </div>
      </div>
    </div>
  )
}

