import { useState, useEffect, useMemo } from 'react'
import { supabase } from '@/services/supabase'
import { CATEGORY_COLORS } from '@/constants/categories'

function lastDayOfMonth(month) {
  const [year, mon] = month.split('-').map(Number)
  return String(new Date(year, mon, 0).getDate()).padStart(2, '0')
}

function weekLabel(dateStr) {
  const day = parseInt(dateStr.split('-')[2], 10)
  if (day <= 7)  return 'Wk 1'
  if (day <= 14) return 'Wk 2'
  if (day <= 21) return 'Wk 3'
  return 'Wk 4'
}

export function useDashboardStats(month) {
  const [transactions,    setTransactions]    = useState([])
  const [availableMonths, setAvailableMonths] = useState([])
  const [txLoading,       setTxLoading]       = useState(true)
  const [monthsLoading,   setMonthsLoading]   = useState(true)
  const [error,           setError]           = useState(null)

  // Fetch the distinct months that have uploaded statements
  useEffect(() => {
    setMonthsLoading(true)
    supabase
      .from('statements')
      .select('statement_month')
      .order('statement_month', { ascending: false })
      .then(({ data }) => {
        if (data) {
          const unique = [...new Set(data.map((r) => r.statement_month))]
          setAvailableMonths(unique)
        }
        setMonthsLoading(false)
      })
  }, [])

  // Fetch transactions for the selected month
  useEffect(() => {
    if (!month) return
    setTxLoading(true)
    setError(null)

    const start = `${month}-01`
    const end   = `${month}-${lastDayOfMonth(month)}`

    supabase
      .from('transactions')
      .select('id, transaction_date, description, amount, category')
      .gte('transaction_date', start)
      .lte('transaction_date', end)
      .order('transaction_date', { ascending: false })
      .then(({ data, error: err }) => {
        if (err) {
          console.error('[useDashboardStats]', err)
          setError('Failed to load transactions. Please try again.')
        } else {
          setTransactions(data ?? [])
        }
        setTxLoading(false)
      })
  }, [month])

  const stats = useMemo(() => {
    if (!transactions.length) return null

    const expenses = transactions.filter((t) => t.amount < 0)
    const incomes  = transactions.filter((t) => t.amount > 0)

    const totalSpend  = expenses.reduce((s, t) => s + Math.abs(t.amount), 0)
    const totalIncome = incomes.reduce((s, t) => s + t.amount, 0)
    const netFlow     = totalIncome - totalSpend

    // Spending by category (expenses only)
    const catMap = {}
    for (const t of expenses) {
      catMap[t.category] = (catMap[t.category] ?? 0) + Math.abs(t.amount)
    }
    const byCategory = Object.entries(catMap)
      .map(([category, total]) => ({
        category,
        total,
        pct:  totalSpend > 0 ? total / totalSpend : 0,
        fill: CATEGORY_COLORS[category] ?? CATEGORY_COLORS.other,
      }))
      .sort((a, b) => b.total - a.total)

    // Spending by week (expenses only)
    const weekMap = { 'Wk 1': 0, 'Wk 2': 0, 'Wk 3': 0, 'Wk 4': 0 }
    for (const t of expenses) weekMap[weekLabel(t.transaction_date)] += Math.abs(t.amount)
    const byWeek = Object.entries(weekMap).map(([week, spend]) => ({ week, spend }))

    return {
      totalSpend,
      totalIncome,
      netFlow,
      byCategory,
      topCategories:      byCategory.slice(0, 5),
      byWeek,
      recentTransactions: transactions.slice(0, 10),
      transactionCount:   transactions.length,
    }
  }, [transactions])

  return {
    loading: txLoading || monthsLoading,
    error,
    stats,
    availableMonths,
  }
}
