import { type NextRequest, NextResponse } from "next/server"
import { PDFDocument, rgb, StandardFonts } from "pdf-lib"

export async function POST(request: NextRequest) {
  try {
    const { memberName, memberEmail, planType, amount, startDate, endDate } = await request.json()

    const pdfDoc = await PDFDocument.create()
    const page = pdfDoc.addPage([595, 842]) // A4 size
    const { height } = page.getSize()

    const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold)
    const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica)

    const red = rgb(0.86, 0.2, 0.2)
    const black = rgb(0.1, 0.1, 0.1)
    const gray = rgb(0.4, 0.4, 0.4)

    // Header
    page.drawText("XYZ GYM", {
      x: 50,
      y: height - 60,
      size: 32,
      font: helveticaBold,
      color: red,
    })

    page.drawText("INVOICE", {
      x: 430,
      y: height - 60,
      size: 24,
      font: helveticaBold,
      color: black,
    })

    // Divider line
    page.drawLine({
      start: { x: 50, y: height - 80 },
      end: { x: 545, y: height - 80 },
      thickness: 2,
      color: red,
    })

    // Date of Issue
    const issueDate = new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })

    page.drawText(`Date of Issue: ${issueDate}`, {
      x: 50,
      y: height - 120,
      size: 12,
      font: helvetica,
      color: gray,
    })

    // Member Details Section
    page.drawText("BILL TO:", {
      x: 50,
      y: height - 170,
      size: 12,
      font: helveticaBold,
      color: red,
    })

    page.drawText(memberName, {
      x: 50,
      y: height - 190,
      size: 14,
      font: helveticaBold,
      color: black,
    })

    page.drawText(memberEmail, {
      x: 50,
      y: height - 210,
      size: 11,
      font: helvetica,
      color: gray,
    })

    // Invoice Details Table Header
    const tableTop = height - 280
    page.drawRectangle({
      x: 50,
      y: tableTop - 5,
      width: 495,
      height: 25,
      color: rgb(0.95, 0.95, 0.95),
    })

    page.drawText("Description", {
      x: 60,
      y: tableTop,
      size: 11,
      font: helveticaBold,
      color: black,
    })

    page.drawText("Details", {
      x: 350,
      y: tableTop,
      size: 11,
      font: helveticaBold,
      color: black,
    })

    // Table Rows
    const rows = [
      { label: "Plan Type", value: planType },
      { label: "Start Date", value: new Date(startDate).toLocaleDateString() },
      { label: "End Date", value: new Date(endDate).toLocaleDateString() },
    ]

    let yPos = tableTop - 35
    rows.forEach((row) => {
      page.drawText(row.label, {
        x: 60,
        y: yPos,
        size: 11,
        font: helvetica,
        color: black,
      })
      page.drawText(row.value, {
        x: 350,
        y: yPos,
        size: 11,
        font: helvetica,
        color: gray,
      })
      yPos -= 25
    })

    // Divider before total
    page.drawLine({
      start: { x: 50, y: yPos + 5 },
      end: { x: 545, y: yPos + 5 },
      thickness: 1,
      color: rgb(0.8, 0.8, 0.8),
    })

    // Total Amount
    yPos -= 30
    page.drawRectangle({
      x: 300,
      y: yPos - 10,
      width: 245,
      height: 35,
      color: red,
    })

    page.drawText("TOTAL AMOUNT:", {
      x: 310,
      y: yPos,
      size: 12,
      font: helveticaBold,
      color: rgb(1, 1, 1),
    })

    page.drawText(`$${Number.parseFloat(amount).toFixed(2)}`, {
      x: 450,
      y: yPos,
      size: 14,
      font: helveticaBold,
      color: rgb(1, 1, 1),
    })

    // Footer
    page.drawText("Thank you for being a valued member of XYZ Gym!", {
      x: 150,
      y: 80,
      size: 11,
      font: helvetica,
      color: gray,
    })

    page.drawText("Stay fit, stay strong!", {
      x: 230,
      y: 55,
      size: 10,
      font: helvetica,
      color: red,
    })

    const pdfBytes = await pdfDoc.save()
    const base64Pdf = Buffer.from(pdfBytes).toString("base64")

    return NextResponse.json({ pdf: base64Pdf })
  } catch (error) {
    console.error("Error generating PDF:", error)
    return NextResponse.json({ error: "Failed to generate invoice" }, { status: 500 })
  }
}
