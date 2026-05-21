import { motion } from 'framer-motion'
import { SLIDE_UP } from '@/constants/animation'

export default function StatCard({ label, value, color = 'text-white', icon, loading }) {
  if (loading) {
    return (
      <div className="card animate-pulse p-3 sm:p-4">
        <div className="h-3 w-16 bg-white/5 rounded-full mb-2" />
        <div className="h-6 w-28 bg-white/5 rounded-full" />
      </div>
    )
  }
  return (
    <motion.div {...SLIDE_UP} className="card p-3 sm:p-4">
      <p className="text-[11px] sm:text-xs text-white/40 uppercase tracking-wide mb-1 flex items-center gap-1.5">
        {icon && <span>{icon}</span>}
        {label}
      </p>
      <p className={`text-lg sm:text-2xl font-bold tabular-nums truncate ${color}`}>{value}</p>
    </motion.div>
  )
}
