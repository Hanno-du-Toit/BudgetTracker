import { motion } from 'framer-motion'
import { FADE_IN } from '@/constants/animation'

export default function ParseProgress({ progress, parseStep }) {
  return (
    <motion.div {...FADE_IN} className="flex flex-col items-center gap-6 w-full py-8">
      <div className="text-4xl">
        <motion.span
          animate={{ rotate: [0, 10, -10, 10, 0] }}
          transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
          style={{ display: 'inline-block' }}
        >
          ⚙️
        </motion.span>
      </div>

      <div className="text-center">
        <p className="text-white font-medium">{parseStep || 'Processing…'}</p>
        <p className="text-white/40 text-sm mt-1">
          This happens in your browser — your data stays private
        </p>
      </div>

      {/* Progress bar */}
      <div className="w-full max-w-sm bg-surface-100 rounded-full h-2 overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-brand to-brand-light rounded-full"
          initial={{ width: '0%' }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
        />
      </div>

      <p className="text-xs text-white/25">{Math.round(progress)}%</p>
    </motion.div>
  )
}
