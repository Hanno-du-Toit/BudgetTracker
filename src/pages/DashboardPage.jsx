import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
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
    <div ref={containerRef} className="sm:hidden mb-6 overflow-hidden w-full">
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

      <div className="flex justify-center gap-2 mt-3">
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
  const [month, setMonth] = useState(CURRENT_MONTH)
  const { loading, error, stats, availableMonths, byMonth } = useDashboardStats(month)

  const noDataAtAll    = !loading && !stats && availableMonths.length === 0
  const noDataForMonth = !loading && !stats && availableMonths.length > 0

  return (
    <AppShell>
      <PageWrapper className="max-w-6xl mx-auto px-4 pt-4 pb-8 sm:py-8">

        {/* Header row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 sm:mb-8">
          <MonthSelector month={month} onChange={setMonth} />
          <button
            onClick={() => navigate(ROUTES.UPLOAD)}
            className="text-sm text-white/40 hover:text-white transition-colors self-start sm:self-auto"
          >
            + Upload statement
          </button>
        </div>

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
                <button
                  key={m}
                  onClick={() => setMonth(m)}
                  className="text-brand-light hover:text-white underline transition-colors"
                >
                  {m}{i < Math.min(availableMonths.length, 4) - 1 ? ', ' : ''}
                </button>
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
              <CategoryBreakdown  categories={stats.topCategories} />
              <RecentTransactions transactions={stats.recentTransactions} />
            </div>
          </>
        )}

      </PageWrapper>
    </AppShell>
  )
}
