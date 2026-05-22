import { motion } from 'framer-motion'

export default function ParseProgress({ progress }) {
  const clamped = Math.min(100, Math.max(0, Math.round(progress)))

  return (
    <div className="w-full flex flex-col items-center gap-6 py-10">
      <span className="text-4xl font-bold text-white tracking-tight">
        {clamped}%
      </span>
      <div className="h-2 bg-white/10 rounded-full w-full max-w-md mx-auto overflow-hidden">
        <motion.div
          className="bg-white rounded-full h-full"
          initial={{ width: '0%' }}
          animate={{ width: `${clamped}%` }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        />
      </div>
    </div>
  )
}
