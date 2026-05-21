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
    <motion.div {...SLIDE_UP} className="card p-3 sm:p-4 relative overflow-hidden">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      <p className="text-[10px] sm:text-[11px] text-white/35 uppercase tracking-widest mb-1.5 flex items-center gap-1.5 font-medium">
        {icon && <span>{icon}</span>}
        {label}
      </p>
      <p className={`text-xl sm:text-2xl font-bold tabular-nums truncate ${color}`}>{value}</p>
    </motion.div>
  )
}
