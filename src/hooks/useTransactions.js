import { useCallback } from 'react'
import { supabase } from '@/services/supabase'
import { MAX_SUPABASE_INSERT_BATCH } from '@/constants/limits'

// ── Helpers ──────────────────────────────────────────────────────────────────

function lastDayOfMonth(month) {
  const [year, mon] = month.split('-').map(Number)
  return String(new Date(year, mon, 0).getDate()).padStart(2, '0')
}

function detectFileType(_fileName) {
  return 'csv'
}

function normalizePattern(description) {
  return description.toLowerCase().replace(/\s+/g, ' ').trim().slice(0, 200)
}

function fingerprint(date, description, amount) {
  return `${date}|${description}|${parseFloat(amount)}`
}

function throwSupabaseError(label, error) {
  console.error(`[useTransactions] ${label}:`, error)
  const msg = error?.message ?? error?.details ?? error?.hint ?? JSON.stringify(error)
  throw new Error(`${label}: ${msg}`)
}

async function insertInBatches(rows) {
  for (let i = 0; i < rows.length; i += MAX_SUPABASE_INSERT_BATCH) {
    const batch = rows.slice(i, i + MAX_SUPABASE_INSERT_BATCH)
    const { error } = await supabase.from('transactions').insert(batch)
    if (error) throwSupabaseError('transactions insert', error)
  }
}

// ── Hook ─────────────────────────────────────────────────────────────────────

export function useTransactions() {

  // ── upsertMany (upload flow) ────────────────────────────────────────────
  const upsertMany = useCallback(async (transactions, fileName, manuallyChangedIds) => {
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    if (sessionError || !session) throw new Error('Session expired — please sign in again.')
    const userId = session.user.id

    // 1 — Duplicate detection: query existing rows matching any of the new dates
    const dates = [...new Set(transactions.map((t) => t.date))]
    const { data: existing } = await supabase
      .from('transactions')
      .select('transaction_date, description, amount')
      .in('transaction_date', dates)

    const seen = new Set(
      (existing ?? []).map((t) => fingerprint(t.transaction_date, t.description, t.amount))
    )
    const unique       = transactions.filter((t) => !seen.has(fingerprint(t.date, t.description, t.amount)))
    const duplicateCount = transactions.length - unique.length

    if (unique.length === 0) {
      return { savedCount: 0, duplicateCount, statementId: null, statementMonth: null }
    }

    // Derive statement_month from the majority date in the unique set
    const monthCounts = {}
    for (const t of unique) {
      const m = t.date?.slice(0, 7)
      if (m) monthCounts[m] = (monthCounts[m] ?? 0) + 1
    }
    const statementMonth = Object.entries(monthCounts).sort((a, b) => b[1] - a[1])[0]?.[0]
      ?? new Date().toISOString().slice(0, 7)

    // 2 — Create statement row
    const { data: statement, error: stmtError } = await supabase
      .from('statements')
      .insert({
        user_id:           userId,
        file_name:         fileName,
        file_type:         detectFileType(fileName),
        statement_month:   statementMonth,
        transaction_count: unique.length,
      })
      .select('id')
      .single()

    if (stmtError) throwSupabaseError('statements insert', stmtError)

    // 3 — Batch-insert unique transactions
    const rows = unique.map((t) => ({
      id:                      t.id,
      user_id:                 userId,
      statement_id:            statement.id,
      transaction_date:        t.date,
      description:             t.description,
      amount:                  t.amount,
      category:                t.category,
      is_manually_categorized: manuallyChangedIds.has(t.id),
    }))

    await insertInBatches(rows)

    // 4 — Upsert category_overrides for manually corrected categories
    const overrides = unique
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

    return { savedCount: unique.length, duplicateCount, statementId: statement.id, statementMonth }
  }, [])

  // ── loadTransactions ────────────────────────────────────────────────────
  const loadTransactions = useCallback(async ({
    search = '', category = '', month = '', sortBy = 'transaction_date', sortDir = 'desc',
  } = {}) => {
    let query = supabase
      .from('transactions')
      .select(
        'id, transaction_date, description, amount, category, is_manually_categorized, statement_id, ' +
        'statement:statement_id(id, file_name, statement_month)'
      )

    if (search.trim()) query = query.ilike('description', `%${search.trim()}%`)
    if (category)       query = query.eq('category', category)
    if (month) {
      query = query
        .gte('transaction_date', `${month}-01`)
        .lte('transaction_date', `${month}-${lastDayOfMonth(month)}`)
    }

    query = query.order(sortBy, { ascending: sortDir === 'asc' }).limit(1000)

    const { data, error } = await query
    if (error) throwSupabaseError('transactions fetch', error)
    return data ?? []
  }, [])

  // ── loadAvailableMonths ──────────────────────────────────────────────────
  const loadAvailableMonths = useCallback(async () => {
    const { data, error } = await supabase
      .from('transactions')
      .select('transaction_date')
      .order('transaction_date', { ascending: false })
    if (error) throwSupabaseError('months fetch', error)
    return [...new Set((data ?? []).map((t) => t.transaction_date.slice(0, 7)))]
  }, [])

  // ── loadStatements ──────────────────────────────────────────────────────
  const loadStatements = useCallback(async () => {
    const { data, error } = await supabase
      .from('statements')
      .select('id, file_name, file_type, statement_month, transaction_count, uploaded_at')
      .order('uploaded_at', { ascending: false })
    if (error) throwSupabaseError('statements fetch', error)
    return data ?? []
  }, [])

  // ── updateCategory ──────────────────────────────────────────────────────
  const updateCategory = useCallback(async (id, category, description) => {
    const { error } = await supabase
      .from('transactions')
      .update({ category, is_manually_categorized: true })
      .eq('id', id)
    if (error) throwSupabaseError('category update', error)

    // Persist the correction as future few-shot context for AI
    const { data: { session } } = await supabase.auth.getSession()
    if (session) {
      await supabase
        .from('category_overrides')
        .upsert(
          { user_id: session.user.id, description_pattern: normalizePattern(description), category },
          { onConflict: 'user_id,description_pattern' }
        )
    }
  }, [])

  // ── deleteTransaction ───────────────────────────────────────────────────
  const deleteTransaction = useCallback(async (id) => {
    const { error } = await supabase.from('transactions').delete().eq('id', id)
    if (error) throwSupabaseError('transaction delete', error)
  }, [])

  // ── deleteStatement (cascades via FK to all its transactions) ───────────
  const deleteStatement = useCallback(async (statementId) => {
    const { error } = await supabase.from('statements').delete().eq('id', statementId)
    if (error) throwSupabaseError('statement delete', error)
  }, [])

  return {
    upsertMany,
    loadTransactions,
    loadAvailableMonths,
    loadStatements,
    updateCategory,
    deleteTransaction,
    deleteStatement,
  }
}
