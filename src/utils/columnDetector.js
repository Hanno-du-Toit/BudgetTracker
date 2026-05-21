// Keyword lists for each field type, ordered by specificity.
// SA bank formats covered: FNB, ABSA, Nedbank, Standard Bank, Capitec.

const DATE_KEYWORDS = [
  'transaction date', 'trans date', 'trans. date', 'posted date', 'value date', 'date',
]

const DESC_KEYWORDS = [
  'transaction description', 'trans description', 'trans. description',
  'description', 'summary', 'details', 'merchant', 'payee', 'narration',
  'particulars', 'reference',
  // Capitec uses "transaction type" as the primary descriptor
  'transaction type', 'trans type',
]

const AMOUNT_KEYWORDS = [
  'transaction amount', 'net amount', 'rand amount', 'amount',
]

// Banks that split into separate debit/credit columns
const DEBIT_KEYWORDS = [
  'debit amount', 'debit (r)', 'debit', 'withdrawals', 'payment amount', 'dr',
]

const CREDIT_KEYWORDS = [
  'credit amount', 'credit (r)', 'credit', 'deposits', 'cr',
]

// Columns to always ignore when present
const IGNORE_KEYWORDS = [
  'balance', 'running balance', 'closing balance', 'available balance',
  'accumulated spend', 'ledger balance',
]

function normalize(str) {
  return String(str ?? '').toLowerCase().trim()
}

function findField(headers, keywords) {
  for (const kw of keywords) {
    // Exact match first
    const exact = headers.find(h => normalize(h) === kw)
    if (exact !== undefined) return exact
  }
  for (const kw of keywords) {
    // Contains match
    const partial = headers.find(h => normalize(h).includes(kw))
    if (partial !== undefined) return partial
  }
  return null
}

/**
 * Identifies the bank from CSV headers.
 * Checks from most-specific to least-specific to avoid false matches.
 */
export function detectBank(headers) {
  const h   = headers.map((s) => String(s ?? '').toLowerCase().trim())
  const has = (kw) => h.some((col) => col.includes(kw))

  if (has('narrative') || has('transaction date'))                   return 'FNB'
  if (has('rand amount'))                                             return 'Nedbank'
  if (has('debits') && has('credits'))                               return 'Standard Bank'
  if (has('transaction type') || (has('debit') && has('credit')))    return 'Capitec'
  if (has('transaction details'))                                     return 'Nedbank'
  if (has('description') && has('amount') && has('date'))            return 'ABSA'
  return 'Unknown'
}

/**
 * Given a list of header strings, returns the column mapping for our parser.
 * Returns: { dateField, descriptionField, amountField, debitField, creditField, isSplit }
 */
export function detectColumns(headers) {
  // Strip out balance and other noise columns before detection
  const usable = headers.filter(h => !IGNORE_KEYWORDS.some(k => normalize(h).includes(k)))

  const dateField        = findField(usable, DATE_KEYWORDS)
  const descriptionField = findField(usable, DESC_KEYWORDS)
  const amountField      = findField(usable, AMOUNT_KEYWORDS)
  const debitField       = findField(usable, DEBIT_KEYWORDS)
  const creditField      = findField(usable, CREDIT_KEYWORDS)

  // isSplit = no single amount column but at least one of debit/credit exists
  const isSplit = !amountField && (!!debitField || !!creditField)

  return { dateField, descriptionField, amountField, debitField, creditField, isSplit }
}
