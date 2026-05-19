import { useState, useCallback } from 'react'
import { parseCsv } from '@/services/csvParser'
import { parsePdf } from '@/services/pdfParser'
import { detectColumns } from '@/utils/columnDetector'
import { normalizeRows } from '@/utils/transactionNormalizer'
import { MAX_FILE_SIZE_BYTES } from '@/constants/limits'

const PARSE_ERRORS = {
  file_too_large:    `This file is too large. Please export a smaller date range from your bank.`,
  unsupported_format: `We only support CSV and PDF files. Try exporting your statement from your bank's app or website.`,
  no_transactions:   `No transactions were found in this file. Make sure you're uploading a bank statement, not an account summary.`,
  no_date_column:    `We couldn't find a date column in this file. It may be in an unsupported format — try exporting as CSV.`,
  no_table_found:    `We couldn't find a transaction table in this PDF. Try exporting as CSV instead — most banks support it.`,
  parse_failed:      `We couldn't read this file. It may be password-protected or corrupted. Try a different export.`,
}

function mapParseError(err) {
  const key = err?.message ?? ''
  return PARSE_ERRORS[key] ?? PARSE_ERRORS.parse_failed
}

function detectFileType(file) {
  const name = file.name.toLowerCase()
  if (file.type === 'text/csv' || file.type === 'application/vnd.ms-excel' || name.endsWith('.csv')) return 'csv'
  if (file.type === 'application/pdf' || name.endsWith('.pdf')) return 'pdf'
  return null
}

export function useFileParser() {
  const [status,       setStatus]       = useState('idle')   // idle | parsing | review | error
  const [progress,     setProgress]     = useState(0)
  const [parseStep,    setParseStep]    = useState('')
  const [transactions, setTransactions] = useState([])
  const [error,        setError]        = useState(null)
  const [fileName,     setFileName]     = useState('')

  const parseFile = useCallback(async (file) => {
    setStatus('parsing')
    setError(null)
    setProgress(0)
    setFileName(file.name)

    try {
      // 1. Validate size
      if (file.size > MAX_FILE_SIZE_BYTES) throw new Error('file_too_large')

      // 2. Detect type
      const fileType = detectFileType(file)
      if (!fileType) throw new Error('unsupported_format')

      // 3. Parse raw content
      setParseStep('Reading your file…')
      setProgress(15)

      const { headers, rows } = fileType === 'csv'
        ? await parseCsv(file)
        : await parsePdf(file)

      setProgress(45)

      // 4. Detect columns
      setParseStep('Detecting bank format…')
      const columns = detectColumns(headers)

      if (!columns.dateField) throw new Error('no_date_column')

      setProgress(65)

      // 5. Normalise rows
      setParseStep('Extracting transactions…')
      const txns = normalizeRows(rows, columns)

      if (txns.length === 0) throw new Error('no_transactions')

      setProgress(100)
      setTransactions(txns)
      setStatus('review')
    } catch (err) {
      setError(mapParseError(err))
      setStatus('error')
    }
  }, [])

  const reset = useCallback(() => {
    setStatus('idle')
    setProgress(0)
    setParseStep('')
    setTransactions([])
    setError(null)
    setFileName('')
  }, [])

  return { status, progress, parseStep, transactions, error, fileName, parseFile, reset }
}
