import Papa from 'papaparse'

// Keywords that reliably appear in bank CSV header rows
const DATE_HINTS = ['date', 'transaction date', 'trans date', 'datum']
const DESC_HINTS = ['description', 'summary', 'transaction', 'details', 'narration']

/**
 * FNB and some other SA banks prepend account metadata rows before the
 * actual column headers. Scan up to 25 rows to find the real header.
 */
function findHeaderRowIndex(rows) {
  for (let i = 0; i < Math.min(rows.length, 25); i++) {
    const cells = rows[i].map((c) => String(c).toLowerCase().trim())
    const hasDate = cells.some((c) => DATE_HINTS.some((h) => c === h || c.startsWith(h)))
    const hasDesc = cells.some((c) => DESC_HINTS.some((h) => c === h || c.includes(h)))
    if (hasDate && hasDesc) return i
  }

  // Fallback: first row with 3+ non-empty, non-numeric text cells
  for (let i = 0; i < Math.min(rows.length, 15); i++) {
    const textCells = rows[i].filter((c) => {
      const s = String(c).trim()
      return s && isNaN(Number(s.replace(/[R,\s]/g, '')))
    })
    if (textCells.length >= 3) return i
  }

  return 0
}

/**
 * Parse a CSV File object. Returns { headers: string[], rows: object[] }
 * where each row is an object keyed by the original header string.
 * Never throws — caller should wrap in try/catch.
 */
export function parseCsv(file) {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: false,
      skipEmptyLines: true,
      encoding: 'UTF-8',
      complete(results) {
        try {
          const rawRows = results.data

          if (rawRows.length < 2) {
            reject(new Error('no_transactions'))
            return
          }

          const headerIdx  = findHeaderRowIndex(rawRows)
          const headerRow  = rawRows[headerIdx].map((h) => String(h).trim())
          const dataRaws   = rawRows.slice(headerIdx + 1)

          const rows = dataRaws
            .filter((row) => row.some((cell) => String(cell).trim()))
            .map((row) => {
              const obj = {}
              headerRow.forEach((h, i) => { obj[h] = row[i] ?? '' })
              return obj
            })

          resolve({ headers: headerRow, rows })
        } catch (err) {
          reject(err)
        }
      },
      error(err) {
        reject(err)
      },
    })
  })
}
