"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dumbbell, Download, Loader2 } from "lucide-react"

export default function GymInvoiceGenerator() {
  const planOptions = [
    { label: "Monthly", value: "monthly", duration: 1 },
    { label: "Quarterly", value: "quarterly", duration: 3 },
    { label: "Annual", value: "annual", duration: 12 },
  ];

    const [formData, setFormData] = useState({
      memberName: "",
      memberEmail: "",
      planType: "monthly",
      amount: "",
      startDate: "",
      endDate: "",
      additionalPlanDesc: "",
      additionalPlanAmount: "",
      phoneNumber: "",
      discount: "0",
    })
  const [pdfBase64, setPdfBase64] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handlePlanChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedPlan = planOptions.find(p => p.value === e.target.value)
    let newEndDate = formData.startDate
    if (formData.startDate && selectedPlan) {
      const start = new Date(formData.startDate)
      start.setMonth(start.getMonth() + selectedPlan.duration)
      start.setDate(start.getDate() - 1)
      newEndDate = start.toISOString().split("T")[0]
    }
    setFormData({
      ...formData,
      planType: e.target.value,
      endDate: newEndDate,
    })
  }

  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let newEndDate = formData.endDate
    const selectedPlan = planOptions.find(p => p.value === formData.planType)
    if (selectedPlan) {
      const start = new Date(e.target.value)
      start.setMonth(start.getMonth() + selectedPlan.duration)
        start.setDate(start.getDate() - 1)
        newEndDate = start.toISOString().split("T")[0]
    }
    setFormData({ ...formData, startDate: e.target.value, endDate: newEndDate })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setPdfBase64(null)

    try {
      const response = await fetch("/api/invoice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      const data = await response.json()
      if (data.pdf) {
        setPdfBase64(data.pdf)
      }
    } catch (error) {
      console.error("Error generating invoice:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDownload = () => {
    if (!pdfBase64) return

    const link = document.createElement("a")
    link.href = `data:application/pdf;base64,${pdfBase64}`
    link.download = `invoice-${formData.memberName.replace(/\s+/g, "-")}.pdf`
    link.click()
  }

  return (
    <main className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-card/80 backdrop-blur-md border border-border rounded-2xl p-8 shadow-2xl">
        <div className="flex flex-col items-center justify-center gap-3 mb-8">
          <Dumbbell className="h-8 w-8 text-primary" />
          <h1 className="text-2xl font-bold text-foreground">Gym Invoice Generator</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="memberName">Member Name</Label>
            <Input
              id="memberName"
              name="memberName"
              type="text"
              placeholder="John Doe"
              value={formData.memberName}
              onChange={handleChange}
              required
              className="bg-input border-border"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phoneNumber">Phone Number</Label>
            <div className="flex">
              <Input
                type="text"
                value="+91"
                readOnly
                className="w-16 bg-input border-border rounded-r-none"
              />
              <Input
                id="phoneNumber"
                name="phoneNumber"
                type="tel"
                placeholder="XXXXXXXXXX"
                value={formData.phoneNumber}
                onChange={handleChange}
                pattern="^[0-9]{10}$"
                required
                className="bg-input border-border rounded-l-none"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>GST Number</Label>
            <div className="bg-input border-border rounded-md p-2">27AAACB1234C1Z1</div>
          </div>

         

          <div className="space-y-2">
            <Label htmlFor="memberEmail">Member Email</Label>
            <Input
              id="memberEmail"
              name="memberEmail"
              type="email"
              placeholder="john@example.com"
              value={formData.memberEmail}
              onChange={handleChange}
              required
              className="bg-input border-border"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="planType">Plan Type</Label>
            <select
              id="planType"
              name="planType"
              value={formData.planType}
              onChange={handlePlanChange}
              required
              className="bg-input border-border w-full p-2 rounded-md"
            >
              {planOptions.map(plan => (
                <option key={plan.value} value={plan.value}>
                  {plan.label}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Amount (₹)</Label>
            <Input
              id="amount"
              name="amount"
              type="number"
              placeholder="1200"
              value={formData.amount}
              onChange={handleChange}
              required
              min="0"
              step="1"
              className="bg-input border-border"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="additionalPlanDesc">Additional Plan (e.g., PT)</Label>
            <Input
              id="additionalPlanDesc"
              name="additionalPlanDesc"
              type="text"
              placeholder="Personal Training, Diet Plan, etc."
              value={formData.additionalPlanDesc}
              onChange={handleChange}
              className="bg-input border-border"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="additionalPlanAmount">Additional Plan Amount (₹)</Label>
            <Input
              id="additionalPlanAmount"
              name="additionalPlanAmount"
              type="number"
              placeholder="1000"
              value={formData.additionalPlanAmount}
              onChange={handleChange}
              min="0"
              step="1"
              className="bg-input border-border"
            />
          </div>

           <div className="space-y-2">
            <Label htmlFor="discount">Discount (₹)</Label>
            <Input
              id="discount"
              name="discount"
              type="number"
              placeholder="0"
              value={formData.discount}
              onChange={handleChange}
              min="0"
              step="1"
              className="bg-input border-border"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                name="startDate"
                type="date"
                value={formData.startDate}
                onChange={handleStartDateChange}
                required
                className="bg-input border-border"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="endDate">End Date</Label>
              <Input
                id="endDate"
                name="endDate"
                type="date"
                value={formData.endDate}
                readOnly
                required
                className="bg-input border-border"
              />
            </div>
          </div>

          <Button type="submit" className="w-full font-semibold" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              "Generate Invoice"
            )}
          </Button>
        </form>

        {pdfBase64 && (
          <div className="mt-6">
            <Button
              onClick={handleDownload}
              variant="outline"
              className="w-full border-primary text-primary hover:bg-primary hover:text-primary-foreground font-semibold bg-transparent"
            >
              <Download className="mr-2 h-4 w-4" />
              Download Invoice
            </Button>
          </div>
        )}
      </div>
    </main>
  )
}
