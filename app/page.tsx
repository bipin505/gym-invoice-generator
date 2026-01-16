"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dumbbell, Download, Loader2 } from "lucide-react"

export default function GymInvoiceGenerator() {
  const [formData, setFormData] = useState({
    memberName: "",
    memberEmail: "",
    planType: "",
    amount: "",
    startDate: "",
    endDate: "",
  })
  const [pdfBase64, setPdfBase64] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
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
        <div className="flex items-center justify-center gap-3 mb-8">
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
            <Input
              id="planType"
              name="planType"
              type="text"
              placeholder="Monthly, Quarterly, Annual"
              value={formData.planType}
              onChange={handleChange}
              required
              className="bg-input border-border"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Amount ($)</Label>
            <Input
              id="amount"
              name="amount"
              type="number"
              placeholder="99.99"
              value={formData.amount}
              onChange={handleChange}
              required
              min="0"
              step="0.01"
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
                onChange={handleChange}
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
                onChange={handleChange}
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
