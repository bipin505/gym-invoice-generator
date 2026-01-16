import { type NextRequest, NextResponse } from "next/server"
import { PDFDocument, rgb, StandardFonts } from "pdf-lib"

export async function POST(request: NextRequest) {
  try {
    const { memberName, memberEmail, planType, amount, startDate, endDate, additionalPlanDesc, additionalPlanAmount, phoneNumber, discount } = await request.json()

    const pdfDoc = await PDFDocument.create()
    const page = pdfDoc.addPage([595, 842]) // A4 size
    const { width, height } = page.getSize()

    const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold)
    const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica)

    // Professional color scheme
    const primaryColor = rgb(0.2, 0.3, 0.5) // Dark blue
    const accentColor = rgb(0.86, 0.2, 0.2) // Red
    const black = rgb(0.1, 0.1, 0.1)
    const gray = rgb(0.5, 0.5, 0.5)
    const lightGray = rgb(0.9, 0.9, 0.9)
    const white = rgb(1, 1, 1)

    // Generate unique invoice number
    const invoiceNumber = `INV-${new Date().getFullYear()}-${String(Date.now()).slice(-8)}`
    const issueDate = new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })

    let yPos = height - 50

    // ============ HEADER SECTION ============
    // Company name
    page.drawText("XYZ FITNESS GYM", {
      x: 50,
      y: yPos,
      size: 28,
      font: helveticaBold,
      color: primaryColor,
    })

    // Invoice title on right
    page.drawText("INVOICE", {
      x: width - 150,
      y: yPos,
      size: 24,
      font: helveticaBold,
      color: black,
    })

    yPos -= 25

    // Company details (left side)
    const companyDetails = [
      "123 Fitness Street, Gym Plaza",
      "Mumbai, Maharashtra 400001",
      "Phone: +91 98765 43210",
      "Email: info@xyzgym.com",
      "GST: 27AAACB1234C1Z1"
    ]

    companyDetails.forEach(line => {
      page.drawText(line, {
        x: 50,
        y: yPos,
        size: 9,
        font: helvetica,
        color: gray,
      })
      yPos -= 12
    })

    // Invoice number and date (right side)
    page.drawText(`Invoice #: ${invoiceNumber}`, {
      x: width - 200,
      y: height - 85,
      size: 10,
      font: helveticaBold,
      color: black,
    })

    page.drawText(`Date: ${issueDate}`, {
      x: width - 200,
      y: height - 100,
      size: 10,
      font: helvetica,
      color: gray,
    })

    // Horizontal divider
    yPos = height - 165
    page.drawLine({
      start: { x: 50, y: yPos },
      end: { x: width - 50, y: yPos },
      thickness: 2,
      color: primaryColor,
    })

    yPos -= 30

    // ============ BILL TO SECTION ============
    page.drawText("BILL TO:", {
      x: 50,
      y: yPos,
      size: 11,
      font: helveticaBold,
      color: primaryColor,
    })

    yPos -= 20

    page.drawText(memberName, {
      x: 50,
      y: yPos,
      size: 13,
      font: helveticaBold,
      color: black,
    })

    yPos -= 18

    page.drawText(`Email: ${memberEmail}`, {
      x: 50,
      y: yPos,
      size: 10,
      font: helvetica,
      color: gray,
    })

    yPos -= 18

    if (phoneNumber) {
      page.drawText(`Phone: +91 ${phoneNumber}`, {
        x: 50,
        y: yPos,
        size: 10,
        font: helvetica,
        color: gray,
      })
      yPos -= 20
    }

    yPos -= 15

    // ============ INVOICE TABLE ============
    // Table header background
    page.drawRectangle({
      x: 50,
      y: yPos - 5,
      width: width - 100,
      height: 25,
      color: primaryColor,
    })

    // Table headers
    page.drawText("DESCRIPTION", {
      x: 60,
      y: yPos,
      size: 10,
      font: helveticaBold,
      color: white,
    })

    page.drawText("PERIOD", {
      x: 280,
      y: yPos,
      size: 10,
      font: helveticaBold,
      color: white,
    })

    page.drawText("AMOUNT", {
      x: width - 130,
      y: yPos,
      size: 10,
      font: helveticaBold,
      color: white,
    })

    yPos -= 30

    // Table rows
    const tableRows: Array<{ description: string; period: string; amount: string }> = []

    // Main plan
    const planTypeFormatted = planType.charAt(0).toUpperCase() + planType.slice(1)
    const periodText = `${new Date(startDate).toLocaleDateString()} - ${new Date(endDate).toLocaleDateString()}`

    tableRows.push({
      description: `${planTypeFormatted} Membership Plan`,
      period: periodText,
      amount: `Rs. ${Number.parseFloat(amount).toFixed(2)}`
    })

    // Additional plan
    if (additionalPlanDesc && additionalPlanAmount) {
      tableRows.push({
        description: additionalPlanDesc,
        period:  "-",
        amount: `Rs. ${Number.parseFloat(additionalPlanAmount).toFixed(2)}`
      })
    }

    // Draw rows with alternating background
    let rowIndex = 0
    tableRows.forEach((row) => {
      // Alternating row background
      if (rowIndex % 2 === 0) {
        page.drawRectangle({
          x: 50,
          y: yPos - 8,
          width: width - 100,
          height: 22,
          color: lightGray,
        })
      }

      page.drawText(row.description, {
        x: 60,
        y: yPos,
        size: 10,
        font: helvetica,
        color: black,
      })

      page.drawText(row.period, {
        x: 280,
        y: yPos,
        size: 9,
        font: helvetica,
        color: gray,
      })

      page.drawText(row.amount, {
        x: width - 130,
        y: yPos,
        size: 10,
        font: helvetica,
        color: black,
      })

      yPos -= 25
      rowIndex++
    })

    // Table bottom border
    page.drawLine({
      start: { x: 50, y: yPos + 10 },
      end: { x: width - 50, y: yPos + 10 },
      thickness: 1,
      color: gray,
    })

    yPos -= 15

    // ============ CALCULATION SECTION ============
    const subtotal = Number.parseFloat(amount) + (Number.parseFloat(additionalPlanAmount) || 0)
    const discountAmount = Number(discount) || 0
    const totalAmount = subtotal - discountAmount

    const calcX = width - 250
    const amountX = width - 120

    // Subtotal
    page.drawText("Subtotal:", {
      x: calcX,
      y: yPos,
      size: 10,
      font: helvetica,
      color: black,
    })

    page.drawText(`Rs. ${subtotal.toFixed(2)}`, {
      x: amountX,
      y: yPos,
      size: 10,
      font: helvetica,
      color: black,
    })

    yPos -= 18

    // Discount if applicable
    if (discountAmount > 0) {
      page.drawText("Discount:", {
        x: calcX,
        y: yPos,
        size: 10,
        font: helvetica,
        color: accentColor,
      })

      page.drawText(`- Rs. ${discountAmount.toFixed(2)}`, {
        x: amountX,
        y: yPos,
        size: 10,
        font: helvetica,
        color: accentColor,
      })

      yPos -= 25
    }

    yPos -= 10

    // Total box
    page.drawRectangle({
      x: width - 280,
      y: yPos - 8,
      width: 230,
      height: 30,
      color: primaryColor,
    })

    page.drawText("TOTAL AMOUNT:", {
      x: width - 270,
      y: yPos,
      size: 12,
      font: helveticaBold,
      color: white,
    })

    page.drawText(`Rs. ${totalAmount.toFixed(2)}`, {
      x: width - 130,
      y: yPos,
      size: 14,
      font: helveticaBold,
      color: white,
    })

    yPos -= 50

    // ============ FOOTER SECTION ============
    yPos = 120

    page.drawLine({
      start: { x: 50, y: yPos },
      end: { x: width - 50, y: yPos },
      thickness: 1,
      color: lightGray,
    })

    yPos -= 15

    page.drawText("TERMS & CONDITIONS", {
      x: 50,
      y: yPos,
      size: 9,
      font: helveticaBold,
      color: black,
    })

    yPos -= 12

    const terms = [
      "1. Membership fees are non-refundable under any circumstances.",
      "2. Members must follow gym rules and regulations at all times.",
      "3. The gym is not responsible for any personal belongings or injuries.",
      "4. Please carry your membership card during all visits."
    ]

    terms.forEach(term => {
      page.drawText(term, {
        x: 50,
        y: yPos,
        size: 7,
        font: helvetica,
        color: gray,
      })
      yPos -= 10
    })

    yPos -= 10

    // Thank you message
    page.drawText("Thank you for being a valued member of XYZ Fitness Gym!", {
      x: (width - 300) / 2,
      y: yPos,
      size: 10,
      font: helveticaBold,
      color: primaryColor,
    })

    yPos -= 12

    page.drawText("Stay Fit, Stay Strong!", {
      x: (width - 100) / 2,
      y: yPos,
      size: 9,
      font: helvetica,
      color: accentColor,
    })

    const pdfBytes = await pdfDoc.save()
    const base64Pdf = Buffer.from(pdfBytes).toString("base64")

    return NextResponse.json({ pdf: base64Pdf })
  } catch (error) {
    console.error("Error generating PDF:", error)
    return NextResponse.json({ error: "Failed to generate invoice" }, { status: 500 })
  }
}
