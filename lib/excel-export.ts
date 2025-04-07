"use client"

import * as XLSX from "xlsx"

export function exportToExcel(data, columns, filename) {
  // Create a worksheet
  const worksheet = XLSX.utils.json_to_sheet(
    data.map((record) => {
      const exportRecord = {}
      columns.forEach((col) => {
        if (col.visible) {
          exportRecord[col.label] = record[col.id]
        }
      })
      return exportRecord
    }),
  )

  // Create a workbook
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, "Records")

  // Generate Excel file and trigger download
  XLSX.writeFile(workbook, `${filename}.xlsx`)
}

