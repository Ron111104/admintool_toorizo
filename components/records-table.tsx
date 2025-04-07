"use client"

import { useState, useMemo, useEffect } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import {
  ChevronLeft,
  ChevronRight,
  Download,
  Edit,
  MoreHorizontal,
  Plus,
  RefreshCw,
  Search,
  SlidersHorizontal,
  Trash,
} from "lucide-react"
import { exportToExcel } from "@/lib/excel-export"
import { updateRecord, deleteRecord, addRecord } from "@/lib/actions"
import EditRecordForm from "./edit-record-form"
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

export default function RecordsTable({ initialRecords }) {
  const [records, setRecords] = useState(initialRecords || [])
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [recordsPerPage, setRecordsPerPage] = useState(10)
  const [editingRecord, setEditingRecord] = useState(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isColumnDialogOpen, setIsColumnDialogOpen] = useState(false)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [availableColumns, setAvailableColumns] = useState([
    { id: "name", label: "Name", visible: true },
    { id: "email", label: "Email", visible: true },
    { id: "phone", label: "Phone", visible: true },
    { id: "message", label: "Message", visible: true },
    { id: "customerAttended", label: "Customer Attended", visible: true },
    { id: "createdAt", label: "Date", visible: true },
  ])

  const [recordToDelete, setRecordToDelete] = useState(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const { toast } = useToast()

  // Reset to first page when search term changes
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm])

  // Filter records based on search term
  const filteredRecords = useMemo(() => {
    if (!searchTerm.trim()) return records

    return records.filter((record) => {
      return Object.values(record).some(
        (value) => value && value.toString().toLowerCase().includes(searchTerm.toLowerCase()),
      )
    })
  }, [records, searchTerm])

  // Pagination
  const indexOfLastRecord = currentPage * recordsPerPage
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage
  const currentRecords = filteredRecords.slice(indexOfFirstRecord, indexOfLastRecord)
  const totalPages = Math.ceil(filteredRecords.length / recordsPerPage)

  // Visible columns
  const visibleColumns = availableColumns.filter((col) => col.visible)

  // Refresh data from server
  const refreshData = async () => {
    try {
      setIsRefreshing(true)
      const response = await fetch("/api/records", {
        cache: "no-store",
        headers: {
          "Cache-Control": "no-cache",
        },
      })

      if (!response.ok) {
        throw new Error("Failed to refresh data")
      }

      const data = await response.json()
      setRecords(data.records)
      toast({
        title: "Data refreshed",
        description: `${data.records.length} records loaded from database`,
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

  // Handle record update
  const handleRecordUpdate = async (updatedRecord) => {
    try {
      await updateRecord(updatedRecord)

      // Update local state
      setRecords((prevRecords) =>
        prevRecords.map((record) => (record._id === updatedRecord._id ? updatedRecord : record)),
      )

      setIsEditDialogOpen(false)
      setEditingRecord(null)

      toast({
        title: "Record updated",
        description: "The record has been successfully updated",
      })
    } catch (error) {
      console.error("Failed to update record:", error)
      toast({
        title: "Update failed",
        description: "Could not update the record",
        variant: "destructive",
      })
    }
  }

  // Handle record creation
  const handleAddRecord = async (newRecord) => {
    try {
      const result = await addRecord(newRecord)

      // Add the new record to local state with the returned ID
      const recordWithId = {
        ...newRecord,
        _id: result._id,
        createdAt: new Date().toLocaleString(),
      }

      setRecords((prevRecords) => [recordWithId, ...prevRecords])
      setIsAddDialogOpen(false)

      toast({
        title: "Record added",
        description: "The new record has been successfully added",
      })
    } catch (error) {
      console.error("Failed to add record:", error)
      toast({
        title: "Add failed",
        description: "Could not add the new record",
        variant: "destructive",
      })
    }
  }

  const handleDeleteRecord = async () => {
    try {
      await deleteRecord(recordToDelete._id)

      // Update local state
      setRecords((prevRecords) => prevRecords.filter((record) => record._id !== recordToDelete._id))

      setIsDeleteDialogOpen(false)
      setRecordToDelete(null)

      toast({
        title: "Record deleted",
        description: "The record has been successfully deleted",
      })
    } catch (error) {
      console.error("Failed to delete record:", error)
      toast({
        title: "Delete failed",
        description: "Could not delete the record",
        variant: "destructive",
      })
    }
  }

  const handleAttendedChange = async (recordId, isAttended) => {
    try {
      const recordToUpdate = records.find((r) => r._id === recordId)
      if (!recordToUpdate) return

      const updatedRecord = {
        ...recordToUpdate,
        customerAttended: isAttended,
      }

      await updateRecord(updatedRecord)

      // Update local state
      setRecords((prevRecords) => prevRecords.map((record) => (record._id === recordId ? updatedRecord : record)))

      toast({
        title: "Status updated",
        description: `Customer marked as ${isAttended ? "attended" : "not attended"}`,
      })
    } catch (error) {
      console.error("Failed to update attendance:", error)
      toast({
        title: "Update failed",
        description: "Could not update attendance status",
        variant: "destructive",
      })
    }
  }

  // Handle column visibility toggle
  const toggleColumnVisibility = (columnId) => {
    setAvailableColumns((prevColumns) =>
      prevColumns.map((col) => (col.id === columnId ? { ...col, visible: !col.visible } : col)),
    )
  }

  // Handle Excel export
  const handleExport = () => {
    try {
      const visibleColumnIds = visibleColumns.map((col) => col.id)
      const dataToExport = filteredRecords.map((record) => {
        const exportRecord = {}
        visibleColumnIds.forEach((colId) => {
          if (colId === "customerAttended") {
            exportRecord[colId] = record[colId] ? "Yes" : "No"
          } else {
            exportRecord[colId] = record[colId]
          }
        })
        return exportRecord
      })

      exportToExcel(dataToExport, visibleColumns, "contact_records")

      toast({
        title: "Export successful",
        description: `${dataToExport.length} records exported to Excel`,
      })
    } catch (error) {
      console.error("Failed to export data:", error)
      toast({
        title: "Export failed",
        description: "Could not export data to Excel",
        variant: "destructive",
      })
    }
  }

  const emptyRecord = {
    name: "",
    email: "",
    phone: "",
    message: "",
    customerAttended: false,
  }

  return (
    <div className="flex flex-col">
      <div className="p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b">
        <div className="relative w-full sm:w-64 md:w-96">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search records..."
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

          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Export Excel
          </Button>

          <Dialog open={isColumnDialogOpen} onOpenChange={setIsColumnDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <SlidersHorizontal className="h-4 w-4 mr-2" />
                Columns
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-sm sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Manage Columns</DialogTitle>
              </DialogHeader>
              <div className="py-4 space-y-4">
                {availableColumns.map((column) => (
                  <div key={column.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`column-${column.id}`}
                      checked={column.visible}
                      onCheckedChange={() => toggleColumnVisibility(column.id)}
                    />
                    <Label htmlFor={`column-${column.id}`}>{column.label}</Label>
                  </div>
                ))}
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsColumnDialogOpen(false)}>
                  Done
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Record
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Add New Record</DialogTitle>
              </DialogHeader>
              <EditRecordForm
                record={emptyRecord}
                onSave={handleAddRecord}
                onCancel={() => setIsAddDialogOpen(false)}
                isNewRecord={true}
              />
            </DialogContent>
          </Dialog>
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
          <Table>
            <TableHeader>
              <TableRow>
                {visibleColumns.map((column) => (
                  <TableHead key={column.id} className="font-semibold">
                    {column.label}
                  </TableHead>
                ))}
                <TableHead className="w-[80px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentRecords.length > 0 ? (
                currentRecords.map((record) => (
                  <TableRow key={record._id}>
                    {visibleColumns.map((column) => (
                      <TableCell key={`${record._id}-${column.id}`}>
                        {column.id === "customerAttended" ? (
                          <Checkbox
                            checked={record[column.id] === true}
                            onCheckedChange={(checked) => handleAttendedChange(record._id, checked)}
                            aria-label={`Mark customer as ${record[column.id] ? "not attended" : "attended"}`}
                          />
                        ) : (
                          record[column.id]
                        )}
                      </TableCell>
                    ))}
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => {
                              setEditingRecord(record)
                              setIsEditDialogOpen(true)
                            }}
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              setRecordToDelete(record)
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
                  <TableCell colSpan={visibleColumns.length + 1} className="h-24 text-center">
                    No records found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </div>

      {/* Pagination */}
      <div className="flex flex-col sm:flex-row items-center justify-between px-4 py-4 border-t gap-4">
        <div className="text-sm text-gray-500 text-center sm:text-left">
          Showing {filteredRecords.length > 0 ? indexOfFirstRecord + 1 : 0} to{" "}
          {Math.min(indexOfLastRecord, filteredRecords.length)} of {filteredRecords.length} records
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

      {/* Edit Record Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Record</DialogTitle>
          </DialogHeader>
          {editingRecord && (
            <EditRecordForm
              record={editingRecord}
              onSave={handleRecordUpdate}
              onCancel={() => setIsEditDialogOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the record and remove the data from the server.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteRecord} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

