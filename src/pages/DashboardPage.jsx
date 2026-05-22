import { useState, useRef, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { supabase } from '@/services/supabase'
import { useDashboardStats } from '@/hooks/useDashboardStats'
import { formatCurrency } from '@/utils/formatters'
import { ROUTES } from '@/constants/routes'
import { FADE_IN } from '@/constants/animation'
import AppShell from '@/components/layout/AppShell'
import PageWrapper from '@/components/layout/PageWrapper'
import EmptyState from '@/components/ui/EmptyState'
import MonthSelector from '@/components/dashboard/MonthSelector'
import StatCard from '@/components/dashboard/StatCard'
import SpendingPieChart from '@/components/dashboard/SpendingPieChart'
import WeeklyBarChart from '@/components/dashboard/WeeklyBarChart'
import CategoryBreakdown from '@/components/dashboard/CategoryBreakdown'
import RecentTransactions from '@/components/dashboard/RecentTransactions'
import AddIncomeModal from '@/components/dashboard/AddIncomeModal'

const CURRENT_MONTH = new Date().toISOString().slice(0, 7)

function SkeletonBlock({ className = '' }) {
  return <div className={`card animate-pulse ${className}`} />
}

function ChartCarousel({ pieData, weekData, byMonth }) {
  const [active, setActive] = useState(0)
  const [containerWidth, setContainerWidth] = useState(0)
  const containerRef = useRef(null)

  useEffect(() => {
    if (containerRef.current) setContainerWidth(containerRef.current.offsetWidth)
  }, [])

  const slideOffset = containerWidth + 16

  return (
    <div ref={containerRef} className="sm:hidden mb-6 w-full">
      {/* overflow-hidden only wraps the sliding track so dots are never clipped */}
      <div className="overflow-hidden">
        <motion.div
          className="flex gap-4"
          animate={{ x: active === 0 ? 0 : -slideOffset }}
          transition={{ type: 'spring', stiffness: 200, damping: 25, mass: 0.8 }}
          drag="x"
          dragConstraints={{ left: -slideOffset, right: 0 }}
          dragElastic={0.05}
          dragMomentum={false}
          onDragEnd={(_, { offset }) => {
            if (offset.x < -50 && active === 0) setActive(1)
            else if (offset.x > 50 && active === 1) setActive(0)
          }}
        >
          <div style={{ width: '100%', height: '420px', minHeight: '420px', overflow: 'hidden', flexShrink: 0 }}>
            <SpendingPieChart data={pieData} />
          </div>
          <div style={{ width: '100%', height: '420px', minHeight: '420px', overflow: 'hidden', flexShrink: 0 }}>
            <WeeklyBarChart weekData={weekData} monthData={byMonth} />
          </div>
        </motion.div>
      </div>

      <div className="flex justify-center gap-2 pt-3 pb-2">
        {[0, 1].map((i) => (
          <motion.button
            key={i}
            onClick={() => setActive(i)}
            animate={{ scale: i === active ? 1.3 : 1, opacity: i === active ? 1 : 0.35 }}
            transition={{ duration: 0.2 }}
            className={`w-2 h-2 rounded-full ${i === active ? 'bg-brand-light' : 'border border-white/50'}`}
            aria-label={i === 0 ? 'Spending by category' : 'Spending by week'}
          />
        ))}
      </div>
    </div>
  )
}

export default function DashboardPage() {
  const navigate = useNavigate()
  const [month,           setMonth]           = useState(CURRENT_MONTH)
  const [bankFilter,      setBankFilter]      = useState('')
  const [availableBanks,  setAvailableBanks]  = useState([])

  // Manual income state
  const [refreshKey,       setRefreshKey]       = useState(0)
  const [incomeModalOpen,  setIncomeModalOpen]  = useState(false)
  const [editingIncome,    setEditingIncome]    = useState(null)
  const [manualIncomes,    setManualIncomes]    = useState([])
  const [confirmDeleteId,  setConfirmDeleteId]  = useState(null)
  const [isDeletingIncome, setIsDeletingIncome] = useState(false)

  const { loading, error, stats, availableMonths, byMonth } = useDashboardStats(month, bankFilter, refreshKey)

  useEffect(() => {
    supabase
      .from('statements')
      .select('bank_name')
      .then(({ data }) => {
        if (!data) return
        const unique = [...new Set(data.map((r) => r.bank_name).filter(Boolean))]
        setAvailableBanks(unique.sort())
      })
  }, [])

  // Load manual income entries for the selected month
  const loadManualIncomes = useCallback(async () => {
    const [y, m] = month.split('-').map(Number)
    const nextM = m === 12
      ? `${y + 1}-01`
      : `${y}-${String(m + 1).padStart(2, '0')}`
    const { data } = await supabase
      .from('transactions')
      .select('id, description, amount, transaction_date')
      .eq('category', 'income')
      .is('statement_id', null)
      .gte('transaction_date', `${month}-01`)
      .lt('transaction_date', `${nextM}-01`)
      .order('transaction_date', { ascending: false })
    setManualIncomes(data ?? [])
  }, [month])

  useEffect(() => { loadManualIncomes() }, [loadManualIncomes])

  function handleIncomeSaved() {
    loadManualIncomes()
    setRefreshKey((k) => k + 1)
  }

  async function handleConfirmDelete(id) {
    setIsDeletingIncome(true)
    try {
      const { error: err } = await supabase.from('transactions').delete().eq('id', id)
      if (err) throw err
      setConfirmDeleteId(null)
      loadManualIncomes()
      setRefreshKey((k) => k + 1)
    } catch {
      // leave confirm open so user can retry
    } finally {
      setIsDeletingIncome(false)
    }
  }

  const noDataAtAll    = !loading && !stats && availableMonths.length === 0
  const noDataForMonth = !loading && !stats && availableMonths.length > 0

  return (
    <AppShell>
      <PageWrapper className="max-w-6xl mx-auto px-4 pt-4 pb-8 sm:py-8">

        {/* Header row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 sm:mb-6">
          <div className="flex flex-wrap items-center gap-3">
            <MonthSelector month={month} onChange={setMonth} />
            {availableBanks.length > 1 && (
              <select
                value={bankFilter}
                onChange={(e) => setBankFilter(e.target.value)}
                className="bg-surface-100 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand transition-colors cursor-pointer appearance-none"
                aria-label="Filter by bank"
              >
                <option value="">All banks</option>
                {availableBanks.map((b) => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            )}
          </div>
          <button
            onClick={() => navigate(ROUTES.UPLOAD)}
            className="text-sm text-white/40 hover:text-white transition-colors self-start sm:self-auto"
          >
            + Upload statement
          </button>
        </div>

        {/* Manual income entries */}
        {manualIncomes.length > 0 && (
          <motion.div {...FADE_IN} className="mb-4 sm:mb-6 flex flex-col gap-2">
            {manualIncomes.map((entry) => (
              <div
                key={entry.id}
                className="flex items-center gap-3 bg-white/[0.03] border border-white/[0.06] rounded-xl px-4 py-2.5"
              >
                <span className="flex-1 text-sm text-white/70 truncate">{entry.description}</span>
                {confirmDeleteId === entry.id ? (
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs text-white/40">Remove?</span>
                    <button
                      onClick={() => handleConfirmDelete(entry.id)}
                      disabled={isDeletingIncome}
                      className="text-xs text-red-400 hover:text-red-300 font-medium transition-colors disabled:opacity-50"
                    >
                      Yes
                    </button>
                    <button
                      onClick={() => setConfirmDeleteId(null)}
                      disabled={isDeletingIncome}
                      className="text-xs text-white/40 hover:text-white transition-colors"
                    >
                      No
                    </button>
                  </div>
                ) : (
                  <>
                    <span className="text-sm font-semibold text-green-400 tabular-nums shrink-0">
                      +{formatCurrency(entry.amount)}
                    </span>
                    <button
                      onClick={() => { setEditingIncome(entry); setIncomeModalOpen(true) }}
                      className="text-white/25 hover:text-white/70 transition-colors shrink-0 p-1 text-sm leading-none"
                      aria-label="Edit income entry"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => setConfirmDeleteId(entry.id)}
                      className="text-white/25 hover:text-red-400 transition-colors shrink-0 p-1 text-sm leading-none"
                      aria-label="Delete income entry"
                    >
                      🗑️
                    </button>
                  </>
                )}
              </div>
            ))}
          </motion.div>
        )}

        {/* Error banner */}
        {error && (
          <motion.p {...FADE_IN} className="text-red-400 text-sm mb-6 px-1">
            {error}
          </motion.p>
        )}

        {/* No data at all — first-time user */}
        {noDataAtAll && (
          <EmptyState
            icon="📊"
            heading="No data yet"
            subtext="Upload your first bank statement to see your spending insights here."
            action={{ label: 'Upload a statement', onClick: () => navigate(ROUTES.UPLOAD) }}
          />
        )}

        {/* No data for this specific month */}
        {noDataForMonth && (
          <motion.div {...FADE_IN} className="text-center py-16">
            <p className="text-4xl mb-4">📅</p>
            <p className="text-white font-semibold mb-2">No data for this month</p>
            <p className="text-white/40 text-sm mb-6">
              You have statements for:{' '}
              {availableMonths.slice(0, 4).map((m, i) => (
                <span key={m}>
                  <button
                    onClick={() => setMonth(m)}
                    className="text-brand-light hover:text-white underline transition-colors"
                  >
                    {new Date(m + '-01').toLocaleString('default', { month: 'long', year: 'numeric' })}
                  </button>
                  {i < Math.min(availableMonths.length, 4) - 1 ? ', ' : ''}
                </span>
              ))}
            </p>
            <button
              onClick={() => navigate(ROUTES.UPLOAD)}
              className="text-sm text-white/40 hover:text-white transition-colors underline"
            >
              Upload a statement for this month
            </button>
          </motion.div>
        )}

        {/* Dashboard — loading skeletons */}
        {loading && (
          <>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 mb-6">
              <SkeletonBlock className="h-20" />
              <SkeletonBlock className="h-20" />
              <SkeletonBlock className="h-20 col-span-2 sm:col-span-1" />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
              <SkeletonBlock className="h-72" />
              <SkeletonBlock className="h-72" />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <SkeletonBlock className="h-64" />
              <SkeletonBlock className="h-64" />
            </div>
          </>
        )}

        {/* Dashboard — data */}
        {!loading && stats && (
          <>
            {/* KPI cards */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 mb-6">
              <StatCard
                label="Total spend"
                value={formatCurrency(stats.totalSpend)}
                color="text-red-400"
                icon="💸"
              />
              <StatCard
                label="Total income"
                value={formatCurrency(stats.totalIncome)}
                color="text-green-400"
                icon="💰"
                onAddIncome={() => { setEditingIncome(null); setIncomeModalOpen(true) }}
              />
              <div className="col-span-2 sm:col-span-1">
                <StatCard
                  label="Net flow"
                  value={formatCurrency(stats.netFlow)}
                  color={stats.netFlow >= 0 ? 'text-green-400' : 'text-red-400'}
                  icon={stats.netFlow >= 0 ? '📈' : '📉'}
                />
              </div>
            </div>

            {/* Charts — mobile swipeable carousel */}
            <ChartCarousel
              pieData={stats.byCategory}
              weekData={stats.byWeek}
              byMonth={byMonth}
            />

            {/* Charts — desktop grid */}
            <div className="hidden sm:grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
              <SpendingPieChart data={stats.byCategory} />
              <WeeklyBarChart weekData={stats.byWeek} monthData={byMonth} />
            </div>

            {/* Bottom row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <CategoryBreakdown categories={stats.topCategories} />
              <RecentTransactions transactions={stats.recentTransactions} />
            </div>
          </>
        )}

      </PageWrapper>

      <AddIncomeModal
        isOpen={incomeModalOpen}
        onClose={() => { setIncomeModalOpen(false); setEditingIncome(null) }}
        onSaved={handleIncomeSaved}
        month={month}
        editingEntry={editingIncome}
      />
    </AppShell>
  )
}
