import { useState, useEffect } from 'react'
import { supabase } from '@/services/supabase'

export function useUserSettings() {
  const [monthlyIncome,      setMonthlyIncome]      = useState(null)
  const [monthlyIncomeLabel, setMonthlyIncomeLabel] = useState(null)
  const [loading,            setLoading]            = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) { setLoading(false); return }
      const { data } = await supabase
        .from('user_settings')
        .select('monthly_income, monthly_income_label')
        .eq('user_id', session.user.id)
        .maybeSingle()
      if (data) {
        setMonthlyIncome(data.monthly_income)
        setMonthlyIncomeLabel(data.monthly_income_label)
      }
      setLoading(false)
    })
  }, [])

  async function saveMonthlyIncome(amount, label) {
    const { data: { session } } = await supabase.auth.getSession()
    const { error } = await supabase
      .from('user_settings')
      .upsert(
        {
          user_id:              session.user.id,
          monthly_income:       amount,
          monthly_income_label: label || null,
          updated_at:           new Date().toISOString(),
        },
        { onConflict: 'user_id' }
      )
    if (error) throw error
    setMonthlyIncome(amount)
    setMonthlyIncomeLabel(label || null)
  }

  return { monthlyIncome, monthlyIncomeLabel, saveMonthlyIncome, loading }
}
