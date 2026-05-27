import { useState, useCallback } from 'react'
import { parseCsv } from '@/services/csvParser'
import { categorizeAll } from '@/services/claudeApi'
import { detectColumns, detectBank } from '@/utils/columnDetector'
import { normalizeRows } from '@/utils/transactionNormalizer'
import { MAX_FILE_SIZE_BYTES } from '@/constants/limits'
import { supabase } from '@/services/supabase'

const PARSE_ERRORS = {
  file_too_large:     'This file is too large. Please export a smaller date range from your bank.',
  unsupported_format: 'Only CSV files are supported. Export your statement as CSV from your bank\'s app or internet banking.',
  no_transactions:    "No transactions were found in this file. Make sure you're uploading a bank statement, not an account summary.",
  no_date_column:     "We couldn't find a date column in this file. It may be in an unsupported format — try a different CSV export from your bank.",
  ai_failed:          "AI categorization ran into an issue. Your transactions are still saved — you can edit categories manually.",
  parse_failed:       'We couldn\'t read this file. It may be corrupted or in an unexpected format. Try a different export.',
}

function mapParseError(err) {
  const key = err?.message ?? ''
  return PARSE_ERRORS[key] ?? PARSE_ERRORS.parse_failed
}

function isCSV(file) {
  const name = file.name.toLowerCase()
  return file.type === 'text/csv' || file.type === 'application/vnd.ms-excel' || name.endsWith('.csv')
}

export function useFileParser() {
  const [status,             setStatus]             = useState('idle')   // idle | parsing | review | error
  const [progress,           setProgress]           = useState(0)
  const [parseStep,          setParseStep]          = useState('')
  const [isAiStep,           setIsAiStep]           = useState(false)
  const [transactions,       setTransactions]       = useState([])
  const [error,              setError]              = useState(null)
  const [fileName,           setFileName]           = useState('')
  const [manuallyChangedIds, setManuallyChangedIds] = useState(() => new Set())
  const [bankName,           setBankName]           = useState('Unknown')
  const [rateLimitSeconds,   setRateLimitSeconds]   = useState(0)

  const parseFile = useCallback(async (file) => {
    setStatus('parsing')
    setError(null)
    setProgress(0)
    setIsAiStep(false)
    setFileName(file.name)

    try {
      // 1 — Validate
      if (file.size > MAX_FILE_SIZE_BYTES) throw new Error('file_too_large')
      if (!isCSV(file)) throw new Error('unsupported_format')

      // 2 — Parse raw rows
      setParseStep('Reading your file…')
      setProgress(10)
      const { headers, rows } = await parseCsv(file)
      setProgress(30)

      // 3 — Detect columns + bank + normalise
      setParseStep('Detecting bank format…')
      const columns  = detectColumns(headers)
      const detected = detectBank(headers)
      setBankName(detected)
      if (!columns.dateField) throw new Error('no_date_column')
      setProgress(40)

      setParseStep('Extracting transactions…')
      const txns = normalizeRows(rows, columns)
      if (txns.length === 0) throw new Error('no_transactions')
      setProgress(50)

      // 4 — Fetch user's past corrections for few-shot context
      setParseStep('Preparing AI categorization…')
      setIsAiStep(true)
      const { data: overrides } = await supabase
        .from('category_overrides')
        .select('description_pattern, category')
      const { data: accounts } = await supabase
        .from('user_accounts')
        .select('account_number')
      const userAccountNumbers = (accounts ?? []).map((a) => a.account_number)
      setProgress(55)

      // 5 — AI categorize (progress callback maps 0-100 → 55-95%)
      setParseStep('AI is categorizing your transactions…')
      const categoryMap = await categorizeAll(
        txns,
        overrides ?? [],
        (pct) => setProgress(55 + Math.round(pct * 0.4)),
        { userAccountNumbers },
        (seconds) => setRateLimitSeconds(seconds)
      )

      // 6 — Apply categories; fall back to 'other' for any Claude missed
      const categorized = txns.map((t) => ({
        ...t,
        category: categoryMap.get(t.id) ?? (t.amount > 0 ? 'income' : 'other'),
      }))

      setProgress(100)
      await new Promise(resolve => setTimeout(resolve, 700))
      setTransactions(categorized)
      setStatus('review')
    } catch (err) {
      setError(mapParseError(err))
      setStatus('error')
    }
  }, [])

  const updateTransactionCategory = useCallback((id, category) => {
    setTransactions((prev) =>
      prev.map((t) => (t.id === id ? { ...t, category } : t))
    )
    setManuallyChangedIds((prev) => new Set([...prev, id]))
  }, [])

  const reset = useCallback(() => {
    setStatus('idle')
    setProgress(0)
    setParseStep('')
    setIsAiStep(false)
    setTransactions([])
    setError(null)
    setFileName('')
    setManuallyChangedIds(new Set())
    setBankName('Unknown')
    setRateLimitSeconds(0)
  }, [])

  return {
    status, progress, parseStep, isAiStep,
    transactions, error, fileName, manuallyChangedIds, bankName,
    rateLimitSeconds,
    parseFile, reset, updateTransactionCategory,
  }
}
