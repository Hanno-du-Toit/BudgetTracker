import { motion } from 'framer-motion'
import { PlusCircle, Pencil } from 'lucide-react'
import { SLIDE_UP } from '@/constants/animation'
import { formatCurrency } from '@/utils/formatters'

export default function StatCard({ label, value, color = 'text-white', icon, loading, onAddIncome, expectedIncome, incomeLabel }) {
  if (loading) {
    return (
      <div className="card animate-pulse p-3 sm:p-4 min-h-[100px]">
        <div className="h-3 w-16 bg-white/5 rounded-full mb-2" />
        <div className="h-6 w-28 bg-white/5 rounded-full" />
      </div>
    )
  }

  const EditIcon = expectedIncome != null ? Pencil : PlusCircle

  return (
    <motion.div {...SLIDE_UP} className="card p-3 sm:p-4 relative overflow-hidden min-h-[100px]">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      <p className="text-[10px] sm:text-[11px] text-white/35 uppercase tracking-widest mb-1.5 flex items-center gap-1.5 font-medium">
        {icon && <span>{icon}</span>}
        {label}
        {onAddIncome && (
          <button
            onClick={onAddIncome}
            className="ml-auto text-white/40 hover:text-white/80 transition-colors duration-150 cursor-pointer"
            aria-label={expectedIncome != null ? 'Edit monthly income' : 'Set monthly income'}
          >
            <EditIcon className="w-4 h-4" />
          </button>
        )}
      </p>
      <p className={`text-xl sm:text-2xl font-bold tabular-nums truncate ${color}`}>{value}</p>
      {/* Reserve consistent space — shown when set, invisible placeholder otherwise */}
      <p className="text-xs text-white/40 mt-1 tabular-nums h-4">
        {expectedIncome != null
          ? <>{incomeLabel ? `${incomeLabel}: ` : 'Expected: '}{formatCurrency(expectedIncome)}</>
          : null}
      </p>
    </motion.div>
  )
}
