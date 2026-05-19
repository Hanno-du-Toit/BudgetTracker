import { v4 as uuidv4 } from 'uuid'

const MONTH_MAP = {
  jan: '01', feb: '02', mar: '03', apr: '04', may: '05', jun: '06',
  jul: '07', aug: '08', sep: '09', oct: '10', nov: '11', dec: '12',
}

function parseDate(raw) {
  if (!raw) return null
  const s = String(raw).trim().replace(/['"]/g, '').trim()

  // YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s

  // YYYY/MM/DD or YYYY/M/D
  let m = s.match(/^(\d{4})\/(\d{1,2})\/(\d{1,2})$/)
  if (m) return `${m[1]}-${m[2].padStart(2, '0')}-${m[3].padStart(2, '0')}`

  // DD/MM/YYYY or D/M/YYYY
  m = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/)
  if (m) return `${m[3]}-${m[2].padStart(2, '0')}-${m[1].padStart(2, '0')}`

  // DD MMM YYYY or D MMM YYYY — FNB format
  m = s.match(/^(\d{1,2})\s+([A-Za-z]{3,})\s+(\d{4})$/)
  if (m) {
    const mon = MONTH_MAP[m[2].toLowerCase().slice(0, 3)]
    if (mon) return `${m[3]}-${mon}-${m[1].padStart(2, '0')}`
  }

  // YYYYMMDD compact
  m = s.match(/^(\d{4})(\d{2})(\d{2})$/)
  if (m) return `${m[1]}-${m[2]}-${m[3]}`

  return null
}

function parseAmount(raw) {
  if (raw === null || raw === undefined || raw === '') return null
  // Strip currency symbol, spaces, quotes, and thousands commas
  const cleaned = String(raw)
    .replace(/[RZArz\s"']/g, '')
    .replace(/,(?=\d{3}(?:\.|$))/g, '') // remove thousands separator comma
    .trim()
  if (!cleaned) return null
  const num = parseFloat(cleaned)
  return isNaN(num) ? null : num
}

function cleanDescription(raw) {
  return String(raw ?? '')
    .trim()
    .replace(/\s+/g, ' ')      // collapse multiple spaces
    .replace(/^["']|["']$/g, '') // strip surrounding quotes
}

/**
 * Converts raw parsed rows into normalized Transaction objects.
 * Handles both single signed-amount columns and split debit/credit columns.
 */
export function normalizeRows(rows, columns) {
  const { dateField, descriptionField, amountField, debitField, creditField, isSplit } = columns
  const transactions = []

  for (const row of rows) {
    const date = parseDate(dateField ? row[dateField] : null)
    if (!date) continue

    const description = descriptionField ? cleanDescription(row[descriptionField]) : ''
    if (!description) continue

    let amount = null

    if (isSplit) {
      // Separate debit / credit columns (ABSA, Nedbank, Capitec)
      const debit  = debitField  ? parseAmount(row[debitField])  : null
      const credit = creditField ? parseAmount(row[creditField]) : null

      if (credit !== null && credit > 0) {
        amount = Math.abs(credit)   // money in → positive
      } else if (debit !== null && debit > 0) {
        amount = -Math.abs(debit)   // money out → negative
      }
    } else {
      // Single amount column, already signed (FNB, Standard Bank)
      amount = amountField ? parseAmount(row[amountField]) : null
    }

    if (amount === null) continue

    transactions.push({
      id:          uuidv4(),
      date,
      description,
      amount,
      category:    'uncategorized',
    })
  }

  return transactions
}
