import * as pdfjsLib from 'pdfjs-dist'

// Use the CDN worker so we don't need Vite worker config. Version is locked to
// the installed pdfjs-dist package version for guaranteed compatibility.
pdfjsLib.GlobalWorkerOptions.workerSrc =
  `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`

const DATE_HINTS   = ['date', 'transaction date', 'trans date', 'trans. date']
const AMOUNT_HINTS = ['amount', 'debit', 'credit', 'balance', 'withdrawals', 'deposits']

// Y-coordinate tolerance for grouping text into the same line (PDF units)
const Y_TOLERANCE = 5

/**
 * Group flat text items into lines sorted top-to-bottom, left-to-right.
 * PDF Y-axis is inverted (0 = bottom), so we invert via pageHeight.
 */
function groupIntoLines(items) {
  const sorted = [...items].sort((a, b) =>
    a.y !== b.y ? a.y - b.y : a.x - b.x
  )

  const lines = []
  let current = []
  let currentY = null

  for (const item of sorted) {
    if (currentY === null || Math.abs(item.y - currentY) <= Y_TOLERANCE) {
      current.push(item)
      currentY = currentY ?? item.y
    } else {
      if (current.length) lines.push(current)
      current = [item]
      currentY = item.y
    }
  }
  if (current.length) lines.push(current)
  return lines
}

function findHeaderLine(lines) {
  for (let i = 0; i < Math.min(lines.length, 50); i++) {
    const texts = lines[i].map((item) => item.text.toLowerCase())
    const hasDate   = texts.some((t) => DATE_HINTS.some((h) => t.includes(h)))
    const hasAmount = texts.some((t) => AMOUNT_HINTS.some((h) => t.includes(h)))
    if (hasDate && hasAmount) return i
  }
  return -1
}

/**
 * Build column bounds from the header line.
 * Each column spans from its X position to the start of the next column.
 */
function buildColumnBounds(headerLine) {
  const sorted = [...headerLine].sort((a, b) => a.x - b.x)
  return sorted.map((item, i) => ({
    label:  item.text.toLowerCase().trim(),
    xStart: item.x,
    xEnd:   i + 1 < sorted.length ? sorted[i + 1].x - 2 : Infinity,
  }))
}

function mapLineToColumns(line, columnBounds) {
  const row = {}
  for (const col of columnBounds) row[col.label] = ''

  for (const item of line) {
    const col = columnBounds.find(
      (c) => item.x >= c.xStart - 15 && item.x < c.xEnd
    )
    if (col) {
      row[col.label] = row[col.label]
        ? `${row[col.label]} ${item.text}`
        : item.text
    }
  }
  return row
}

/**
 * Parse a PDF File object. Returns { headers: string[], rows: object[] }.
 * File bytes never leave the browser.
 */
export async function parsePdf(file) {
  const arrayBuffer = await file.arrayBuffer()

  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise

  const allItems = []
  let pageOffset = 0

  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
    const page    = await pdf.getPage(pageNum)
    const content = await page.getTextContent()
    const vp      = page.getViewport({ scale: 1 })

    for (const item of content.items) {
      const text = item.str.trim()
      if (!text) continue
      allItems.push({
        text,
        x: Math.round(item.transform[4]),
        // Invert Y so 0 = top; add page offset so pages stack vertically
        y: Math.round(vp.height - item.transform[5]) + pageOffset,
        page: pageNum,
      })
    }

    pageOffset += Math.round(vp.height) + 20 // 20 unit gap between pages
  }

  const lines         = groupIntoLines(allItems)
  const headerLineIdx = findHeaderLine(lines)

  if (headerLineIdx === -1) {
    throw new Error('no_table_found')
  }

  const columnBounds = buildColumnBounds(lines[headerLineIdx])
  const headers      = columnBounds.map((c) => c.label)

  const rows = lines
    .slice(headerLineIdx + 1)
    .map((line) => mapLineToColumns(line, columnBounds))
    .filter((row) => Object.values(row).some((v) => String(v).trim()))

  return { headers, rows }
}
