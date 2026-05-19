import { motion } from 'framer-motion'

function formatMonthLabel(month) {
  const [year, mon] = month.split('-').map(Number)
  return new Date(year, mon - 1, 1).toLocaleDateString('en-ZA', { month: 'long', year: 'numeric' })
}

function addMonths(month, delta) {
  const [year, mon] = month.split('-').map(Number)
  const d = new Date(year, mon - 1 + delta, 1)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

const CURRENT_MONTH = new Date().toISOString().slice(0, 7)

const btnClass =
  'w-9 h-9 flex items-center justify-center rounded-xl bg-surface-100 text-xl leading-none ' +
  'text-white/50 hover:text-white hover:bg-white/10 transition-all ' +
  'disabled:opacity-25 disabled:cursor-not-allowed'

export default function MonthSelector({ month, onChange }) {
  return (
    <div className="flex items-center gap-3">
      <button
        className={btnClass}
        onClick={() => onChange(addMonths(month, -1))}
        aria-label="Previous month"
      >
        ‹
      </button>

      <motion.span
        key={month}
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.15 }}
        className="text-base sm:text-lg font-semibold text-white min-w-[160px] text-center"
      >
        {formatMonthLabel(month)}
      </motion.span>

      <button
        className={btnClass}
        onClick={() => onChange(addMonths(month, 1))}
        disabled={month >= CURRENT_MONTH}
        aria-label="Next month"
      >
        ›
      </button>
    </div>
  )
}
