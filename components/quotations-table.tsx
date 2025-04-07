"use client"

import { useState, useMemo, useEffect } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  ChevronLeft,
  ChevronRight,
  Edit,
  Eye,
  FileDown,
  MoreHorizontal,
  Plus,
  RefreshCw,
  Search,
  Trash,
} from "lucide-react"
import { deleteQuotation } from "@/lib/quotation-actions"
import { Badge } from "@/components/ui/badge"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useToast } from "@/components/ui/use-toast"
import { Skeleton } from "@/components/ui/skeleton"
import type { Quotation } from "@/lib/models/quotation"
import { useRouter } from "next/navigation"
import { generateQuotationPDF } from "@/lib/pdf-generator"
import { Card, CardContent } from "@/components/ui/card"

export default function QuotationsTable({ initialQuotations }) {
  const [quotations, setQuotations] = useState<Quotation[]>(initialQuotations || [])
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [recordsPerPage, setRecordsPerPage] = useState(10)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [quotationToDelete, setQuotationToDelete] = useState<Quotation | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  // Reset to first page when search term changes
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm])

  // Filter quotations based on search term
  const filteredQuotations = useMemo(() => {
    if (!searchTerm.trim()) return quotations

    return quotations.filter((quotation) => {
      return (
        String(quotation.quotationId).toLowerCase().includes(searchTerm.toLowerCase()) ||
        (quotation.clientName || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (quotation.labelName || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (quotation.quotationType || "").toLowerCase().includes(searchTerm.toLowerCase())
      )
    })
  }, [quotations, searchTerm])

  // Pagination
  const indexOfLastRecord = currentPage * recordsPerPage
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage
  const currentRecords = filteredQuotations.slice(indexOfFirstRecord, indexOfLastRecord)
  const totalPages = Math.ceil(filteredQuotations.length / recordsPerPage)

  // Refresh data from server
  const refreshData = async () => {
    try {
      setIsRefreshing(true)
      const response = await fetch("/api/quotations", {
        cache: "no-store",
        headers: {
          "Cache-Control": "no-cache",
        },
      })

      if (!response.ok) {
        throw new Error("Failed to refresh data")
      }

      const data = await response.json()
      setQuotations(data.quotations)
      toast({
        title: "Data refreshed",
        description: `${data.quotations.length} quotations loaded from database`,
      })
    } catch (error) {
      console.error("Error refreshing data:", error)
      toast({
        title: "Refresh failed",
        description: "Could not refresh data from the database",
        variant: "destructive",
      })
    } finally {
      setIsRefreshing(false)
    }
  }

  const handleDeleteQuotation = async () => {
    if (!quotationToDelete) return

    try {
      await deleteQuotation(quotationToDelete._id)

      // Update local state
      setQuotations((prevQuotations) => prevQuotations.filter((quotation) => quotation._id !== quotationToDelete._id))

      setIsDeleteDialogOpen(false)
      setQuotationToDelete(null)

      toast({
        title: "Quotation deleted",
        description: "The quotation has been successfully deleted",
      })
    } catch (error) {
      console.error("Failed to delete quotation:", error)
      toast({
        title: "Delete failed",
        description: "Could not delete the quotation",
        variant: "destructive",
      })
    }
  }

  const handleDownloadPDF = (quotation: Quotation) => {
    try {
      const success = generateQuotationPDF(quotation)

      if (success) {
        toast({
          title: "PDF Generated",
          description: `Quotation ${quotation.quotationId} downloaded as PDF`,
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
    }
  }

  // Render a card view for mobile
  const renderMobileCard = (quotation: Quotation) => (
    <Card key={quotation._id} className="mb-4">
      <CardContent className="pt-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="font-bold text-lg">#{quotation.quotationId}</h3>
            <p className="text-sm text-gray-500">{quotation.createdDate}</p>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => router.push(`/quotations/${quotation._id}`)}>
                <Eye className="h-4 w-4 mr-2" />
                View
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push(`/quotations/${quotation._id}/edit`)}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleDownloadPDF(quotation)}>
                <FileDown className="h-4 w-4 mr-2" />
                Download PDF
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  setQuotationToDelete(quotation)
                  setIsDeleteDialogOpen(true)
                }}
                className="text-red-600"
              >
                <Trash className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="font-medium">Client:</div>
          <div>{quotation.clientName || "N/A"}</div>

          <div className="font-medium">Type:</div>
          <div>{quotation.quotationType || "N/A"}</div>

          <div className="font-medium">Transport:</div>
          <div>{quotation.transportCost || 0}</div>

          <div className="font-medium">Basic:</div>
          <div>{quotation.basicCost || 0}</div>
        </div>

        <div className="mt-4 flex justify-end gap-2">
          <Button variant="outline" size="sm" onClick={() => router.push(`/quotations/${quotation._id}`)}>
            <Eye className="h-4 w-4 mr-2" />
            View
          </Button>
          <Button variant="outline" size="sm" onClick={() => handleDownloadPDF(quotation)}>
            <FileDown className="h-4 w-4 mr-2" />
            PDF
          </Button>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="flex flex-col">
      <div className="p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b">
        <div className="relative w-full sm:w-64 md:w-96">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search quotations..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-end">
          <Button variant="outline" size="sm" onClick={refreshData} disabled={isRefreshing}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
            {isRefreshing ? "Refreshing..." : "Refresh"}
          </Button>

          <Button variant="default" size="sm" onClick={() => router.push("/quotations/new")}>
            <Plus className="h-4 w-4 mr-2" />
            New Quotation
          </Button>
        </div>
      </div>

      <div className="overflow-x-auto">
        {isRefreshing ? (
          <div className="p-8 space-y-4">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        ) : (
          <>
            {/* Mobile view (cards) */}
            <div className="md:hidden p-4">
              {currentRecords.length > 0 ? (
                currentRecords.map((quotation) => renderMobileCard(quotation))
              ) : (
                <div className="text-center py-8 text-gray-500">No quotations found.</div>
              )}
            </div>

            {/* Desktop view (table) */}
            <div className="hidden md:block">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[80px]">ID</TableHead>
                    <TableHead>Created Date</TableHead>
                    <TableHead>Quotation</TableHead>
                    <TableHead>Client Name</TableHead>
                    <TableHead>Label Name</TableHead>
                    <TableHead>Transport</TableHead>
                    <TableHead>Basic</TableHead>
                    <TableHead>Comfort</TableHead>
                    <TableHead>Premium</TableHead>
                    <TableHead className="w-[100px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentRecords.length > 0 ? (
                    currentRecords.map((quotation) => (
                      <TableRow key={quotation._id} className="group">
                        <TableCell className="font-medium">{quotation.quotationId}</TableCell>
                        <TableCell>{quotation.createdDate}</TableCell>
                        <TableCell>{quotation.quotationType || "N/A"}</TableCell>
                        <TableCell>{quotation.clientName || "N/A"}</TableCell>
                        <TableCell>{quotation.labelName || "N/A"}</TableCell>
                        <TableCell>{quotation.transportCost || 0}</TableCell>
                        <TableCell>{quotation.basicCost || 0}</TableCell>
                        <TableCell>{quotation.comfortCost || 0}</TableCell>
                        <TableCell>{quotation.premiumCost || 0}</TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <span className="sr-only">Open menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => router.push(`/quotations/${quotation._id}`)}>
                                <Eye className="h-4 w-4 mr-2" />
                                View
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => router.push(`/quotations/${quotation._id}/edit`)}>
                                <Edit className="h-4 w-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleDownloadPDF(quotation)}>
                                <FileDown className="h-4 w-4 mr-2" />
                                Download PDF
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => {
                                  setQuotationToDelete(quotation)
                                  setIsDeleteDialogOpen(true)
                                }}
                                className="text-red-600"
                              >
                                <Trash className="h-4 w-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={10} className="h-24 text-center">
                        No quotations found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </>
        )}
      </div>

      {/* Pagination */}
      <div className="flex flex-col sm:flex-row items-center justify-between px-4 py-4 border-t gap-4">
        <div className="text-sm text-gray-500 text-center sm:text-left">
          Showing {filteredQuotations.length > 0 ? indexOfFirstRecord + 1 : 0} to{" "}
          {Math.min(indexOfLastRecord, filteredQuotations.length)} of {filteredQuotations.length} quotations
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="sr-only">Previous page</span>
          </Button>

          <Badge variant="outline" className="px-3">
            {currentPage} / {totalPages || 1}
          </Badge>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages || totalPages === 0}
          >
            <ChevronRight className="h-4 w-4" />
            <span className="sr-only">Next page</span>
          </Button>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the quotation and remove the data from the
              server.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteQuotation} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

