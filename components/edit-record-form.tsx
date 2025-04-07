"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { DialogFooter } from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"

export default function EditRecordForm({ record, onSave, onCancel, isNewRecord = false }) {
  const [formData, setFormData] = useState({
    _id: record._id || "",
    name: record.name || "",
    email: record.email || "",
    phone: record.phone || "",
    message: record.message || "",
    customerAttended: record.customerAttended === true,
    createdAt: record.createdAt || "",
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleCheckboxChange = (checked) => {
    setFormData((prev) => ({
      ...prev,
      customerAttended: checked,
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    onSave(formData)
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid gap-4 py-4">
        <div className="grid grid-cols-1 sm:grid-cols-4 items-start sm:items-center gap-2 sm:gap-4">
          <Label htmlFor="name" className="sm:text-right">
            Name
          </Label>
          <div className="sm:col-span-3">
            <Input id="name" name="name" value={formData.name} onChange={handleChange} className="w-full" required />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 items-start sm:items-center gap-2 sm:gap-4">
          <Label htmlFor="email" className="sm:text-right">
            Email
          </Label>
          <div className="sm:col-span-3">
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 items-start sm:items-center gap-2 sm:gap-4">
          <Label htmlFor="phone" className="sm:text-right">
            Phone
          </Label>
          <div className="sm:col-span-3">
            <Input id="phone" name="phone" value={formData.phone} onChange={handleChange} className="w-full" />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 items-start sm:items-center gap-2 sm:gap-4">
          <Label htmlFor="message" className="sm:text-right pt-2">
            Message
          </Label>
          <div className="sm:col-span-3">
            <Textarea
              id="message"
              name="message"
              value={formData.message}
              onChange={handleChange}
              className="w-full"
              rows={3}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 items-start sm:items-center gap-2 sm:gap-4">
          <Label htmlFor="customerAttended" className="sm:text-right">
            Customer Attended
          </Label>
          <div className="sm:col-span-3 flex items-center space-x-2">
            <Checkbox
              id="customerAttended"
              checked={formData.customerAttended}
              onCheckedChange={handleCheckboxChange}
            />
            <Label htmlFor="customerAttended" className="font-normal">
              {formData.customerAttended ? "Attended" : "Not Attended"}
            </Label>
          </div>
        </div>

        {!isNewRecord && (
          <div className="grid grid-cols-1 sm:grid-cols-4 items-start sm:items-center gap-2 sm:gap-4">
            <Label htmlFor="createdAt" className="sm:text-right">
              Date
            </Label>
            <div className="sm:col-span-3">
              <Input
                id="createdAt"
                name="createdAt"
                value={formData.createdAt}
                onChange={handleChange}
                className="w-full"
                disabled
              />
            </div>
          </div>
        )}
      </div>

      <DialogFooter className="flex-col sm:flex-row gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">{isNewRecord ? "Add Record" : "Save Changes"}</Button>
      </DialogFooter>
    </form>
  )
}

