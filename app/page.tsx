import RecordsTable from "@/components/records-table"
import { getRecords } from "@/lib/data"

// This ensures the page is not cached and data is fetched fresh each time
export const dynamic = "force-dynamic"
export const revalidate = 0

export default async function Home() {
  const records = await getRecords()

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-10 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white shadow-xl rounded-xl overflow-hidden">
          <div className="p-6 sm:p-8 border-b border-gray-200 bg-white">
            <h1 className="text-3xl font-bold text-gray-900">Admin Tool</h1>
            <p className="mt-2 text-gray-600">Manage and explore your contact database</p>
          </div>

          <RecordsTable initialRecords={records} />
        </div>
      </div>
    </div>
  )
}

