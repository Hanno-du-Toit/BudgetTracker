import { useCallback } from 'react'
import { supabase } from '@/services/supabase'
import { MAX_SUPABASE_INSERT_BATCH } from '@/constants/limits'

function deriveStatementMonth(transactions) {
  const counts = {}
  for (const t of transactions) {
    const month = t.date?.slice(0, 7)
    if (month) counts[month] = (counts[month] ?? 0) + 1
  }
  let best = null, bestCount = 0
  for (const [month, count] of Object.entries(counts)) {
    if (count > bestCount) { best = month; bestCount = count }
  }
  return best ?? new Date().toISOString().slice(0, 7)
}

function detectFileType(fileName) {
  return fileName?.toLowerCase().endsWith('.pdf') ? 'pdf' : 'csv'
}

function normalizePattern(description) {
  return description.toLowerCase().replace(/\s+/g, ' ').trim().slice(0, 200)
}

function throwSupabaseError(label, error) {
  console.error(`[useTransactions] ${label}:`, error)
  const msg = error?.message ?? error?.details ?? error?.hint ?? JSON.stringify(error)
  throw new Error(`${label}: ${msg}`)
}

async function insertInBatches(userId, rows) {
  for (let i = 0; i < rows.length; i += MAX_SUPABASE_INSERT_BATCH) {
    const batch = rows.slice(i, i + MAX_SUPABASE_INSERT_BATCH)
    const { error } = await supabase.from('transactions').insert(batch)
    if (error) throwSupabaseError('transactions insert', error)
  }
}

export function useTransactions() {
  // userId is NOT accepted as a parameter — it is always read from the active session
  // so the value inserted into user_id columns is guaranteed to match auth.uid().
  const upsertMany = useCallback(async (transactions, fileName, manuallyChangedIds) => {
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    if (sessionError || !session) {
      throw new Error('Session expired — please sign in again and retry.')
    }

    const userId = session.user.id

    const statementMonth = deriveStatementMonth(transactions)

    // 1 — Create statement row
    const { data: statement, error: stmtError } = await supabase
      .from('statements')
      .insert({
        user_id:           userId,
        file_name:         fileName,
        file_type:         detectFileType(fileName),
        statement_month:   statementMonth,
        transaction_count: transactions.length,
      })
      .select('id')
      .single()

    if (stmtError) throwSupabaseError('statements insert', stmtError)

    // 2 — Batch-insert transactions
    const rows = transactions.map((t) => ({
      id:                      t.id,
      user_id:                 userId,
      statement_id:            statement.id,
      transaction_date:        t.date,
      description:             t.description,
      amount:                  t.amount,
      category:                t.category,
      is_manually_categorized: manuallyChangedIds.has(t.id),
    }))

    await insertInBatches(userId, rows)

    // 3 — Upsert category_overrides for manual corrections
    const overrides = transactions
      .filter((t) => manuallyChangedIds.has(t.id))
      .map((t) => ({
        user_id:             userId,
        description_pattern: normalizePattern(t.description),
        category:            t.category,
      }))

    if (overrides.length > 0) {
      const { error: overrideError } = await supabase
        .from('category_overrides')
        .upsert(overrides, { onConflict: 'user_id,description_pattern' })

      if (overrideError) throwSupabaseError('category_overrides upsert', overrideError)
    }

    return { statementId: statement.id, statementMonth }
  }, [])

  return { upsertMany }
}
